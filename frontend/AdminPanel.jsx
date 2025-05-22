// AdminPanel.jsx
import React, { useState } from 'react';
import AdminStatsTab from './AdminStatsTab';
import AdminUsersTab from './AdminUsersTab';
import AdminInventoryTab from './AdminInventoryTab';
import AdminReportsTab from './AdminReportsTab';

export default function AdminPanel({ user, onLogout }) {
  const [tab, setTab] = useState('stats');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-center">Доступ запрещён. Только для администратора.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Админ-панель — школстол.рф</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.name} ({user.role})</span>
          <button onClick={onLogout} className="text-sm text-blue-600 hover:underline">Выйти</button>
        </div>
      </header>

      <nav className="bg-white shadow-sm px-4 py-2 flex gap-2 overflow-x-auto">
        <button onClick={() => setTab('stats')} className={`px-3 py-1 rounded ${tab === 'stats' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>Статистика</button>
        <button onClick={() => setTab('users')} className={`px-3 py-1 rounded ${tab === 'users' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>Пользователи</button>
        <button onClick={() => setTab('inventory')} className={`px-3 py-1 rounded ${tab === 'inventory' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>Инвентаризация</button>
        <button onClick={() => setTab('reports')} className={`px-3 py-1 rounded ${tab === 'reports' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>Отчёты</button>
      </nav>

      <main className="p-4">
        {tab === 'stats' && <AdminStatsTab />}
        {tab === 'users' && <AdminUsersTab />}
        {tab === 'inventory' && <AdminInventoryTab />}
        {tab === 'reports' && <AdminReportsTab />}
      </main>
    </div>
  );
}
