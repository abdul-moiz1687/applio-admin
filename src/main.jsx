import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AdminAuthProvider } from './context/AdminAuthProvider.jsx'
import { ToastProvider } from './context/ToastProvider.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
