// Feature: weather-dashboard, Property 7: Forecast day cards contain all required fields

/**
 * Validates: Requirements 6.3
 *
 * Property 7: For any ForecastDay object, the rendered day card shall contain the
 * date label, condition icon, high temperature, low temperature, and rain probability percentage.
 */

// Feature: weather-dashboard, Property 8: Partial forecast shows available days and unavailability indicator

/**
 * Validates: Requirements 6.4
 *
 * Property 8: For any forecast response containing between 1 and 6 days (inclusive),
 * the ForecastPanel shall render exactly that many day cards and display an indicator
 * that full forecast data is unavailable.
 */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ForecastPanel } from '../../components/ForecastPanel';
import type { ForecastDay, TemperatureUnit } from '../../types';
import { celsiusToFahrenheit } from '../../utils/temperature';

afterEach(() => {
  cleanup();
});

// Shared arbitrary for ForecastDay
const forecastDayArb = fc.record<ForecastDay>({
  date: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString().slice(0, 10)),
  dayLabel: fc.constantFrom('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
  conditionLabel: fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => s.trim().length > 0),
  conditionIconCode: fc
    .string({ minLength: 1, maxLength: 10 })
    .filter((s) => s.trim().length > 0),
  highTempCelsius: fc.integer({ min: -50, max: 60 }),
  lowTempCelsius: fc.integer({ min: -60, max: 50 }),
  rainProbabilityPercent: fc.integer({ min: 0, max: 100 }),
});

/** Get the text content of a scoped element by class name */
function textOf(card: Element, className: string): string {
  const el = card.querySelector(`.${className}`);
  return el ? el.textContent ?? '' : '';
}

// ─── Property 7 ──────────────────────────────────────────────────────────────

describe('Property 7: Forecast day cards contain all required fields', () => {
  it('each rendered day card contains dayLabel, condition icon, high temp, low temp, and rain probability', () => {
    fc.assert(
      fc.property(
        forecastDayArb,
        fc.constantFrom<TemperatureUnit>('celsius', 'fahrenheit'),
        (day, unit) => {
          const { container, unmount } = render(
            <ForecastPanel days={[day]} unit={unit} isPartial={false} />
          );

          const card = container.querySelector('[data-testid="forecast-day-card"]')!;

          // 1. dayLabel is present
          const hasLabel = textOf(card, 'day-label').includes(day.dayLabel);

          // 2. condition icon is present with correct src and alt
          const img = card.querySelector('img');
          const hasIcon =
            img !== null &&
            img.getAttribute('alt') === day.conditionLabel &&
            img.getAttribute('src') ===
              `https://openweathermap.org/img/wn/${day.conditionIconCode}@2x.png`;

          // 3. high temperature is present
          const expectedHigh =
            unit === 'fahrenheit'
              ? celsiusToFahrenheit(day.highTempCelsius)
              : day.highTempCelsius;
          const unitLabel = unit === 'fahrenheit' ? '°F' : '°C';
          const highText = textOf(card, 'high-temp');
          const hasHigh =
            highText.includes(String(expectedHigh)) && highText.includes(unitLabel);

          // 4. low temperature is present
          const expectedLow =
            unit === 'fahrenheit'
              ? celsiusToFahrenheit(day.lowTempCelsius)
              : day.lowTempCelsius;
          const lowText = textOf(card, 'low-temp');
          const hasLow =
            lowText.includes(String(expectedLow)) && lowText.includes(unitLabel);

          // 5. rain probability is present
          const rainText = textOf(card, 'rain-probability');
          const hasRain = rainText.includes(`${day.rainProbabilityPercent}%`);

          unmount();

          return hasLabel && hasIcon && hasHigh && hasLow && hasRain;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 8 ──────────────────────────────────────────────────────────────

describe('Property 8: Partial forecast shows available days and unavailability indicator', () => {
  it('renders exactly N day cards and shows partial warning for 1–6 days', () => {
    fc.assert(
      fc.property(
        fc.array(forecastDayArb, { minLength: 1, maxLength: 6 }),
        (days) => {
          const { container, unmount } = render(
            <ForecastPanel days={days} unit="celsius" isPartial={true} />
          );

          const cards = container.querySelectorAll('[data-testid="forecast-day-card"]');
          const hasCorrectCount = cards.length === days.length;

          // The partial warning has role="status"
          const hasWarning = container.querySelector('[role="status"]') !== null;

          unmount();

          return hasCorrectCount && hasWarning;
        }
      ),
      { numRuns: 100 }
    );
  });
});
