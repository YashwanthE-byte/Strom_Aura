import { Dashboard } from './components/Dashboard'
import { WeatherBackground } from './components/WeatherBackground'
import { useAppContext } from './context/AppContext'
import { getWeatherTheme } from './utils/weatherTheme'

function App() {
  const { state } = useAppContext();
  const theme = state.weatherData
    ? getWeatherTheme(state.weatherData.current.conditionLabel)
    : 'theme-default';

  return (
    <div className={`app ${theme}`}>
      <WeatherBackground theme={theme} />
      <div className="app-content">
        <header className="app-header">
          <div className="app-logo">
            <span className="app-logo-icon">🌩️</span>
            <h1>Strom Aura</h1>
          </div>
          <p className="app-tagline">Real-time weather, beautifully presented</p>
        </header>
        <Dashboard />
      </div>
    </div>
  )
}

export default App
