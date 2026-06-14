import React, { useState, useEffect } from 'react';
import { fetchMovieGenres, fetchTvGenres } from '../../../services/tmdbApi';
import type { Genre } from '../types';
import { Check, Loader2 } from 'lucide-react';
import './GenreSelector.css';

interface GenreSelectorProps {
  onGenresSelected: (ids: number[]) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({ onGenresSelected }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          fetchMovieGenres(),
          fetchTvGenres(),
        ]);
        
        // Combine and remove duplicates (some genres like Action exist in both)
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
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (selectedIds.length > 0) {
      onGenresSelected(selectedIds);
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
      <p className="selector-subtitle">Select your favorite genres to get personalized suggestions.</p>
      
      <div className="genres-grid">
        {genres.map(genre => (
          <button
            key={genre.id}
            className={`genre-chip ${selectedIds.includes(genre.id) ? 'selected' : ''}`}
            onClick={() => toggleGenre(genre.id)}
          >
            {genre.name}
            {selectedIds.includes(genre.id) && <Check size={16} />}
          </button>
        ))}
      </div>
      
      <div className="selector-footer">
        <button 
          className="btn-primary start-button" 
          disabled={selectedIds.length === 0}
          onClick={handleStart}
        >
          Find Suggestions
        </button>
      </div>
    </div>
  );
};
