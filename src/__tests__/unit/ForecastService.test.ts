import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCities, fetchWeatherData, sanitizeHumidity, ApiError } from '../../services/ForecastService';
import type { CityResult } from '../../types';

// Helper to create a mock fetch response
function mockFetch(data: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
}

const mockGeoResponse = [
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'London', country: 'CA', lat: 42.9849, lon: -81.2453 },
];

const mockCurrentResponse = {
  weather: [{ description: 'clear sky', icon: '01d' }],
  main: { temp: 20.5, humidity: 65 },
  wind: { speed: 5.0, deg: 270 },
};

const mockForecastResponse = {
  list: [
    {
      dt: 1700000000,
      dt_txt: '2023-11-14 12:00:00',
      weather: [{ description: 'clear sky', icon: '01d' }],
      main: { temp: 20, temp_min: 15, temp_max: 22 },
      pop: 0.1,
    },
    {
      dt: 1700010800,
      dt_txt: '2023-11-14 15:00:00',
      weather: [{ description: 'few clouds', icon: '02d' }],
      main: { temp: 18, temp_min: 14, temp_max: 20 },
      pop: 0.2,
    },
    {
      dt: 1700086400,
      dt_txt: '2023-11-15 12:00:00',
      weather: [{ description: 'rain', icon: '10d' }],
      main: { temp: 14, temp_min: 10, temp_max: 16 },
      pop: 0.8,
    },
  ],
};

describe('ForecastService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch(mockGeoResponse));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('maps geocoding response to CityResult[]', async () => {
      vi.stubGlobal('fetch', mockFetch(mockGeoResponse));

      const results = await searchCities('London');

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        name: 'London',
        country: 'GB',
        lat: 51.5074,
        lon: -0.1278,
      });
      expect(results[0].id).toBeDefined();
      expect(results[1]).toMatchObject({
        name: 'London',
        country: 'CA',
      });
    });

    it('returns empty array when API returns empty list', async () => {
      vi.stubGlobal('fetch', mockFetch([]));
      const results = await searchCities('NonExistentCity12345');
      expect(results).toHaveLength(0);
    });

    it('throws ApiError with type connection on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      await expect(searchCities('London')).rejects.toThrow(ApiError);
      await expect(searchCities('London')).rejects.toMatchObject({ type: 'connection' });
    });
  });

  describe('fetchWeatherData', () => {
    const city: CityResult = {
      id: '51.5074,-0.1278,0',
      name: 'London',
      country: 'GB',
      lat: 51.5074,
      lon: -0.1278,
    };

    it('maps current + forecast responses to WeatherData', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockCurrentResponse) })
          .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockForecastResponse) })
      );

      const result = await fetchWeatherData(city, 'celsius');

      expect(result.city).toEqual(city);
      expect(result.current.temperatureCelsius).toBe(20.5);
      expect(result.current.conditionLabel).toBe('clear sky');
      expect(result.current.conditionIconCode).toBe('01d');
      expect(result.current.humidityPercent).toBe(65);
      // 5.0 m/s * 3.6 = 18 kph
      expect(result.current.windSpeedKph).toBeCloseTo(18, 1);
      expect(result.current.windDirection).toBe('W');
      expect(result.forecast).toHaveLength(2); // 2 distinct dates
      expect(result.fetchedAt).toBeGreaterThan(0);
    });

    it('groups forecast items by date and picks noon slot', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockCurrentResponse) })
          .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockForecastResponse) })
      );

      const result = await fetchWeatherData(city, 'celsius');

      // First day should use noon slot (12:00) data
      expect(result.forecast[0].conditionLabel).toBe('clear sky');
      // High should be max across all slots for that day
      expect(result.forecast[0].highTempCelsius).toBe(22);
      expect(result.forecast[0].lowTempCelsius).toBe(14);
    });

    it('throws ApiError with type connection on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      await expect(fetchWeatherData(city, 'celsius')).rejects.toThrow(ApiError);
      await expect(fetchWeatherData(city, 'celsius')).rejects.toMatchObject({ type: 'connection' });
    });

    it('throws ApiError when API returns non-ok status', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) })
          .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockForecastResponse) })
      );

      await expect(fetchWeatherData(city, 'celsius')).rejects.toThrow(ApiError);
    });
  });

  describe('sanitizeHumidity', () => {
    it('returns the value when within 0–100', () => {
      expect(sanitizeHumidity(0)).toBe(0);
      expect(sanitizeHumidity(50)).toBe(50);
      expect(sanitizeHumidity(100)).toBe(100);
    });

    it('returns null when humidity is below 0', () => {
      expect(sanitizeHumidity(-1)).toBeNull();
      expect(sanitizeHumidity(-100)).toBeNull();
    });

    it('returns null when humidity is above 100', () => {
      expect(sanitizeHumidity(101)).toBeNull();
      expect(sanitizeHumidity(200)).toBeNull();
    });

    it('fetchWeatherData sets humidityPercent to null for out-of-range values', async () => {
      const city: CityResult = { id: '1', name: 'Test', country: 'XX', lat: 0, lon: 0 };

      for (const badHumidity of [-1, 101, -50, 150]) {
        const badCurrentResponse = {
          ...mockCurrentResponse,
          main: { ...mockCurrentResponse.main, humidity: badHumidity },
        };

        vi.stubGlobal(
          'fetch',
          vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(badCurrentResponse) })
            .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockForecastResponse) })
        );

        const result = await fetchWeatherData(city, 'celsius');
        expect(result.current.humidityPercent).toBeNull();
      }
    });
  });
});
