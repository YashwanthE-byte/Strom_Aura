import { ForecastDay, TemperatureUnit } from '../types';
import { TempLineGraph } from './TempLineGraph';
import { RainBarChart } from './RainBarChart';

export interface ChartRendererProps {
  days: ForecastDay[];
  unit: TemperatureUnit;
}

export function ChartRenderer({ days, unit }: ChartRendererProps) {
  return (
    <div className="charts-section">
      <div className="chart-card">
        <h3>🌡️ Temperature Trend</h3>
        <TempLineGraph days={days} unit={unit} />
      </div>
      <div className="chart-card">
        <h3>🌧️ Rain Probability</h3>
        <RainBarChart days={days} />
      </div>
    </div>
  );
}
