import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchWeatherData, reverseGeocode, ApiError } from '../services/ForecastService';
import { SearchComponent } from './SearchComponent';
import { CurrentConditions } from './CurrentConditions';
import { ForecastPanel } from './ForecastPanel';
import { ChartRenderer } from './ChartRenderer';
import { HourlyForecast } from './HourlyForecast';
import { WeatherHero } from './WeatherHero';
import type { CityResult } from '../types';

const CURRENT_REFRESH_MS = 600_000;

export function Dashboard() {
  const { state, dispatch } = useAppContext();
  const currentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doFetchRef = useRef<(city: CityResult) => Promise<void>>(async () => {});
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied'>('idle');

  const doFetch = useCallback(async (city: CityResult) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await fetchWeatherData(city, state.unit);
      dispatch({ type: 'SET_WEATHER', payload: data });
    } catch (err) {
      if (err instanceof ApiError && err.type === 'configuration') {
        dispatch({ type: 'SET_ERROR', payload: { type: 'configuration', message: err.message } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: { type: 'connection', previousData: state.weatherData } });
      }
    }
  }, [dispatch, state.unit, state.weatherData]);

  doFetchRef.current = doFetch;

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }

    let cancelled = false;
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const fallbackCity: CityResult = {
          id: `${lat},${lon},location`,
          name: 'Your Location',
          country: '',
          lat,
          lon,
        };

        let city = fallbackCity;
        try {
          city = (await reverseGeocode(lat, lon)) ?? fallbackCity;
        } catch {
          city = fallbackCity;
        }

        if (cancelled) return;
        setGeoStatus('idle');
        await doFetchRef.current(city);
      },
      () => {
        if (!cancelled) setGeoStatus('denied');
      },
      { timeout: 10_000, maximumAge: 300_000 }
    );

    return () => { cancelled = true; };
  }, []);

  const handleCitySelect = useCallback((city: CityResult) => doFetch(city), [doFetch]);

  useEffect(() => {
    if (!state.selectedCity) return;
    const city = state.selectedCity;
    if (currentIntervalRef.current) clearInterval(currentIntervalRef.current);
    currentIntervalRef.current = setInterval(() => doFetch(city), CURRENT_REFRESH_MS);
    return () => {
      if (currentIntervalRef.current) clearInterval(currentIntervalRef.current);
    };
  }, [state.selectedCity, doFetch]);

  function toggleUnit() {
    dispatch({ type: 'SET_UNIT', payload: state.unit === 'celsius' ? 'fahrenheit' : 'celsius' });
  }

  return (
    <div className="dashboard">
      <SearchComponent onCitySelect={handleCitySelect} />

      {state.error?.type === 'connection' && <div role="alert">Connection error — showing last known data</div>}
      {state.error?.type === 'configuration' && <div role="alert">{state.error.message}</div>}
      {geoStatus === 'denied' && !state.weatherData && (
        <div role="status">Location unavailable. Search for a city to see its weather.</div>
      )}

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
          <ForecastPanel days={state.weatherData.forecast} unit={state.unit} isPartial={state.weatherData.forecast.length < 5} />
          <ChartRenderer days={state.weatherData.forecast} unit={state.unit} />
        </>
      ) : (
        !state.isLoading && geoStatus !== 'loading' && <WeatherHero />
      )}
    </div>
  );
}
