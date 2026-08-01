import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MissingConfig } from './components/MissingConfig'
import './index.css'

const root = createRoot(document.getElementById('root')!)

const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

if (configured) {
  // Dinamik import: ayarlar eksikken Supabase istemcisi hiç kurulmasın,
  // kullanıcı beyaz ekran yerine ne yapması gerektiğini görsün.
  void import('./App').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
} else {
  root.render(<MissingConfig />)
}
