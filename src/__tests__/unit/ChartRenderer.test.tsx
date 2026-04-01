import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    LineChart: ({ children, data }: any) => (
      <div data-testid="line-chart" data-count={data?.length}>
        {children}
      </div>
    ),
    BarChart: ({ children, data }: any) => (
      <div data-testid="bar-chart" data-count={data?.length}>
        {children}
      </div>
    ),
    Line: () => null,
    Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
    XAxis: ({ dataKey, data }: any) => (
      <div data-testid="x-axis" data-key={dataKey}>
        {data?.map((d: any, i: number) => <span key={i}>{d[dataKey]}</span>)}
      </div>
    ),
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
  };
});

import { ChartRenderer } from '../../components/ChartRenderer';
import { ForecastDay } from '../../types';

// Validates: Requirements 7.1, 7.2, 8.1, 8.2

const makeForecastDays = (n: number): ForecastDay[] =>
  Array.from({ length: n }, (_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    dayLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7],
    conditionLabel: 'Sunny',
    conditionIconCode: '01d',
    highTempCelsius: 20 + i,
    lowTempCelsius: 10 + i,
    rainProbabilityPercent: i * 10,
  }));

describe('ChartRenderer', () => {
  it('renders 7 data points in both charts when given 7 forecast days', () => {
    const days = makeForecastDays(7);
    render(<ChartRenderer days={days} unit="celsius" />);

    const lineChart = screen.getByTestId('line-chart');
    const barChart = screen.getByTestId('bar-chart');

    expect(lineChart.getAttribute('data-count')).toBe('7');
    expect(barChart.getAttribute('data-count')).toBe('7');
  });

  it('renders empty state for TempLineGraph when days is empty', () => {
    render(<ChartRenderer days={[]} unit="celsius" />);
    const emptyStates = screen.getAllByTestId('chart-empty-state');
    expect(emptyStates.length).toBeGreaterThanOrEqual(1);
    expect(emptyStates[0]).toHaveTextContent('No forecast data available');
  });

  it('renders empty state for RainBarChart when days is empty', () => {
    render(<ChartRenderer days={[]} unit="celsius" />);
    const emptyStates = screen.getAllByTestId('chart-empty-state');
    expect(emptyStates.length).toBe(2);
  });

  it('passes correct data count for partial forecast (3 days)', () => {
    const days = makeForecastDays(3);
    render(<ChartRenderer days={days} unit="celsius" />);

    const lineChart = screen.getByTestId('line-chart');
    const barChart = screen.getByTestId('bar-chart');

    expect(lineChart.getAttribute('data-count')).toBe('3');
    expect(barChart.getAttribute('data-count')).toBe('3');
  });

  it('renders both charts when days are provided', () => {
    const days = makeForecastDays(7);
    render(<ChartRenderer days={days} unit="fahrenheit" />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
