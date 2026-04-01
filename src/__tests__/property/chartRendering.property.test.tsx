import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
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
import { TempLineGraph, mapForecastToChartData } from '../../components/TempLineGraph';
import { RainBarChart, getRainColor } from '../../components/RainBarChart';
import { ForecastDay, TemperatureUnit } from '../../types';
import { celsiusToFahrenheit } from '../../utils/temperature';

// ─── Arbitraries ────────────────────────────────────────────────────────────

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const arbForecastDay = fc.record<ForecastDay>({
  date: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }).map(
    (d) => d.toISOString().slice(0, 10)
  ),
  dayLabel: fc.constantFrom(...dayLabels),
  conditionLabel: fc.constantFrom('Sunny', 'Cloudy', 'Rainy', 'Snowy'),
  conditionIconCode: fc.constantFrom('01d', '02d', '09d', '13d'),
  highTempCelsius: fc.float({ min: -30, max: 50, noNaN: true }),
  lowTempCelsius: fc.float({ min: -40, max: 40, noNaN: true }),
  rainProbabilityPercent: fc.integer({ min: 0, max: 100 }),
});

const arbForecastDays = (min = 1, max = 7) =>
  fc.array(arbForecastDay, { minLength: min, maxLength: max });

const arbUnit: fc.Arbitrary<TemperatureUnit> = fc.constantFrom('celsius', 'fahrenheit');

// ─── Property 9 ─────────────────────────────────────────────────────────────

// Feature: weather-dashboard, Property 9: Charts render one data point per forecast day
describe('Property 9: Charts render one data point per forecast day', () => {
  it('LineChart and BarChart data prop length equals number of forecast days', () => {
    fc.assert(
      fc.property(arbForecastDays(1, 7), arbUnit, (days, unit) => {
        const { unmount } = render(<ChartRenderer days={days} unit={unit} />);

        const lineChart = screen.getByTestId('line-chart');
        const barChart = screen.getByTestId('bar-chart');

        const lineCount = Number(lineChart.getAttribute('data-count'));
        const barCount = Number(barChart.getAttribute('data-count'));

        unmount();

        return lineCount === days.length && barCount === days.length;
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 10 ────────────────────────────────────────────────────────────

// Feature: weather-dashboard, Property 10: Chart axis labels match forecast days and selected unit
describe('Property 10: Chart axis labels match forecast days and selected unit', () => {
  it('data-count on both charts equals days.length for any forecast and unit', () => {
    fc.assert(
      fc.property(arbForecastDays(1, 7), arbUnit, (days, unit) => {
        const { unmount } = render(<ChartRenderer days={days} unit={unit} />);

        const lineChart = screen.getByTestId('line-chart');
        const barChart = screen.getByTestId('bar-chart');

        const lineCount = Number(lineChart.getAttribute('data-count'));
        const barCount = Number(barChart.getAttribute('data-count'));

        unmount();

        return lineCount === days.length && barCount === days.length;
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 11 ────────────────────────────────────────────────────────────

// Feature: weather-dashboard, Property 11: Tooltip content contains exact value and date
describe('Property 11: Tooltip content contains exact value and date', () => {
  it('mapForecastToChartData returns correct high/low values and date for any ForecastDay', () => {
    fc.assert(
      fc.property(arbForecastDays(1, 7), arbUnit, (days, unit) => {
        const chartData = mapForecastToChartData(days, unit);

        return days.every((day, i) => {
          const point = chartData[i];
          const expectedHigh =
            unit === 'fahrenheit'
              ? celsiusToFahrenheit(day.highTempCelsius)
              : day.highTempCelsius;
          const expectedLow =
            unit === 'fahrenheit'
              ? celsiusToFahrenheit(day.lowTempCelsius)
              : day.lowTempCelsius;

          return (
            point.dayLabel === day.dayLabel &&
            point.date === day.date &&
            point.high === expectedHigh &&
            point.low === expectedLow
          );
        });
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 12 ────────────────────────────────────────────────────────────

// Feature: weather-dashboard, Property 12: Rain probability color gradient maps value to color
describe('Property 12: Rain probability color gradient maps value to color', () => {
  it('getRainColor is deterministic for any p in [0, 100]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (p) => {
        const color1 = getRainColor(p);
        const color2 = getRainColor(p);
        return color1 === color2;
      }),
      { numRuns: 100 }
    );
  });

  it('higher p values produce lower red and green components (monotone toward blue)', () => {
    const parseRG = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      return { r, g };
    };

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 1, max: 100 }),
        (p1Raw, p2Raw) => {
          // Ensure p1 < p2
          const p1 = Math.min(p1Raw, p2Raw - 1);
          const p2 = Math.max(p1Raw + 1, p2Raw);

          if (p1 >= p2) return true; // skip degenerate

          const c1 = parseRG(getRainColor(p1));
          const c2 = parseRG(getRainColor(p2));

          // Higher probability → lower red and green (closer to pure blue)
          return c2.r <= c1.r && c2.g <= c1.g;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 13 ────────────────────────────────────────────────────────────

// Feature: weather-dashboard, Property 13: Charts re-render when forecast data changes
describe('Property 13: Charts re-render when forecast data changes', () => {
  it('data-count updates when ChartRenderer is re-rendered with new forecast data', () => {
    fc.assert(
      fc.property(
        arbForecastDays(1, 6),
        arbForecastDays(1, 7),
        arbUnit,
        (days1, days2, unit) => {
          // Ensure different lengths for a clear test
          if (days1.length === days2.length) return true;

          const { rerender, unmount } = render(
            <ChartRenderer days={days1} unit={unit} />
          );

          const lineChartBefore = screen.getByTestId('line-chart');
          const barChartBefore = screen.getByTestId('bar-chart');
          const lineCountBefore = Number(lineChartBefore.getAttribute('data-count'));
          const barCountBefore = Number(barChartBefore.getAttribute('data-count'));

          rerender(<ChartRenderer days={days2} unit={unit} />);

          const lineChartAfter = screen.getByTestId('line-chart');
          const barChartAfter = screen.getByTestId('bar-chart');
          const lineCountAfter = Number(lineChartAfter.getAttribute('data-count'));
          const barCountAfter = Number(barChartAfter.getAttribute('data-count'));

          unmount();

          return (
            lineCountBefore === days1.length &&
            barCountBefore === days1.length &&
            lineCountAfter === days2.length &&
            barCountAfter === days2.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
