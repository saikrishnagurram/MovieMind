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
    handleRandom,
    selectMedia
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

  const handleSidebarClick = (movie: NormalizedMedia) => {
    selectMedia(movie);
    if (selectedGenres.length === 0) {
      setSelectedGenres([-1]); // Switch to suggestion view
    }
    // Scroll to top to see the movie
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="container apple-theme">
      <header className="app-header glass">
        <div className="header-content">
          <div className="logo" onClick={handleReset} style={{ cursor: 'pointer' }}>
            <Film className="logo-icon" size={28} />
            <span>MovieMind</span>
          </div>
          
          <form className="search-bar" onSubmit={onSearchSubmit}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search movies, TV shows..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="header-actions">
            <button 
              className="btn-icon" 
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-layout">
        <div className="content-area">
          {showSettings ? (
            <div className="settings-view fade-in">
              <h2>Ignored Items</h2>
              <div className="ignored-list">
                {ignoredIds.map(id => (
                  <div key={id} className="ignored-item">
                    <span>ID: {id}</span>
                    <button className="btn-link" onClick={() => removeIgnored(id)}>Remove</button>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setShowSettings(false)}>Done</button>
            </div>
          ) : selectedGenres.length === 0 ? (
            <GenreSelector onSettingsSelected={handleSettingsSelected} />
          ) : (
            <div className="suggestion-view">
              {loading && !currentSuggestion ? (
                <div className="loading-state">
                  <Loader2 className="spinner" size={48} />
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button className="btn-primary" onClick={handleReset}>Retry</button>
                </div>
              ) : currentSuggestion ? (
                <>
                  <SuggestionCard 
                    media={currentSuggestion} 
                    onNext={nextSuggestion} 
                    onIgnore={ignoreSuggestion} 
                  />
                  <div className="view-footer">
                    <button className="btn-apple-secondary" onClick={handleRandom}>
                      <Dices size={18} />
                      <span>Random Pick</span>
                    </button>
                    <button className="btn-apple-danger" onClick={handleReset}>
                      <RefreshCcw size={18} />
                      <span>Change Preferences</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>End of suggestions.</p>
                  <button className="btn-primary" onClick={handleReset}>Restart</button>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="sidebar">
          <div className="sidebar-header">
            <TrendingUp size={18} />
            <h3>Trending Now</h3>
          </div>
          <div className="trending-list">
            {trending.map(movie => (
              <div 
                key={movie.id} 
                className="trending-item clickable" 
                onClick={() => handleSidebarClick(movie)}
              >
                <div className="trending-poster-wrapper">
                  <img src={movie.posterUrl || ''} alt={movie.title} />
                  <div className="trending-score">{Math.round(movie.rating * 10)}%</div>
                </div>
                <div className="trending-info">
                  <span className="trending-title">{movie.title}</span>
                  <span className="trending-meta">{movie.year}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <style>{`
        :root {
          --apple-blue: #0071e3;
          --apple-gray: #f5f5f7;
          --apple-text: #1d1d1f;
          --glass-bg: rgba(255, 255, 255, 0.72);
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Myriad Set Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
          background-color: var(--apple-gray);
          color: var(--apple-text);
        }

        .glass {
          background-color: var(--glass-bg);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
        }

        .app-header {
          position: sticky;
          top: 0;
          width: 100%;
          z-index: 1000;
          height: 52px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .header-content {
          width: 100%;
          max-width: 1024px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .search-bar {
          background: rgba(0,0,0,0.05);
          border-radius: 8px;
          padding: 4px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 400px;
          transition: all 0.3s ease;
        }

        .search-bar:focus-within {
          background: white;
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.3);
        }

        .search-bar input {
          background: transparent;
          border: none;
          padding: 6px 0;
          width: 100%;
          outline: none;
          font-size: 0.9rem;
        }

        .main-layout {
          max-width: 1024px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 40px;
          padding: 40px 22px;
        }

        .sidebar {
          position: sticky;
          top: 80px;
          height: fit-content;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .trending-item {
          display: flex;
          gap: 14px;
          margin-bottom: 20px;
          padding: 8px;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .trending-item:hover {
          background: white;
          transform: scale(1.02);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .trending-poster-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .trending-item img {
          width: 60px;
          height: 90px;
          border-radius: 8px;
          object-fit: cover;
        }

        .trending-score {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: var(--apple-blue);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 4px;
          border-radius: 4px;
          border: 2px solid white;
        }

        .trending-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .trending-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .trending-meta {
          font-size: 0.85rem;
          color: #86868b;
        }

        .btn-apple-secondary {
          background: white;
          border: 1px solid #d2d2d7;
          color: var(--apple-text);
          padding: 8px 16px;
          border-radius: 980px;
          font-weight: 400;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .btn-apple-secondary:hover {
          background: #f5f5f7;
          border-color: #86868b;
        }

        .btn-apple-danger {
          background: #ff3b30;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 980px;
          font-weight: 400;
          font-size: 0.9rem;
        }

        .btn-apple-danger:hover {
          background: #d70015;
        }

        .view-footer {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 40px;
        }

        @media (max-width: 800px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
          .sidebar {
            display: none;
          }
          .search-bar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
