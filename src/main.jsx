import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// `rrweb` unpack was previously imported but unused; removing avoids bundler/lint noise.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
