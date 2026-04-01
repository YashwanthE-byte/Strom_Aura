// Feature: weather-dashboard, Property 6: Out-of-range humidity values are discarded

/**
 * Validates: Requirements 4.3
 *
 * Property 6: For any humidity value returned by the API that is less than 0 or
 * greater than 100, ForecastService shall set humidityPercent to null.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sanitizeHumidity } from '../../services/ForecastService';

describe('Property 6: Out-of-range humidity values are discarded', () => {
  it('returns null for any humidity value below 0', () => {
    fc.assert(
      fc.property(
        fc.double({ max: -0.001, noNaN: true }),
        (humidity) => {
          return sanitizeHumidity(humidity) === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns null for any humidity value above 100', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 100.001, noNaN: true }),
        (humidity) => {
          return sanitizeHumidity(humidity) === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns the value unchanged for any humidity in [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100, noNaN: true }),
        (humidity) => {
          return sanitizeHumidity(humidity) === humidity;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('discards out-of-range values from both extremes', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ max: -0.001, noNaN: true }),
          fc.double({ min: 100.001, noNaN: true })
        ),
        (outOfRange) => {
          return sanitizeHumidity(outOfRange) === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});
