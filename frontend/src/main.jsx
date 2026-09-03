import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'
import { AccessibilityProvider } from './hooks/useAccessibility.jsx'
import { TelemetryProvider } from './hooks/useTelemetry.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AccessibilityProvider>
      <TelemetryProvider>
        <App />
      </TelemetryProvider>
    </AccessibilityProvider>
  </StrictMode>,
)
