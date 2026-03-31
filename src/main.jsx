import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// rrweb is integrated elsewhere; keep the entrypoint lean to avoid unused imports.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
