import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import '../index.css'

// O StrictMode, só em desenvolvimento, chama cada componente e cada efeito duas vezes para checar idempotência.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
