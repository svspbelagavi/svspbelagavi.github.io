import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import ProtectedRoute from './admin/ProtectedRoute';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*
      basename removed for the svspbelagavi.org domain migration.
      When deploying back to GitHub Pages under /swami-vivekanand-seva-pratishthan,
      set basename="/swami-vivekanand-seva-pratishthan" again, or — preferred —
      serve from a custom domain root.
    */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Catch-all → home so deep links don't 404 in client routing */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
