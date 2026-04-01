import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchWeatherData, ApiError } from '../services/ForecastService';
import { SearchComponent } from './SearchComponent';
import { CurrentConditions } from './CurrentConditions';
import { ForecastPanel } from './ForecastPanel';
import { ChartRenderer } from './ChartRenderer';
import { HourlyForecast } from './HourlyForecast';
import { WeatherHero } from './WeatherHero';
import type { CityResult } from '../types';

const CURRENT_REFRESH_MS = 600_000;
const FORECAST_REFRESH_MS = 3_600_000;

export function Dashboard() {
  const { state, dispatch } = useAppContext();
  const currentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const forecastIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied'>('idle');

  const doFetch = useCallback(async (city: CityResult) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await fetchWeatherData(city, state.unit);
      dispatch({ type: 'SET_WEATHER', payload: data });
    } catch (err) {
      if (err instanceof ApiError && err.type === 'connection') {
        dispatch({ type: 'SET_ERROR', payload: { type: 'connection', previousData: state.weatherData } });
      }
    }
  }, [dispatch, state.unit, state.weatherData]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const key = (import.meta as any).env.VITE_OPENWEATHER_API_KEY;
        try {
          const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`);
          const data = await res.json();
          if (data?.[0]) {
            const city: CityResult = { id: `${lat},${lon},0`, name: data[0].name, country: data[0].country, state: data[0].state, lat, lon };
            setGeoStatus('idle');
            doFetch(city);
          }
        } catch { setGeoStatus('idle'); }
      },
      () => setGeoStatus('denied')
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCitySelect = useCallback((city: CityResult) => doFetch(city), [doFetch]);

  useEffect(() => {
    if (!state.selectedCity) return;
    const city = state.selectedCity;
    if (currentIntervalRef.current) clearInterval(currentIntervalRef.current);
    if (forecastIntervalRef.current) clearInterval(forecastIntervalRef.current);
    currentIntervalRef.current = setInterval(() => doFetch(city), CURRENT_REFRESH_MS);
    forecastIntervalRef.current = setInterval(() => doFetch(city), FORECAST_REFRESH_MS);
    return () => {
      if (currentIntervalRef.current) clearInterval(currentIntervalRef.current);
      if (forecastIntervalRef.current) clearInterval(forecastIntervalRef.current);
    };
  }, [state.selectedCity, doFetch]);

  function toggleUnit() {
    dispatch({ type: 'SET_UNIT', payload: state.unit === 'celsius' ? 'fahrenheit' : 'celsius' });
  }

  return (
    <div className="dashboard">
      <SearchComponent onCitySelect={handleCitySelect} />

      {state.error?.type === 'connection' && <div role="alert">Connection error — showing last known data</div>}

      {(state.isLoading || geoStatus === 'loading') && (
        <div className="loading-bar">{geoStatus === 'loading' ? '📍 Detecting your location…' : 'Loading weather data…'}</div>
      )}

      {state.weatherData ? (
        <>
          <div className="weather-meta">
            <span className="city-display">
              📍 {state.weatherData.city.name}
              {state.weatherData.city.state ? `, ${state.weatherData.city.state}` : ''}
              {` · ${state.weatherData.city.country}`}
            </span>
            <button onClick={toggleUnit}>{state.unit === 'celsius' ? '°C → °F' : '°F → °C'}</button>
          </div>
          <CurrentConditions data={state.weatherData.current} unit={state.unit} />
          <HourlyForecast data={state.weatherData} unit={state.unit} />
          <ForecastPanel days={state.weatherData.forecast} unit={state.unit} isPartial={state.weatherData.forecast.length < 7} />
          <ChartRenderer days={state.weatherData.forecast} unit={state.unit} />
        </>
      ) : (
        !state.isLoading && geoStatus !== 'loading' && <WeatherHero />
      )}
    </div>
  );
}
