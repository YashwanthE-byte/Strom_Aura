import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ForecastPanel } from '../../components/ForecastPanel';
import { ForecastDay } from '../../types';

// Validates: Requirements 6.3, 6.4

function makeDays(count: number): ForecastDay[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2024-01-0${i + 1}`,
    dayLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7],
    conditionLabel: 'Sunny',
    conditionIconCode: '01d',
    highTempCelsius: 20 + i,
    lowTempCelsius: 10 + i,
    rainProbabilityPercent: 10 * i,
  }));
}

describe('ForecastPanel', () => {
  it('renders 7 day cards when given 7 days', () => {
    render(<ForecastPanel days={makeDays(7)} unit="celsius" isPartial={false} />);
    expect(screen.getAllByTestId('forecast-day-card')).toHaveLength(7);
  });

  it('renders 4 day cards and shows warning when partial (4 days)', () => {
    render(<ForecastPanel days={makeDays(4)} unit="celsius" isPartial={true} />);
    expect(screen.getAllByTestId('forecast-day-card')).toHaveLength(4);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Partial forecast data available/i)).toBeInTheDocument();
  });

  it('does NOT show warning indicator when isPartial is false (7 days)', () => {
    render(<ForecastPanel days={makeDays(7)} unit="celsius" isPartial={false} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('displays day label, condition icon, high/low temps, and rain probability for each card', () => {
    const days = makeDays(1);
    render(<ForecastPanel days={days} unit="celsius" isPartial={false} />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Sunny' })).toHaveAttribute(
      'src',
      'https://openweathermap.org/img/wn/01d@2x.png'
    );
    expect(screen.getByText(/20.*°C/)).toBeInTheDocument();
    expect(screen.getByText(/10.*°C/)).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('converts temperatures to Fahrenheit when unit is fahrenheit', () => {
    const days = makeDays(1);
    render(<ForecastPanel days={days} unit="fahrenheit" isPartial={false} />);
    // 20°C = 68°F, 10°C = 50°F
    expect(screen.getByText(/68.*°F/)).toBeInTheDocument();
    expect(screen.getByText(/50.*°F/)).toBeInTheDocument();
  });
});
