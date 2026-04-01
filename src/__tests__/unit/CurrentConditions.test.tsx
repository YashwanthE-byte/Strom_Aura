import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CurrentConditions } from '../../components/CurrentConditions';
import { celsiusToFahrenheit } from '../../utils/temperature';
import { CurrentWeather } from '../../types';

// Validates: Requirements 2.3, 4.3

const baseData: CurrentWeather = {
  temperatureCelsius: 20,
  conditionLabel: 'Sunny',
  conditionIconCode: '01d',
  humidityPercent: 55,
  windSpeedKph: 15,
  windDirection: 'NW',
};

describe('CurrentConditions', () => {
  it('displays temperature in Celsius with °C suffix', () => {
    render(<CurrentConditions data={baseData} unit="celsius" />);
    // Use getAllByText since temp appears in both hero and feels-like card
    const matches = screen.getAllByText(/20.*°C/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('displays converted temperature in Fahrenheit with °F suffix', () => {
    render(<CurrentConditions data={baseData} unit="fahrenheit" />);
    const expected = celsiusToFahrenheit(20); // 68
    const matches = screen.getAllByText(new RegExp(`${expected}.*°F`));
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows N/A when humidityPercent is null', () => {
    const data: CurrentWeather = { ...baseData, humidityPercent: null };
    render(<CurrentConditions data={data} unit="celsius" />);
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('shows humidity percentage when humidityPercent is a valid number', () => {
    render(<CurrentConditions data={baseData} unit="celsius" />);
    expect(screen.getByText(/55%/)).toBeInTheDocument();
  });

  it('displays condition label and icon', () => {
    render(<CurrentConditions data={baseData} unit="celsius" />);
    expect(screen.getByText('Sunny')).toBeInTheDocument();
    const img = screen.getByRole('img', { name: 'Sunny' });
    // Component now uses @4x for the larger hero icon
    expect(img).toHaveAttribute(
      'src',
      'https://openweathermap.org/img/wn/01d@4x.png'
    );
  });

  it('displays wind speed and direction in separate cards', () => {
    render(<CurrentConditions data={baseData} unit="celsius" />);
    // Wind speed and direction are now in separate cards
    expect(screen.getByText(/15 km\/h/)).toBeInTheDocument();
    expect(screen.getByText('NW')).toBeInTheDocument();
  });
});
