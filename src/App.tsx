import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import StoryPage from './pages/StoryPage';
import NewestPage from './pages/NewestPage';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import SubmitPage from './pages/SubmitPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="newest" element={<NewestPage />} />
        <Route path="submit" element={<SubmitPage />} />
        <Route path="item/:id" element={<StoryPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="user/:id" element={<UserPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="cookies" element={<CookiesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;