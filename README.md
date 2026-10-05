# Strom Aura

Strom Aura is a weather dashboard built with React, TypeScript, and Vite. It uses the OpenWeather API to show local weather or weather for a city you search for.

## Features

- Detects your location when you allow browser location access
- Lets you search for a city and choose from matching results
- Shows current conditions, including temperature, feels-like temperature, humidity, and wind
- Shows an hourly forecast and a five-day forecast
- Displays temperature and rain charts
- Lets you switch between Celsius and Fahrenheit
- Refreshes weather data periodically

## Requirements

- Node.js and npm
- An OpenWeather API key

## Setup

Open a terminal in the project folder, then install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project folder and add your OpenWeather API key:

```env
VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key
```

Restart the development server after changing the environment file.

> **API key note:** Vite exposes variables prefixed with `VITE_` to browser code. Do not use a key that must remain secret. Restrict your key in your OpenWeather account, or use a server-side proxy for production.

## Run locally

Start the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal. Allow location access to see local weather, or search for a city manually.

## Other commands

Build the production version:

```bash
npm run build
```

Run the tests:

```bash
npm test
```

Run the linter:

```bash
npm run lint
```

## Troubleshooting

- **Weather or city search fails:** Check that `VITE_OPENWEATHER_API_KEY` is set correctly and that the key is active.
- **Location is not detected:** Allow location access in your browser, or search for a city instead.
- **You changed the API key:** Stop and restart the development server so Vite reloads the environment variable.
---

## 📂 Project Structure

```text
Strom_Aura/
│
├── src/
│   ├── components/
│   │   ├── SearchComponent.tsx
│   │   ├── CurrentConditions.tsx
│   │   └── ForecastPanel.tsx
│   │
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── .env
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
