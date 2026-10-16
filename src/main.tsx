import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { isStrapiEnabled } from './services/strapi/strapiConfig'
import { seedIfEmpty } from './seed'

// Only populate browser localStorage demo seed data if not operating in live Strapi API mode
if (!isStrapiEnabled()) {
  seedIfEmpty()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
