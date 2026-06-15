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
      setSelectedGenres([-1]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      if (selectedGenres.length === 0) {
        setSelectedGenres([-1]);
      }
    }
  };

  return (
    <div className="container apple-theme">
      <header className="app-header glass">
        <div className="header-content">
          <div className="logo" onClick={handleReset} style={{ cursor: 'pointer' }}>
            <Film className="logo-icon" size={20} />
            <span>MovieMind</span>
          </div>
          
          <form className="search-bar" onSubmit={onSearchSubmit}>
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="header-actions">
            <button 
              className={`btn-icon ${showSettings ? 'active' : ''}`}
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-layout">
        <div className="content-area">
          {showSettings ? (
            <div className="settings-view fade-in">
              <h2>Ignored</h2>
              <div className="ignored-list">
                {ignoredIds.map(id => (
                  <div key={id} className="ignored-item">
                    <span>{id}</span>
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
                  <Loader2 className="spinner" size={32} />
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
                      <Dices size={14} />
                      <span>Random</span>
                    </button>
                    <button className="btn-apple-danger" onClick={handleReset}>
                      <RefreshCcw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>No results.</p>
                  <button className="btn-primary" onClick={handleReset}>Restart</button>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="sidebar">
          <div className="sidebar-header">
            <TrendingUp size={16} />
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
        .glass {
          background-color: rgba(255, 255, 255, 0.72);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
        }

        .app-header {
          position: sticky;
          top: 0;
          width: 100%;
          z-index: 1000;
          height: 48px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        .header-content {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
        }

        .search-bar {
          background: rgba(0,0,0,0.05);
          border-radius: 8px;
          padding: 4px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 300px;
        }

        .search-bar input {
          background: transparent;
          border: none;
          padding: 4px 0;
          width: 100%;
          outline: none;
          font-size: 0.85rem;
        }

        .btn-icon {
          background: none;
          border: none;
          color: #86868b;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-icon:hover {
          background: rgba(0,0,0,0.05);
          color: #1d1d1f;
        }

        .btn-icon.active {
          color: var(--apple-blue);
        }

        .main-layout {
          width: 100vw;
          display: grid;
          grid-template-columns: 1fr 360px; /* Increased sidebar width */
          gap: 0;
          padding: 0;
          margin: 0;
        }

        .content-area {
          padding: 30px;
          width: 100%;
        }

        .sidebar {
          background: #ffffff;
          border-left: 1px solid rgba(0,0,0,0.08);
          padding: 30px;
          min-height: calc(100vh - 48px);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 25px;
        }

        .sidebar-header h3 {
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #86868b;
        }

        .trending-item {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          padding: 10px;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .trending-item:hover {
          background: var(--apple-gray);
          transform: translateX(4px);
        }

        .trending-poster-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .trending-item img {
          width: 70px;
          height: 105px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }

        .trending-score {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: var(--apple-blue);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 4px;
          border-radius: 4px;
          border: 2px solid white;
        }

        .trending-title {
          font-weight: 600;
          font-size: 1rem;
          color: var(--apple-text);
          line-height: 1.3;
          margin-bottom: 4px;
        }

        .trending-meta {
          font-size: 0.8rem;
          color: #86868b;
        }

        .btn-apple-secondary, .btn-apple-danger {
          padding: 8px 18px;
          border-radius: 980px;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-apple-secondary {
          background: white;
          border: 1px solid #d2d2d7;
        }

        .btn-apple-danger {
          background: #ff3b30;
          color: white;
        }

        .view-footer {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 30px;
          padding-bottom: 30px;
        }

        @media (max-width: 800px) {
          .main-layout {
            grid-template-columns: 1fr;
            width: 100%;
          }
          .content-area {
            padding: 15px;
          }
          .sidebar {
            border-left: none;
            border-top: 1px solid rgba(0,0,0,0.08);
            padding: 20px;
          }
          .trending-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 15px;
          }
          .trending-item {
            flex-direction: column;
            text-align: center;
            margin-bottom: 0;
          }
          .trending-item:hover {
            transform: translateY(-4px);
          }
          .trending-item img {
            width: 100%;
            height: auto;
            aspect-ratio: 2/3;
          }
          .search-bar {
            width: 100%;
            max-width: none;
          }
          .logo span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
