import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AdminAuthProvider } from './contexts/AdminAuthContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { StoriesProvider } from './contexts/StoriesContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <StoriesProvider>
              <App />
            </StoriesProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);