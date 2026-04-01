/**
 * Unit tests for SearchComponent
 * Validates: Requirements 1.3, 1.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchComponent } from '../../components/SearchComponent';
import type { CityResult } from '../../types';
import { ApiError } from '../../services/ForecastService';

// Mock the ForecastService module
vi.mock('../../services/ForecastService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/ForecastService')>();
  return {
    ...actual,
    searchCities: vi.fn(),
  };
});

import { searchCities } from '../../services/ForecastService';
const mockSearchCities = vi.mocked(searchCities);

const makeCities = (count: number): CityResult[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `city-${i}`,
    name: `City${i}`,
    country: 'US',
    lat: i,
    lon: i,
  }));

describe('SearchComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a dropdown with the correct number of items when multiple results are returned', async () => {
    const cities = makeCities(3);
    mockSearchCities.mockResolvedValue(cities);

    const onCitySelect = vi.fn();
    render(<SearchComponent onCitySelect={onCitySelect} />);

    await userEvent.type(screen.getByRole('textbox'), 'London');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });
  });

  it('displays "City not found" when searchCities returns an empty array', async () => {
    mockSearchCities.mockResolvedValue([]);

    render(<SearchComponent onCitySelect={vi.fn()} />);

    await userEvent.type(screen.getByRole('textbox'), 'Nowhere');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('City not found');
    });
  });

  it('displays "Connection error" when searchCities throws an ApiError with type connection', async () => {
    mockSearchCities.mockRejectedValue(new ApiError('connection', 'Network request failed'));

    render(<SearchComponent onCitySelect={vi.fn()} />);

    await userEvent.type(screen.getByRole('textbox'), 'London');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Connection error');
    });
  });

  it('calls onCitySelect with the correct city when a dropdown item is clicked', async () => {
    const cities = makeCities(2);
    mockSearchCities.mockResolvedValue(cities);

    const onCitySelect = vi.fn();
    render(<SearchComponent onCitySelect={onCitySelect} />);

    await userEvent.type(screen.getByRole('textbox'), 'City');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => screen.getAllByRole('option'));

    await userEvent.click(screen.getAllByRole('option')[1]);

    expect(onCitySelect).toHaveBeenCalledOnce();
    expect(onCitySelect).toHaveBeenCalledWith(cities[1]);
  });

  it('closes the dropdown after a city is selected', async () => {
    const cities = makeCities(2);
    mockSearchCities.mockResolvedValue(cities);

    render(<SearchComponent onCitySelect={vi.fn()} />);

    await userEvent.type(screen.getByRole('textbox'), 'City');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => screen.getAllByRole('option'));

    await userEvent.click(screen.getAllByRole('option')[0]);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
