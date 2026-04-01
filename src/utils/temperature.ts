/**
 * Converts a temperature value from Celsius to Fahrenheit.
 * Formula: (celsius * 9/5) + 32
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}
