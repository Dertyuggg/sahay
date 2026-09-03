import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AccessibilityProvider } from './hooks/useAccessibility.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </BrowserRouter>
  </StrictMode>,
)
