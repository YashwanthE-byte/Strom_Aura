import { StrictMode } from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
