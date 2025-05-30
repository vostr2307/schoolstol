// AppRouter.jsx
import React, { useEffect, useState } from 'react';
import AdminPanel from './AdminPanel';
import LoginPage from './LoginPage';
import App from './App'; // ← ВАЖНО! Импортируем App

export default function AppRouter() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={setUser} />;
  if (user.role === 'admin') return <AdminPanel user={user} onLogout={handleLogout} />;
  if (user.role === 'user') return <App user={user} onLogout={handleLogout} />;
  return <p className="text-center mt-20">Неизвестная роль: {user.role}</p>;
}
