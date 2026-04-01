// Feature: weather-dashboard, Property 1: City search queries the API with the submitted name
// Feature: weather-dashboard, Property 2: All returned city options are displayed

/**
 * Property 1: For any non-empty city name string submitted to the SearchComponent,
 * the ForecastService shall invoke the Weather API with that exact city name as the query parameter.
 * Validates: Requirements 1.2
 *
 * Property 2: For any list of CityResult objects returned by the API,
 * the SearchComponent shall render exactly that many selectable options in the dropdown.
 * Validates: Requirements 1.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import type { CityResult } from '../../types';

// Mock ForecastService before importing SearchComponent
vi.mock('../../services/ForecastService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/ForecastService')>();
  return {
    ...actual,
    searchCities: vi.fn(),
  };
});

import { searchCities } from '../../services/ForecastService';
import { SearchComponent } from '../../components/SearchComponent';

const mockSearchCities = vi.mocked(searchCities);

// Arbitrary for a non-empty city name (min 2 chars, no leading/trailing whitespace)
const cityNameArb = fc
  .string({ minLength: 2, maxLength: 20 })
  .filter((s) => s.trim().length >= 2 && s === s.trim());

// Arbitrary for a CityResult
const cityResultArb = fc.record<CityResult>({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  country: fc.string({ minLength: 2, maxLength: 2 }),
  lat: fc.double({ min: -90, max: 90, noNaN: true }),
  lon: fc.double({ min: -180, max: 180, noNaN: true }),
});

// Arbitrary for a non-empty list of CityResult (1–10 items)
const cityResultListArb = fc.array(cityResultArb, { minLength: 1, maxLength: 10 });

describe('Property 1: City search queries the API with the submitted name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('searchCities is called with the exact submitted city name', async () => {
    await fc.assert(
      fc.asyncProperty(cityNameArb, async (cityName) => {
        cleanup();
        vi.clearAllMocks();
        mockSearchCities.mockResolvedValue([]);

        const { container } = render(<SearchComponent onCitySelect={vi.fn()} />);

        const input = within(container).getByRole('textbox');
        const button = within(container).getByRole('button');

        // Set value and submit via button — bypasses debounce entirely
        fireEvent.change(input, { target: { value: cityName } });
        fireEvent.submit(button.closest('form')!);

        await waitFor(() => {
          expect(mockSearchCities).toHaveBeenCalledWith(cityName);
        }, { timeout: 1000 });

        cleanup();
      }),
      { numRuns: 100 }
    );
  }, 30000);
});

describe('Property 2: All returned city options are displayed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders exactly as many dropdown options as cities returned by the API', async () => {
    await fc.assert(
      fc.asyncProperty(cityResultListArb, async (cities) => {
        cleanup();
        vi.clearAllMocks();
        mockSearchCities.mockResolvedValue(cities);

        const { container } = render(<SearchComponent onCitySelect={vi.fn()} />);

        const input = within(container).getByRole('textbox');

        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.submit(input.closest('form')!);

        await waitFor(() => {
          const options = within(container).getAllByRole('option');
          expect(options).toHaveLength(cities.length);
        }, { timeout: 1000 });

        cleanup();
      }),
      { numRuns: 100 }
    );
  }, 30000);
});

// Feature: weather-dashboard, Property 3: City selection updates displayed weather data

/**
 * Property 3: For any CityResult selected by the user, the Dashboard shall display
 * weather data whose `city.id` matches the selected city's `id`.
 * Validates: Requirements 1.4, 2.1, 3.1, 4.1, 5.1
 *
 * Tested via the AppContext reducer: given an initial state, dispatch SET_WEATHER
 * with a WeatherData whose city matches the selected city, verify
 * state.weatherData.city.id === selectedCity.id
 */

import { appReducer } from '../../context/AppContext';
import type { WeatherData, ForecastDay, CurrentWeather } from '../../types';

// We need to import the reducer — export it from AppContext if not already exported.
// The test uses the reducer directly to avoid rendering overhead.

const makeCurrentWeather = (): CurrentWeather => ({
  temperatureCelsius: 20,
  conditionLabel: 'Sunny',
  conditionIconCode: '01d',
  humidityPercent: 50,
  windSpeedKph: 10,
  windDirection: 'N',
});

const makeForecastDay = (i: number): ForecastDay => ({
  date: `2024-01-${String(i + 1).padStart(2, '0')}`,
  dayLabel: 'Mon',
  conditionLabel: 'Sunny',
  conditionIconCode: '01d',
  highTempCelsius: 25,
  lowTempCelsius: 15,
  rainProbabilityPercent: 10,
});

describe('Property 3: City selection updates displayed weather data', () => {
  it('state.weatherData.city.id matches the selected city id after SET_WEATHER dispatch', () => {
    fc.assert(
      fc.property(cityResultArb, (city) => {
        const weatherData: WeatherData = {
          city,
          current: makeCurrentWeather(),
          forecast: Array.from({ length: 7 }, (_, i) => makeForecastDay(i)),
          fetchedAt: Date.now(),
        };

        const initialState = {
          selectedCity: null,
          weatherData: null,
          unit: 'celsius' as const,
          isLoading: false,
          error: null,
        };

        const nextState = appReducer(initialState, { type: 'SET_WEATHER', payload: weatherData });

        return nextState.weatherData?.city.id === city.id;
      }),
      { numRuns: 100 }
    );
  });
});
