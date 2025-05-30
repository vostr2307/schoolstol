import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './AppRouter';

const App = () => {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleLogout = () => {
    setUser(null);
  };

  const departmentName = user?.department || '';

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">Учет продаж — школстол.рф</h1>
            <p className="text-sm text-gray-600">{user?.name} — Подразделение: {departmentName}</p>
          </div>
          <div className="flex flex-col items-end text-sm">
            <div className="text-gray-500">{new Date(date).toLocaleDateString('ru-RU')}</div>
            <button onClick={handleLogout} className="text-blue-600 hover:underline">Выйти</button>
          </div>
        </header>

        <main className="p-4">
          <AppRouter user={user} setUser={setUser} date={date} setDate={setDate} />
        </main>
      </div>
    </Router>
  );
};

export default App;
