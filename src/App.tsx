import { useState, useEffect } from 'react';
import { GenreSelector } from './features/suggestions/components/GenreSelector';
import { SuggestionCard } from './features/suggestions/components/SuggestionCard';
import { useSuggestions } from './features/suggestions/hooks/useSuggestions';
import { Loader2, Settings, RefreshCcw, Film, Search, Dices, TrendingUp } from 'lucide-react';
import { fetchTrending } from './services/tmdbApi';
import type { NormalizedMedia } from './features/suggestions/types';
import './styles/index.css';

function App() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState<NormalizedMedia[]>([]);
  
  const {
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
  } = useSuggestions(selectedGenres, selectedLanguage);

  useEffect(() => {
    const loadTrending = async () => {
      const data = await fetchTrending();
      setTrending(data);
    };
    loadTrending();
  }, []);

  const handleSettingsSelected = (genreIds: number[], languageCode: string) => {
    setSelectedGenres(genreIds);
    setSelectedLanguage(languageCode);
  };

  const handleReset = () => {
    setSelectedGenres([]);
    setSearchQuery('');
    resetSuggestions();
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      if (selectedGenres.length === 0) {
        setSelectedGenres([-1]); // Dummy to switch view
      }
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo" onClick={handleReset} style={{ cursor: 'pointer' }}>
            <Film className="logo-icon" size={32} />
            <span>MovieMind</span>
          </div>
          
          <form className="search-bar" onSubmit={onSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search for a movie or TV show..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Search size={20} />
            </button>
          </form>

          <div className="header-actions">
            <button 
              className="btn-icon" 
              onClick={() => setShowSettings(!showSettings)}
              title="Manage Ignored Items"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-layout">
        <div className="content-area">
          {showSettings ? (
            <div className="settings-view fade-in">
              <h2>Ignored Suggestions ({ignoredIds.length})</h2>
              <p>You can remove items from this list to see them again.</p>
              {ignoredIds.length === 0 ? (
                <p className="empty-state">No ignored items yet.</p>
              ) : (
                <div className="ignored-list">
                  {ignoredIds.map(id => (
                    <div key={id} className="ignored-item">
                      <span>Media ID: {id}</span>
                      <button className="btn-outline" onClick={() => removeIgnored(id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-primary" onClick={() => setShowSettings(false)}>Close</button>
            </div>
          ) : selectedGenres.length === 0 ? (
            <GenreSelector onSettingsSelected={handleSettingsSelected} />
          ) : (
            <div className="suggestion-view">
              {loading && !currentSuggestion ? (
                <div className="loading-state">
                  <Loader2 className="spinner" size={48} />
                  <p>Finding the perfect suggestion...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button className="btn-primary" onClick={handleReset}>Try Again</button>
                </div>
              ) : currentSuggestion ? (
                <>
                  <SuggestionCard 
                    media={currentSuggestion} 
                    onNext={nextSuggestion} 
                    onIgnore={ignoreSuggestion} 
                  />
                  <div className="view-footer">
                    <button className="btn-random flex-center" onClick={handleRandom}>
                      <Dices size={18} />
                      <span>Random Pick</span>
                    </button>
                    <button className="btn-reset flex-center" onClick={handleReset}>
                      <RefreshCcw size={18} />
                      <span>Change Genres / Clear</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>No results found!</p>
                  <button className="btn-primary" onClick={handleReset}>Back to Genres</button>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="sidebar">
          <div className="sidebar-header">
            <TrendingUp size={20} />
            <h3>Popular This Week</h3>
          </div>
          <div className="trending-list">
            {trending.map(movie => (
              <div key={movie.id} className="trending-item">
                <img src={movie.posterUrl || ''} alt={movie.title} />
                <div className="trending-info">
                  <span className="trending-title">{movie.title}</span>
                  <span className="trending-meta">{movie.year} • {movie.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <style>{`
        .main-layout {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
          padding: 2rem;
        }

        .sidebar {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #dddfe2;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--primary);
        }

        .trending-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .trending-item {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .trending-item img {
          width: 50px;
          height: 75px;
          object-fit: cover;
          border-radius: 4px;
        }

        .trending-info {
          display: flex;
          flex-direction: column;
        }

        .trending-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-main);
          line-height: 1.2;
        }

        .trending-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .btn-random {
          background-color: #6c5ce7;
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .btn-reset {
          background-color: #ff7675;
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .view-footer {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-bottom: 3rem;
        }

        @media (max-width: 1024px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
          .sidebar {
            display: none;
          }
        }

        .app-header {
          background-color: white;
...
          border-bottom: 1px solid #dddfe2;
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          flex-shrink: 0;
        }
        
        .search-bar {
          flex: 1;
          max-width: 600px;
          display: flex;
          background: #f0f2f5;
          border-radius: 20px;
          padding: 0.2rem 0.5rem;
          border: 1px solid #dddfe2;
        }
        
        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          padding: 0.6rem 1rem;
          font-size: 1rem;
          outline: none;
          color: var(--text-main);
        }
        
        .search-btn {
          background: none;
          color: var(--text-muted);
          padding: 0.5rem;
        }
        
        .search-btn:hover {
          color: var(--primary);
        }
        
        .btn-icon {
          background: none;
          color: var(--text-muted);
          padding: 0.5rem;
        }
        
        .btn-icon:hover {
          color: var(--primary);
        }
        
        .view-footer {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          padding-bottom: 3rem;
        }
        
        .settings-view {
          background-color: white;
          padding: 2.5rem;
          border-radius: 12px;
          max-width: 600px;
          margin: 2rem auto;
          box-shadow: var(--shadow);
        }
        
        .ignored-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #f0f2f5;
          margin-bottom: 0.5rem;
          border-radius: 8px;
        }
        
        @media (max-width: 768px) {
          .app-header {
            padding: 1rem;
          }
          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          .logo {
            justify-content: center;
          }
          .search-bar {
            max-width: none;
            width: 100%;
          }
          .header-actions {
            display: none; /* Hide settings on small mobile to save space */
          }
        }
      `}</style>
    </div>
  );
}

export default App;
