import React, { useEffect, useState } from 'react';
import { API_URL } from './config';

export default function AdminAddUserForm({ onUserAdded }) {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch('/departments')
      .then(res => res.json())
      .then(data => setDepartments(data));
  }, []);

  const handleAdd = async () => {
    if (!name || !login || !password || !departmentId) return alert('Заполните все поля');
    await fetch('/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, login, password, department_id: departmentId })
    });
    setName('');
    setLogin('');
    setPassword('');
    setDepartmentId('');
    onUserAdded();
  };

  return (
    <div className="flex space-x-4 items-end">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="ФИО"
        className="border p-2 rounded w-1/4" />
      <input value={login} onChange={e => setLogin(e.target.value)} placeholder="Логин"
        className="border p-2 rounded w-1/4" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" type="password"
        className="border p-2 rounded w-1/4" />
      <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
        className="border p-2 rounded w-1/4">
        <option value="">Выберите подразделение</option>
        {departments.map(dep => (
          <option key={dep.id} value={dep.id}>{dep.name}</option>
        ))}
      </select>
      <button onClick={handleAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Добавить</button>
    </div>
  );
}
