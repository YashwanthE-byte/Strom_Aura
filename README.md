# 🌦️ Strom Aura

A modern weather application built with **React, TypeScript, Vite, and OpenWeather API**.

Strom Aura allows users to search for a city and view its current weather conditions and forecast.

---

## 🚀 Features

- 🔍 Search weather by city
- 🌡️ Display current temperature
- ☁️ Show current weather conditions
- 💧 Display humidity
- 💨 Display wind information
- 📅 Weather forecast
- 🌍 City-based weather search
- 📱 Responsive user interface
- ⚡ Fast development with Vite
- 🔐 OpenWeather API key configured through an environment variable

---

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **OpenWeather API**
- **HTML**
- **CSS**
- **JavaScript/TypeScript**

## Setup

Copy `.env.example` to `.env.local` and set `VITE_OPENWEATHER_API_KEY` to your
OpenWeather API key, then restart the Vite dev server. City search, current
weather, forecast, and location lookup use this key.

Vite exposes `VITE_` variables in browser code. Restrict the key in your
OpenWeather account and use a server-side proxy if the key must remain secret.

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
