// AdminAddUserForm.jsx
import React, { useEffect, useState } from 'react';

export default function AdminAddUserForm({ onUserAdded }) {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [department_id, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch('/departments')
      .then(res => res.json())
      .then(setDepartments);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !login || !password || !department_id) return;
    await fetch('/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, login, password, department_id })
    });
    setName('');
    setLogin('');
    setPassword('');
    setDepartmentId('');
    onUserAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
      <h3 className="font-medium">Добавить пользователя</h3>
      <div className="grid md:grid-cols-4 gap-4 items-end">
        <input
          type="text"
          placeholder="ФИО"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="px-3 py-2 border rounded w-full"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 border rounded w-full"
        />
        <select
          value={department_id}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="px-3 py-2 border rounded w-full"
        >
          <option value="">Выберите подразделение</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >Добавить</button>
    </form>
  );
}
