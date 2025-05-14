// =============================================
// ============== CODEX MAIN =================
// =============================================
// Main entry point for C.H.A.O.S. Frontend
// Sets up React app with routing and theme providers

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Create root element and render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
