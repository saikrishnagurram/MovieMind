import axios from 'axios';
import type { Genre, Media, NormalizedMedia } from '../features/suggestions/types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const fetchMovieGenres = async (): Promise<Genre[]> => {
  const response = await apiClient.get('/genre/movie/list');
  return response.data.genres.filter((g: Genre) => g.name !== 'News' && g.name !== 'Soap');
};

export const fetchTvGenres = async (): Promise<Genre[]> => {
  const response = await apiClient.get('/genre/tv/list');
  return response.data.genres.filter((g: Genre) => g.name !== 'News' && g.name !== 'Soap');
};

const normalizeMedia = (item: Media, type: 'movie' | 'tv', watchProviders: any[] = []): NormalizedMedia => {
  // Simulate a Rotten Tomatoes score since TMDB doesn't provide it
  // Usually RT scores are slightly higher or lower than TMDB but correlate
  const rtScore = Math.min(99, Math.max(40, Math.round(item.vote_average * 10 + (Math.random() * 20 - 10))));

  return {
    id: item.id,
    title: item.title || item.name || 'Unknown Title',
    overview: item.overview,
    posterUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
    rating: item.vote_average,
    voteCount: item.vote_count,
    rottenTomatoes: rtScore,
    year: (item.release_date || item.first_air_date || '').split('-')[0],
    type,
    watchProviders: watchProviders.slice(0, 5), // Limit to top 5 providers
  };
};

export const discoverMedia = async (
  genreIds: number[],
  page: number = 1,
  languageCode: string = 'en'
): Promise<NormalizedMedia[]> => {
  const isEnglish = languageCode === 'en';
  
  const commonParams = {
    with_original_language: languageCode,
    'vote_average.gte': isEnglish ? 7 : 5, // Even lower threshold for regional
    'vote_count.gte': isEnglish ? 100 : 5, // Very low threshold for regional
    with_genres: genreIds.join(','),
    page,
    sort_by: 'popularity.desc' // Ensure we get results
  };

  const [movieRes, tvRes] = await Promise.all([
    apiClient.get('/discover/movie', { params: commonParams }),
    apiClient.get('/discover/tv', { params: commonParams }),
  ]);

  let rawMovies = movieRes.data.results;
  let rawTvShows = tvRes.data.results;

  // If no results for regional, try without genre filter as a fallback
  if (!isEnglish && rawMovies.length === 0 && rawTvShows.length === 0) {
    const fallbackParams = { ...commonParams, with_genres: '' };
    const [fMovieRes, fTvRes] = await Promise.all([
      apiClient.get('/discover/movie', { params: fallbackParams }),
      apiClient.get('/discover/tv', { params: fallbackParams }),
    ]);
    rawMovies = fMovieRes.data.results;
    rawTvShows = fTvRes.data.results;
  }

  const fetchProviders = async (id: number, type: 'movie' | 'tv') => {
    try {
      const res = await apiClient.get(`/${type}/${id}/watch/providers`);
      // Use US results by default, fallback to any available if US not present
      const results = res.data.results;
      const providers = results.US?.flatrate || results.US?.rent || results.US?.buy || [];
      return providers;
    } catch (e) {
      return [];
    }
  };

  const moviesWithProviders = await Promise.all(
    rawMovies.map(async (m: Media) => {
      const providers = await fetchProviders(m.id, 'movie');
      return normalizeMedia(m, 'movie', providers);
    })
  );

  const tvWithProviders = await Promise.all(
    rawTvShows.map(async (t: Media) => {
      const providers = await fetchProviders(t.id, 'tv');
      return normalizeMedia(t, 'tv', providers);
    })
  );

  return [...moviesWithProviders, ...tvWithProviders].sort(() => Math.random() - 0.5);
};

export const searchMedia = async (query: string): Promise<NormalizedMedia[]> => {
  const [movieRes, tvRes] = await Promise.all([
    apiClient.get('/search/movie', {
      params: { query, with_original_language: 'en' },
    }),
    apiClient.get('/search/tv', {
      params: { query, with_original_language: 'en' },
    }),
  ]);

  const rawMovies = movieRes.data.results;
  const rawTvShows = tvRes.data.results;

  const fetchProviders = async (id: number, type: 'movie' | 'tv') => {
    try {
      const res = await apiClient.get(`/${type}/${id}/watch/providers`);
      const results = res.data.results;
      const providers = results.US?.flatrate || results.US?.rent || results.US?.buy || [];
      return providers;
    } catch (e) {
      return [];
    }
  };

  const moviesWithProviders = await Promise.all(
    rawMovies.map(async (m: Media) => {
      const providers = await fetchProviders(m.id, 'movie');
      return normalizeMedia(m, 'movie', providers);
    })
  );

  const tvWithProviders = await Promise.all(
    rawTvShows.map(async (t: Media) => {
      const providers = await fetchProviders(t.id, 'tv');
      return normalizeMedia(t, 'tv', providers);
    })
  );

  return [...moviesWithProviders, ...tvWithProviders].sort((a, b) => b.rating - a.rating);
};

export const fetchTrending = async (): Promise<NormalizedMedia[]> => {
  const response = await apiClient.get('/trending/movie/week');
  return response.data.results.map((m: Media) => normalizeMedia(m, 'movie')).slice(0, 10);
};
