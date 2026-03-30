import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// NOTE: `rrweb` unpack was previously imported but unused, which breaks lint/CI.
// Remove until we actually need replay unpacking in the app runtime.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
