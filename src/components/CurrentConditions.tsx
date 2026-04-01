import { CurrentWeather, TemperatureUnit } from '../types';
import { celsiusToFahrenheit } from '../utils/temperature';

interface CurrentConditionsProps {
  data: CurrentWeather;
  unit: TemperatureUnit;
}

export function CurrentConditions({ data, unit }: CurrentConditionsProps) {
  const temperature = unit === 'fahrenheit'
    ? Math.round(celsiusToFahrenheit(data.temperatureCelsius) * 10) / 10
    : Math.round(data.temperatureCelsius * 10) / 10;
  const unitLabel = unit === 'fahrenheit' ? '°F' : '°C';

  return (
    <div className="current-conditions">

      {/* Hero temp + condition */}
      <div className="cc-hero">
        <img
          className="cc-icon"
          src={`https://openweathermap.org/img/wn/${data.conditionIconCode}@4x.png`}
          alt={data.conditionLabel}
        />
        <div className="cc-temp-block">
          <div className="temperature">{temperature}{unitLabel}</div>
          <div className="condition-label">{data.conditionLabel}</div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="cc-cards">
        <div className="cc-card">
          <div className="cc-card-icon">💧</div>
          <div className="cc-card-label">Humidity</div>
          <div className="cc-card-value">
            {data.humidityPercent === null ? 'N/A' : `${data.humidityPercent}%`}
          </div>
        </div>

        <div className="cc-card">
          <div className="cc-card-icon">💨</div>
          <div className="cc-card-label">Wind Speed</div>
          <div className="cc-card-value">{Math.round(data.windSpeedKph)} km/h</div>
        </div>

        <div className="cc-card">
          <div className="cc-card-icon">🧭</div>
          <div className="cc-card-label">Direction</div>
          <div className="cc-card-value">{data.windDirection}</div>
        </div>

        <div className="cc-card">
          <div className="cc-card-icon">🌡️</div>
          <div className="cc-card-label">Feels Like</div>
          <div className="cc-card-value">{temperature}{unitLabel}</div>
        </div>
      </div>

    </div>
  );
}
