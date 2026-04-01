const EMOJIS = [
  { emoji: '⛈️', label: 'thunderstorm', x: 3,  delay: 0,   dur: 7  },
  { emoji: '🌤️', label: 'partly cloudy', x: 12, delay: 1.2, dur: 9  },
  { emoji: '❄️', label: 'snow',          x: 22, delay: 0.5, dur: 8  },
  { emoji: '🌈', label: 'rainbow',       x: 35, delay: 2,   dur: 11 },
  { emoji: '☀️', label: 'sunny',         x: 50, delay: 0.8, dur: 7  },
  { emoji: '🌧️', label: 'rain',          x: 63, delay: 1.5, dur: 10 },
  { emoji: '🌪️', label: 'tornado',       x: 75, delay: 0.3, dur: 8  },
  { emoji: '🌙', label: 'night',         x: 86, delay: 1.8, dur: 9  },
  { emoji: '⚡',  label: 'lightning',    x: 95, delay: 0.6, dur: 6  },
];

const FEATURES = [
  { icon: '🌡️', label: 'Temperature' },
  { icon: '💧', label: 'Humidity' },
  { icon: '💨', label: 'Wind' },
  { icon: '📅', label: '7-Day Forecast' },
  { icon: '📈', label: 'Temp Trend' },
  { icon: '🌧️', label: 'Rain Chart' },
];

export function WeatherHero() {
  return (
    <div className="hero">
      {/* floating emojis */}
      <div className="hero-emojis" aria-hidden="true">
        {EMOJIS.map(({ emoji, label, x, delay, dur }) => (
          <span key={label} className="hero-emoji" style={{
            left: `${x}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${dur}s`,
            fontSize: `${1.5 + (x % 3) * 0.5}rem`,
          }}>{emoji}</span>
        ))}
      </div>

      {/* feature pills — left side */}
      <div className="hero-side hero-side-left" aria-hidden="true">
        {FEATURES.slice(0, 3).map(f => (
          <div key={f.label} className="hero-pill">{f.icon} {f.label}</div>
        ))}
      </div>

      {/* center content */}
      <div className="hero-center">
        <div className="hero-icon">🌍</div>
        <h2 className="hero-title">Your world's weather,<br />at a glance</h2>
        <p className="hero-subtitle">
          Search any city — or allow location access<br />
          for instant local weather.
        </p>
        <div className="hero-arrow">↑ Search above</div>
      </div>

      {/* feature pills — right side */}
      <div className="hero-side hero-side-right" aria-hidden="true">
        {FEATURES.slice(3).map(f => (
          <div key={f.label} className="hero-pill">{f.icon} {f.label}</div>
        ))}
      </div>
    </div>
  );
}
