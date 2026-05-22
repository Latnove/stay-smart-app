import 'normalize.css'
import { configureApi } from '@/shared/lib/api'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'

configureApi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
