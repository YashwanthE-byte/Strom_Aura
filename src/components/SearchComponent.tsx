import { useState, useRef, useEffect, useCallback } from 'react';
import { searchCities, ApiError } from '../services/ForecastService';
import type { CityResult } from '../types';

interface SearchComponentProps {
  onCitySelect: (city: CityResult) => void;
}

export function SearchComponent({ onCitySelect }: SearchComponentProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cities = await searchCities(trimmed);
      if (cities.length === 0) {
        setError('City not found');
        setShowDropdown(false);
      } else {
        setResults(cities);
        setShowDropdown(true);
        setError(null);
      }
    } catch (err) {
      if (err instanceof ApiError && err.type === 'connection') {
        setError('Connection error');
      } else {
        setError('Connection error');
      }
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    // Debounce 350ms
    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  }

  function handleSelect(city: CityResult) {
    onCitySelect(city);
    setShowDropdown(false);
    setResults([]);
    const label = [city.name, city.state, city.country].filter(Boolean).join(', ');
    setQuery(label);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search here..."
          aria-label="City search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          autoComplete="off"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <span role="alert">{error}</span>}

      {showDropdown && results.length > 0 && (
        <ul role="listbox" aria-label="City results">
          {results.map((city) => (
            <li
              key={city.id}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(city)}
            >
              <span className="city-name">{city.name}</span>
              <span className="city-meta">
                {[city.state, city.country].filter(Boolean).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
