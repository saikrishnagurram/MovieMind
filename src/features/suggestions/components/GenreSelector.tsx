import React, { useState, useEffect } from 'react';
import { fetchMovieGenres, fetchTvGenres } from '../../../services/tmdbApi';
import type { Genre, Language } from '../types';
import { Check, Loader2, Globe } from 'lucide-react';
import './GenreSelector.css';

interface GenreSelectorProps {
  onSettingsSelected: (genreIds: number[], languageCode: string) => void;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ml', name: 'Malayalam' },
];

export const GenreSelector: React.FC<GenreSelectorProps> = ({ onSettingsSelected }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          fetchMovieGenres(),
          fetchTvGenres(),
        ]);
        
        // Combine and remove duplicates
        const combined = [...movieGenres, ...tvGenres];
        const unique = Array.from(new Map(combined.map(g => [g.id, g])).values());
        setGenres(unique.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load genres', error);
      } finally {
        setLoading(false);
      }
    };
    loadGenres();
  }, []);

  const toggleGenre = (id: number) => {
    setSelectedGenreIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (selectedGenreIds.length > 0) {
      onSettingsSelected(selectedGenreIds, selectedLanguage);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={48} />
        <p>Loading genres...</p>
      </div>
    );
  }

  return (
    <div className="genre-selector fade-in">
      <h1 className="selector-title">What are you in the mood for?</h1>
      
      <div className="section-container">
        <h2 className="section-title"><Globe size={20} /> Preferred Language</h2>
        <div className="language-selector">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`lang-chip ${selectedLanguage === lang.code ? 'selected' : ''}`}
              onClick={() => setSelectedLanguage(lang.code)}
            >
              {lang.name}
              {selectedLanguage === lang.code && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      <div className="section-container">
        <h2 className="section-title">Favorite Genres</h2>
        <p className="selector-subtitle">Select genres to get personalized suggestions.</p>
        <div className="genres-grid">
          {genres.map(genre => (
            <button
              key={genre.id}
              className={`genre-chip ${selectedGenreIds.includes(genre.id) ? 'selected' : ''}`}
              onClick={() => toggleGenre(genre.id)}
            >
              {genre.name}
              {selectedGenreIds.includes(genre.id) && <Check size={16} />}
            </button>
          ))}
        </div>
      </div>
      
      <div className="selector-footer">
        <button 
          className="btn-primary start-button" 
          disabled={selectedGenreIds.length === 0}
          onClick={handleStart}
        >
          Find Suggestions
        </button>
      </div>
    </div>
  );
};
