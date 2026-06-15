import { useState, useCallback, useEffect } from 'react';
import type { NormalizedMedia } from '../types';
import { discoverMedia, searchMedia } from '../../../services/tmdbApi';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

export function useSuggestions(genreIds: number[], languageCode: string = 'en') {
  const [suggestions, setSuggestions] = useState<NormalizedMedia[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [ignoredIds, setIgnoredIds] = useLocalStorage<number[]>('ignored_media_ids', []);
  const [seenIds, setSeenIds] = useLocalStorage<number[]>('seen_media_ids', []);

  const fetchMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      console.log('Fetching media for:', { genreIds, page, languageCode });
      const results = await discoverMedia(genreIds, page, languageCode);
      console.log('Raw results count:', results.length);
      
      // Filter out ignored and seen
      const filtered = results.filter(
        item => !ignoredIds.includes(item.id) && !seenIds.includes(item.id)
      );
      console.log('Filtered results count:', filtered.length);

      if (filtered.length === 0 && results.length > 0 && page < 5) {
        console.log('No new results on this page, trying next page...');
        setPage(prev => prev + 1);
        // The useEffect will trigger fetchMore again because suggestions.length is still 0
      } else {
        setSuggestions(prev => [...prev, ...filtered]);
        setPage(prev => prev + 1);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch suggestions. Please check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [genreIds, page, loading, ignoredIds, seenIds, languageCode]);

  useEffect(() => {
    if (genreIds.length > 0 && suggestions.length === 0) {
      fetchMore();
    }
  }, [genreIds, suggestions.length, fetchMore, languageCode]);

  const currentSuggestion = suggestions[currentIndex] || null;

  const nextSuggestion = () => {
    if (currentSuggestion) {
      setSeenIds(prev => [...prev, currentSuggestion.id]);
    }
    
    if (currentIndex + 1 >= suggestions.length) {
      fetchMore();
    }
    setCurrentIndex(prev => prev + 1);
  };

  const ignoreSuggestion = () => {
    if (currentSuggestion) {
      setIgnoredIds(prev => [...prev, currentSuggestion.id]);
      // Also remove from current list to be sure
      setSuggestions(prev => prev.filter(item => item.id !== currentSuggestion.id));
      // Don't increment index because the list shifted or we just need the next one
    }
  };

  const resetSuggestions = () => {
    setSuggestions([]);
    setCurrentIndex(0);
    setPage(1);
  };

  const removeIgnored = (id: number) => {
    setIgnoredIds(prev => prev.filter(ignoredId => ignoredId !== id));
  };

  const handleRandom = () => {
    if (suggestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * suggestions.length);
      setCurrentIndex(randomIndex);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const results = await searchMedia(query);
      setSuggestions(results);
      setCurrentIndex(0);
      setError(null);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    currentSuggestion,
    loading,
    error,
    nextSuggestion,
    ignoreSuggestion,
    resetSuggestions,
    ignoredIds,
    removeIgnored,
    handleSearch,
    handleRandom
  };
}
