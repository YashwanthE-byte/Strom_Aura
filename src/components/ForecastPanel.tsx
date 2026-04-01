import { ForecastDay, TemperatureUnit } from '../types';
import { celsiusToFahrenheit } from '../utils/temperature';

interface ForecastPanelProps {
  days: ForecastDay[];
  unit: TemperatureUnit;
  isPartial: boolean; // true when fewer than 7 days returned
}

export function ForecastPanel({ days, unit, isPartial }: ForecastPanelProps) {
  function displayTemp(celsius: number): number {
    return unit === 'fahrenheit' ? celsiusToFahrenheit(celsius) : celsius;
  }

  const unitLabel = unit === 'fahrenheit' ? '°F' : '°C';

  return (
    <div className="forecast-panel">
      <h3>📅 7-Day Forecast</h3>
      {isPartial && (
        <div role="status" aria-label="Partial forecast data available" className="partial-warning">
          Partial forecast data available
        </div>
      )}
      <div className="forecast-days">
        {days.map((day) => (
          <div key={day.date} className="forecast-day-card" data-testid="forecast-day-card">
            <div className="day-label">{day.dayLabel}</div>
            <img
              src={`https://openweathermap.org/img/wn/${day.conditionIconCode}@2x.png`}
              alt={day.conditionLabel}
            />
            <div className="high-temp">
              {displayTemp(day.highTempCelsius)}{unitLabel}
            </div>
            <div className="low-temp">
              {displayTemp(day.lowTempCelsius)}{unitLabel}
            </div>
            <div className="rain-probability">{day.rainProbabilityPercent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
