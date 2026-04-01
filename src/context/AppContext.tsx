import React, { createContext, useContext, useReducer } from 'react';
import type { AppState, AppError, WeatherData, TemperatureUnit } from '../types';

// Action types
type AppAction =
  | { type: 'SET_WEATHER'; payload: WeatherData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AppError }
  | { type: 'SET_UNIT'; payload: TemperatureUnit };

const initialState: AppState = {
  selectedCity: null,
  weatherData: null,
  unit: 'celsius',
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_WEATHER':
      return {
        ...state,
        weatherData: action.payload,
        selectedCity: action.payload.city,
        error: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_UNIT':
      return {
        ...state,
        unit: action.payload,
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export { AppContext, appReducer };
export type { AppAction };
