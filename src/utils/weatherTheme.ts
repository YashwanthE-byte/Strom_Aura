/**
 * Returns a CSS class name based on the weather condition label.
 * Used to dynamically theme the app background.
 */
export function getWeatherTheme(conditionLabel: string): string {
  const c = conditionLabel.toLowerCase();
  if (c.includes('thunder') || c.includes('storm'))  return 'theme-storm';
  if (c.includes('snow') || c.includes('blizzard') || c.includes('sleet')) return 'theme-snow';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'theme-rain';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze'))       return 'theme-fog';
  if (c.includes('cloud') || c.includes('overcast'))                        return 'theme-cloudy';
  if (c.includes('clear') || c.includes('sunny'))                           return 'theme-sunny';
  return 'theme-default';
}
