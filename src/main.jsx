import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// `rrweb` was previously imported but unused; remove to keep the entrypoint lean and lint-clean.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
