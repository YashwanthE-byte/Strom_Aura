export interface CityResult {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temperatureCelsius: number;
  conditionLabel: string;
  conditionIconCode: string;
  humidityPercent: number | null; // null when discarded (out of 0–100 range)
  windSpeedKph: number;
  windDirection: string;
}

export interface ForecastDay {
  date: string;           // ISO date string "YYYY-MM-DD"
  dayLabel: string;       // e.g. "Mon", "Tue"
  conditionLabel: string;
  conditionIconCode: string;
  highTempCelsius: number;
  lowTempCelsius: number;
  rainProbabilityPercent: number; // 0–100
}

export interface WeatherData {
  city: CityResult;
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: number; // Unix timestamp ms
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export type AppError =
  | { type: 'city_not_found' }
  | { type: 'connection'; previousData: WeatherData | null }
  | { type: 'invalid_data'; field: string };

export interface AppState {
  selectedCity: CityResult | null;
  weatherData: WeatherData | null;
  unit: TemperatureUnit;
  isLoading: boolean;
  error: AppError | null;
}
