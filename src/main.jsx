import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { IncidentProvider } from './context/IncidentContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <IncidentProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </IncidentProvider>
    </BrowserRouter>
  </React.StrictMode>
);
