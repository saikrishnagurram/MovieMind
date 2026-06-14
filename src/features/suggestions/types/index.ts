export interface Genre {
  id: number;
  name: string;
}

export interface Media {
  id: number;
  title?: string; // Movies have title
  name?: string; // TV shows have name
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string; // Movies
  first_air_date?: string; // TV
  media_type: 'movie' | 'tv';
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface NormalizedMedia {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  rating: number;
  year: string;
  type: 'movie' | 'tv';
  watchProviders?: WatchProvider[];
}
