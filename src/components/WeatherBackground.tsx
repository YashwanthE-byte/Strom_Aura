interface Props { theme: string }

export function WeatherBackground({ theme }: Props) {
  return (
    <div className={`wx-bg wx-bg--${theme}`} aria-hidden="true">
      {/* Sun */}
      {(theme === 'theme-sunny' || theme === 'theme-default') && (
        <div className="wx-sun">
          <div className="wx-sun-core" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="wx-ray" style={{ transform: `rotate(${i * 45}deg)` }} />
          ))}
        </div>
      )}

      {/* Moon + stars for night */}
      {theme === 'theme-default' && (
        <>
          <div className="wx-moon" />
          {[...Array(20)].map((_, i) => (
            <div key={i} className="wx-star" style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 60}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
            }} />
          ))}
        </>
      )}

      {/* Clouds */}
      {(theme === 'theme-cloudy' || theme === 'theme-rain' || theme === 'theme-storm' || theme === 'theme-fog') && (
        <>
          <div className="wx-cloud wx-cloud--1" />
          <div className="wx-cloud wx-cloud--2" />
          <div className="wx-cloud wx-cloud--3" />
          {theme !== 'theme-fog' && <div className="wx-cloud wx-cloud--4" />}
        </>
      )}

      {/* Rain drops */}
      {(theme === 'theme-rain' || theme === 'theme-storm') && (
        <div className="wx-rain">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="wx-drop" style={{
              left: `${(i * 3.3) % 100}%`,
              animationDelay: `${(i * 0.1) % 2}s`,
              animationDuration: `${0.6 + (i % 4) * 0.15}s`,
              opacity: 0.4 + (i % 3) * 0.15,
            }} />
          ))}
        </div>
      )}

      {/* Lightning */}
      {theme === 'theme-storm' && (
        <>
          <div className="wx-lightning wx-lightning--1" />
          <div className="wx-lightning wx-lightning--2" />
        </>
      )}

      {/* Snow flakes */}
      {theme === 'theme-snow' && (
        <div className="wx-snow">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="wx-flake" style={{
              left: `${(i * 4) % 100}%`,
              animationDelay: `${(i * 0.2) % 4}s`,
              animationDuration: `${3 + (i % 4)}s`,
              fontSize: `${0.8 + (i % 3) * 0.4}rem`,
            }}>❄</div>
          ))}
        </div>
      )}

      {/* Fog layers */}
      {theme === 'theme-fog' && (
        <>
          <div className="wx-fog wx-fog--1" />
          <div className="wx-fog wx-fog--2" />
          <div className="wx-fog wx-fog--3" />
        </>
      )}
    </div>
  );
}
