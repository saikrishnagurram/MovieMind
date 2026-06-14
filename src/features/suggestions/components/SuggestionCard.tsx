import React from 'react';
import { Star, Calendar, XCircle, ChevronRight } from 'lucide-react';
import type { NormalizedMedia } from '../types';
import './SuggestionCard.css';

interface SuggestionCardProps {
  media: NormalizedMedia;
  onNext: () => void;
  onIgnore: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ media, onNext, onIgnore }) => {
  return (
    <div className="suggestion-card fade-in">
      <div className="card-content">
        <div className="poster-container">
          {media.posterUrl ? (
            <img src={media.posterUrl} alt={media.title} className="poster-image" />
          ) : (
            <div className="poster-placeholder">No Image Available</div>
          )}
          <div className="rating-badge">
            <Star size={16} fill="currentColor" />
            <span>{media.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="info-container">
          <div className="info-header">
            <span className="media-type">{media.type.toUpperCase()}</span>
            <div className="year-container">
              <Calendar size={16} />
              <span>{media.year}</span>
            </div>
          </div>
          
          <h2 className="media-title">{media.title}</h2>
          
          {media.watchProviders && media.watchProviders.length > 0 && (
            <div className="watch-providers">
              <span className="watch-label">WHERE TO WATCH:</span>
              <div className="provider-icons">
                {media.watchProviders.map(provider => (
                  <div key={provider.provider_id} className="provider-tooltip" title={provider.provider_name}>
                    <img 
                      src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                      alt={provider.provider_name} 
                      className="provider-logo"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="media-overview">{media.overview || 'No description available.'}</p>
          
          <div className="card-actions">
            <button className="btn-primary flex-center" onClick={onNext}>
              <span>Next Suggestion</span>
              <ChevronRight size={18} />
            </button>
            <button className="btn-secondary flex-center" onClick={onIgnore}>
              <XCircle size={18} />
              <span>Never Show Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
