import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ForecastDay } from '../types';

export function getRainColor(p: number): string {
  const t = Math.max(0, Math.min(100, p)) / 100;
  const r = Math.round(116 * (1 - t));
  const g = Math.round(185 * (1 - t));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}ff`;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { date, rainProbabilityPercent } = payload[0].payload;
  return (
    <div style={{ background: 'rgba(10,20,50,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 16px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>{date}</p>
      <p style={{ color: '#64b5f6', fontWeight: 700 }}>💧 {rainProbabilityPercent}% chance of rain</p>
    </div>
  );
};

const CustomBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const radius = 6;
  return (
    <path
      d={`M${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} L${x},${y + height} Z`}
      fill={fill}
      opacity={0.85}
      filter="url(#barGlow)"
    />
  );
};

export function RainBarChart({ days }: { days: ForecastDay[] }) {
  if (days.length === 0) return <div data-testid="chart-empty-state" className="chart-empty">No forecast data</div>;

  const data = days.map(day => ({
    dayLabel: day.dayLabel,
    rainProbabilityPercent: day.rainProbabilityPercent,
    date: day.date,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
        <defs>
          <filter id="barGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="dayLabel" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} unit="%" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" label={{ value: '50%', fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
        <Bar dataKey="rainProbabilityPercent" shape={<CustomBar />} name="Rain Probability">
          {data.map((entry, i) => (
            <Cell key={i} fill={getRainColor(entry.rainProbabilityPercent)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
