import type { CityResult, WeatherData, TemperatureUnit, ForecastDay } from '../types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;

export class ApiError extends Error {
  constructor(public type: 'connection' | 'not_found', message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Geocoding API response shape
interface GeoResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// Current weather API response shape
interface OWMCurrentResponse {
  weather: { description: string; icon: string }[];
  main: { temp: number; humidity: number };
  wind: { speed: number; deg: number };
}

// Forecast API response shape
interface OWMForecastItem {
  dt: number;
  dt_txt: string;
  weather: { description: string; icon: string }[];
  main: { temp: number; temp_min: number; temp_max: number };
  pop: number; // probability of precipitation 0–1
}

interface OWMForecastResponse {
  list: OWMForecastItem[];
}

/** Convert wind degrees to compass direction */
function degreesToDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/** Sanitize humidity: return null if outside 0–100 */
export function sanitizeHumidity(value: number): number | null {
  if (value < 0 || value > 100) return null;
  return value;
}

/** Group forecast items by date and pick the noon slot (or closest to 12:00) */
function buildForecastDays(items: OWMForecastItem[]): ForecastDay[] {
  const byDate = new Map<string, OWMForecastItem[]>();

  for (const item of items) {
    const date = item.dt_txt.slice(0, 10); // "YYYY-MM-DD"
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(item);
  }

  const days: ForecastDay[] = [];

  for (const [date, slots] of byDate) {
    // Pick slot closest to noon — parse dt_txt "YYYY-MM-DD HH:MM:SS" as UTC
    const getHour = (txt: string) => parseInt(txt.slice(11, 13), 10);
    const noonSlot = slots.reduce((best, cur) => {
      return Math.abs(getHour(cur.dt_txt) - 12) < Math.abs(getHour(best.dt_txt) - 12) ? cur : best;
    });

    const highTemp = Math.max(...slots.map((s) => s.main.temp_max));
    const lowTemp = Math.min(...slots.map((s) => s.main.temp_min));
    const maxPop = Math.max(...slots.map((s) => s.pop));

    const dateObj = new Date(date + 'T00:00:00Z');
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

    days.push({
      date,
      dayLabel,
      conditionLabel: noonSlot.weather[0]?.description ?? '',
      conditionIconCode: noonSlot.weather[0]?.icon ?? '',
      highTempCelsius: highTemp,
      lowTempCelsius: lowTemp,
      rainProbabilityPercent: Math.round(maxPop * 100),
    });
  }

  return days;
}

async function safeFetch(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    throw new ApiError('connection', 'Network request failed');
  }
}

export async function searchCities(query: string): Promise<CityResult[]> {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
  const res = await safeFetch(url);

  if (!res.ok) {
    if (res.status === 404) throw new ApiError('not_found', 'City not found');
    throw new ApiError('connection', `API error: ${res.status}`);
  }

  const data: GeoResult[] = await res.json();

  return data.map((item, index) => ({
    id: `${item.lat},${item.lon},${index}`,
    name: item.name,
    country: item.country,
    state: item.state,
    lat: item.lat,
    lon: item.lon,
  }));
}

export async function fetchWeatherData(
  city: CityResult,
  _unit: TemperatureUnit
): Promise<WeatherData> {
  const { lat, lon } = city;

  const [currentRes, forecastRes] = await Promise.all([
    safeFetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    ),
    safeFetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=56`
    ),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    throw new ApiError('connection', 'Failed to fetch weather data');
  }

  const current: OWMCurrentResponse = await currentRes.json();
  const forecast: OWMForecastResponse = await forecastRes.json();

  // Build hourly slots (next 24h = first 8 × 3h items)
  const hourly = forecast.list.slice(0, 8).map((item) => ({
    time: item.dt_txt.slice(11, 16), // "HH:MM"
    tempCelsius: item.main.temp,
    iconCode: item.weather[0]?.icon ?? '01d',
    conditionLabel: item.weather[0]?.description ?? '',
    rainProbability: Math.round(item.pop * 100),
  }));

  return {
    city,
    current: {
      temperatureCelsius: current.main.temp,
      conditionLabel: current.weather[0]?.description ?? '',
      conditionIconCode: current.weather[0]?.icon ?? '',
      humidityPercent: sanitizeHumidity(current.main.humidity),
      windSpeedKph: current.wind.speed * 3.6,
      windDirection: degreesToDirection(current.wind.deg),
    },
    forecast: buildForecastDays(forecast.list),
    fetchedAt: Date.now(),
    hourly,
  } as WeatherData & { hourly: typeof hourly };
}
