import { useState, useRef, useEffect, useCallback } from 'react';
import { searchSpots, getCategoryIcon, estimateStayMinutes } from '../utils/api';
import './SpotSearch.css';

export default function SpotSearch({ onAdd }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runSearch = useCallback(async (q) => {
    setIsSearching(true);
    try {
      const { places, isMock } = await searchSpots(q);
      setResults(places);
      setIsMockMode(isMock);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(val), 400);
  }

  function handleSelect(spot) {
    onAdd({
      ...spot,
      icon: getCategoryIcon(spot.types, spot.category),
      estimatedStayMinutes: estimateStayMinutes(spot.types, spot.category),
    });
    setQuery('');
    setResults([]);
    setShowResults(false);
  }

  return (
    <div className="spot-search" ref={wrapperRef}>
      <div className="search-input-row">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="スポット名や場所を検索（例: 浅草寺、渋谷 ラーメン）"
          autoComplete="off"
        />
        {isSearching && <div className="search-spinner" />}
      </div>

      {showResults && results.length > 0 && (
        <div className="search-dropdown">
          {isMockMode && (
            <div className="mock-banner">
              サンプルデータ表示中（Google Places APIキー未設定）
            </div>
          )}
          {results.map(spot => (
            <button key={spot.id} className="search-result-item" onClick={() => handleSelect(spot)}>
              <span className="result-icon">{getCategoryIcon(spot.types, spot.category)}</span>
              <span className="result-info">
                <span className="result-name">{spot.name}</span>
                <span className="result-address">{spot.address}</span>
              </span>
              {spot.rating && <span className="result-rating">★ {Number(spot.rating).toFixed(1)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
