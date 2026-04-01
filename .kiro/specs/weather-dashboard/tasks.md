# Implementation Plan: Weather Dashboard (Strom Aura)

## Overview

Incremental implementation of the Strom Aura weather dashboard in React + TypeScript. Each task builds on the previous, wiring everything together at the end.

## Tasks

- [x] 1. Set up project structure, types, and state management
  - Scaffold the React + TypeScript project (Vite recommended)
  - Install dependencies: `recharts`, `fast-check`, and a test runner (Vitest + Testing Library)
  - Create `src/types.ts` with all shared interfaces and types: `CityResult`, `WeatherData`, `CurrentWeather`, `ForecastDay`, `TemperatureUnit`, `AppState`, `AppError`
  - Create `src/context/AppContext.tsx` with `AppState`, `useReducer` actions (`SET_WEATHER`, `SET_LOADING`, `SET_ERROR`, `SET_UNIT`), and `AppProvider`
  - Implement `celsiusToFahrenheit` utility in `src/utils/temperature.ts`
  - _Requirements: 2.2, 2.3_

  - [x] 1.1 Write property test for Celsius-to-Fahrenheit conversion
    - **Property 5: Celsius-to-Fahrenheit conversion is correct**
    - **Validates: Requirements 2.3**

- [x] 2. Implement ForecastService
  - Create `src/services/ForecastService.ts` implementing `searchCities` and `fetchWeatherData`
  - Map OpenWeatherMap geocoding response to `CityResult[]`
  - Map current + forecast API response to `WeatherData`, discarding humidity values outside 0–100
  - Throw typed `ApiError` with `type: 'connection'` on network failure
  - _Requirements: 1.2, 1.6, 4.3, 6.2_

  - [x] 2.1 Write unit tests for ForecastService
    - Mock API responses and verify correct parsing into `WeatherData`
    - Test humidity out-of-range discard logic
    - Test connection error propagation
    - _Requirements: 1.6, 4.3_

  - [x] 2.2 Write property test for API failure retaining previous data
    - **Property 4: API failure retains previous data**
    - **Validates: Requirements 1.6**

  - [x] 2.3 Write property test for out-of-range humidity discard
    - **Property 6: Out-of-range humidity values are discarded**
    - **Validates: Requirements 4.3**

- [x] 3. Implement SearchComponent
  - Create `src/components/SearchComponent.tsx` with a text input and submit handler
  - On submit, call `ForecastService.searchCities` and render a dropdown of `CityResult` options when multiple results are returned
  - Call `onCitySelect(city)` and close dropdown on selection
  - Display "City not found" inline error when results are empty
  - Display "Connection error" when the API is unreachable
  - _Requirements: 1.1, 1.3, 1.5, 1.6_

  - [x] 3.1 Write unit tests for SearchComponent
    - Render with mock results, verify dropdown items count and error messages
    - _Requirements: 1.3, 1.5_

  - [x] 3.2 Write property test for city search query forwarding
    - **Property 1: City search queries the API with the submitted name**
    - **Validates: Requirements 1.2**

  - [x] 3.3 Write property test for all returned city options displayed
    - **Property 2: All returned city options are displayed**
    - **Validates: Requirements 1.3**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement CurrentConditions component
  - Create `src/components/CurrentConditions.tsx` displaying temperature (with unit conversion), condition label + icon, humidity, and wind speed/direction
  - Show "—" or "N/A" when humidity is unavailable
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 5.1, 5.2_

  - [x] 5.1 Write unit tests for CurrentConditions
    - Render with known data, verify correct Celsius and Fahrenheit display
    - Verify N/A shown when humidity is null/undefined
    - _Requirements: 2.3, 4.3_

- [x] 6. Implement ForecastPanel component
  - Create `src/components/ForecastPanel.tsx` rendering a row of day cards from `ForecastDay[]`
  - Each card shows date label, condition icon, high temp, low temp, and rain probability
  - When `isPartial` is true, display a partial data warning indicator
  - _Requirements: 6.1, 6.3, 6.4_

  - [x] 6.1 Write unit tests for ForecastPanel
    - Render with 7 days and with partial data (e.g. 4 days), verify card count and warning visibility
    - _Requirements: 6.3, 6.4_

  - [x] 6.2 Write property test for forecast day cards containing all required fields
    - **Property 7: Forecast day cards contain all required fields**
    - **Validates: Requirements 6.3**

  - [x] 6.3 Write property test for partial forecast display
    - **Property 8: Partial forecast shows available days and unavailability indicator**
    - **Validates: Requirements 6.4**

- [x] 7. Implement ChartRenderer with TempLineGraph and RainBarChart
  - Create `src/components/ChartRenderer.tsx` hosting both charts side by side (stacked on mobile)
  - Create `src/components/TempLineGraph.tsx` using Recharts `LineChart` with two `Line` series (high/low) in distinct colors
    - X-axis: `dayLabel` values; Y-axis: temperature in selected unit
    - Tooltip showing exact temperature value and date
  - Create `src/components/RainBarChart.tsx` using Recharts `BarChart` with a single `Bar` series
    - X-axis: `dayLabel` values; Y-axis: 0–100 percentage
    - Custom cell color derived deterministically from `rainProbabilityPercent`
    - Tooltip showing exact rain probability and date
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_

  - [x] 7.1 Write unit tests for ChartRenderer
    - Render with known forecast, verify axis labels and series/bar count
    - _Requirements: 7.1, 7.2, 8.1, 8.2_

  - [x] 7.2 Write property test for charts rendering one data point per forecast day
    - **Property 9: Charts render one data point per forecast day**
    - **Validates: Requirements 7.1, 8.1**

  - [x] 7.3 Write property test for chart axis labels matching forecast days and unit
    - **Property 10: Chart axis labels match forecast days and selected unit**
    - **Validates: Requirements 7.2, 8.2**

  - [x] 7.4 Write property test for tooltip content containing exact value and date
    - **Property 11: Tooltip content contains exact value and date**
    - **Validates: Requirements 7.4, 8.4**

  - [x] 7.5 Write property test for rain probability color gradient
    - **Property 12: Rain probability color gradient maps value to color**
    - **Validates: Requirements 8.3**

  - [x] 7.6 Write property test for charts re-rendering when forecast data changes
    - **Property 13: Charts re-render when forecast data changes**
    - **Validates: Requirements 7.5, 8.5**

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Dashboard with refresh timers
  - Create `src/components/Dashboard.tsx` subscribing to `AppContext`
  - Compose `SearchComponent`, `CurrentConditions`, `ForecastPanel`, and `ChartRenderer`
  - Set up two `setInterval` timers: 10-minute refresh for current conditions, 60-minute refresh for forecast
  - Clear both intervals on unmount
  - Dispatch `SET_WEATHER` on successful fetch; dispatch `SET_ERROR` with `{ type: 'connection', previousData }` on failure, retaining previous `WeatherData`
  - Show connection error banner when `AppState.error.type === 'connection'`
  - _Requirements: 1.4, 2.4, 3.3, 4.2, 5.3, 6.5_

  - [x] 9.1 Write unit tests for Dashboard refresh timers
    - Use fake timers to verify 10-min and 60-min intervals fire and re-fetch correctly
    - Verify intervals are cleared on unmount
    - _Requirements: 2.4, 4.2, 5.3, 6.5_

  - [x] 9.2 Write property test for city selection updating displayed weather data
    - **Property 3: City selection updates displayed weather data**
    - **Validates: Requirements 1.4, 2.1, 3.1, 4.1, 5.1**

- [x] 10. Wire everything together and final integration
  - Wrap the app in `AppProvider` in `src/main.tsx`
  - Ensure unit toggle (Celsius/Fahrenheit) dispatches `SET_UNIT` and all temperature-displaying components re-render correctly
  - Verify empty chart state renders placeholder instead of broken chart
  - _Requirements: 2.2, 2.3, 7.1, 8.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations each
- Each property test file must include the comment tag: `// Feature: weather-dashboard, Property N: <property_text>`
- Test files live under `src/__tests__/unit/` and `src/__tests__/property/`
