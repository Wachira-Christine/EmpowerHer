import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/responsive.css'
import App from './App.jsx'

// Register Service Worker for PWA (Progressive Web Application) offline support
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('ServiceWorker registration successful with scope: ', reg.scope);
        })
        .catch((err) => {
          console.warn('ServiceWorker registration failed: ', err);
        });
    });
  } else {
    // Unregister any active service workers in development mode to prevent route interception
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('ServiceWorker unregistered successfully in development mode.');
          }
        });
      }
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

