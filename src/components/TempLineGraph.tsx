import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { ForecastDay, TemperatureUnit } from '../types';
import { celsiusToFahrenheit } from '../utils/temperature';

export interface ChartDataPoint {
  dayLabel: string; high: number; low: number; date: string;
}

export function mapForecastToChartData(days: ForecastDay[], unit: TemperatureUnit): ChartDataPoint[] {
  return days.map(day => ({
    dayLabel: day.dayLabel,
    high: unit === 'fahrenheit' ? Math.round(celsiusToFahrenheit(day.highTempCelsius)) : Math.round(day.highTempCelsius),
    low:  unit === 'fahrenheit' ? Math.round(celsiusToFahrenheit(day.lowTempCelsius))  : Math.round(day.lowTempCelsius),
    date: day.date,
  }));
}

const CustomDot = (props: any) => {
  const { cx, cy, stroke } = props;
  return <circle cx={cx} cy={cy} r={5} fill={stroke} stroke="#fff" strokeWidth={2} filter="url(#glow)" />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,20,50,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 16px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>{payload[0]?.payload?.date ?? label}</p>
      <p style={{ color: '#ff7043', fontWeight: 700 }}>↑ High: {payload[0]?.value}°</p>
      <p style={{ color: '#64b5f6', fontWeight: 700 }}>↓ Low: {payload[1]?.value}°</p>
    </div>
  );
};

export function TempLineGraph({ days, unit }: { days: ForecastDay[]; unit: TemperatureUnit }) {
  if (days.length === 0) return <div data-testid="chart-empty-state" className="chart-empty">No forecast data</div>;

  const data = mapForecastToChartData(days, unit);
  const unitLabel = unit === 'fahrenheit' ? '°F' : '°C';
  const allTemps = data.flatMap(d => [d.high, d.low]);
  const minT = Math.min(...allTemps) - 3;
  const maxT = Math.max(...allTemps) + 3;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ff7043" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#ff7043" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#64b5f6" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#64b5f6" stopOpacity={0.02} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="dayLabel" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[minT, maxT]} unit={unitLabel} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(v) => <span style={{ color: v === 'high' ? '#ff7043' : '#64b5f6', fontSize: 12 }}>{v === 'high' ? '↑ High' : '↓ Low'}</span>} />
        <Area type="monotone" dataKey="high" stroke="#ff7043" strokeWidth={2.5} fill="url(#highGrad)" dot={<CustomDot />} activeDot={{ r: 7, fill: '#ff7043' }} name="high" />
        <Area type="monotone" dataKey="low"  stroke="#64b5f6" strokeWidth={2.5} fill="url(#lowGrad)"  dot={<CustomDot />} activeDot={{ r: 7, fill: '#64b5f6' }} name="low" />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
