import React, { useEffect, useState } from 'react';
import AppRouter from './AppRouter';

const App = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    setCurrentDate(`${day}.${month}.${year}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Учет продаж — школстол.рф</h1>
          <span className="text-sm">{currentDate}</span>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <AppRouter />
      </main>
    </div>
  );
};

export default App;
