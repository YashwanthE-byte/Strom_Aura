import type { WeatherData, TemperatureUnit } from '../types';
import { celsiusToFahrenheit } from '../utils/temperature';

interface Props {
  data: WeatherData;
  unit: TemperatureUnit;
}

// We store raw hourly slots on WeatherData via an optional field
export function HourlyForecast({ data, unit }: Props) {
  const slots = (data as any).hourly as Array<{
    time: string; // "HH:MM"
    tempCelsius: number;
    iconCode: string;
    conditionLabel: string;
    rainProbability: number;
  }> | undefined;

  if (!slots || slots.length === 0) return null;

  const display = slots.slice(0, 8); // next 24h = 8 × 3h slots

  return (
    <div className="hourly-panel">
      <h3>🕐 Next 24 Hours</h3>
      <div className="hourly-scroll">
        {display.map((slot, i) => {
          const temp = unit === 'fahrenheit'
            ? Math.round(celsiusToFahrenheit(slot.tempCelsius))
            : Math.round(slot.tempCelsius);
          const unitLabel = unit === 'fahrenheit' ? '°F' : '°C';
          return (
            <div key={i} className="hourly-card">
              <div className="hourly-time">{slot.time}</div>
              <img
                src={`https://openweathermap.org/img/wn/${slot.iconCode}@2x.png`}
                alt={slot.conditionLabel}
                width={36} height={36}
              />
              <div className="hourly-temp">{temp}{unitLabel}</div>
              <div className="hourly-rain">💧 {slot.rainProbability}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
