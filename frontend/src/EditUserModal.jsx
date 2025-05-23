// EditUserModal.jsx
import React, { useEffect, useState } from 'react';

export default function EditUserModal({ user, onClose }) {
  const [name, setName] = useState(user.name);
  const [login, setLogin] = useState(user.login);
  const [password, setPassword] = useState('');
  const [department_id, setDepartmentId] = useState(user.department_id);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch(API_URL + '/departments')
      .then(res => res.json())
      .then(setDepartments);
  }, []);

  const handleSave = async () => {
    const updated = {
      name,
      login,
      department_id,
      ...(password && { password })
    };
    await fetch(API_URL + `/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Редактировать пользователя</h2>
        <div className="space-y-4">
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ФИО"
          />
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={login}
            onChange={e => setLogin(e.target.value)}
            placeholder="Логин"
          />
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Новый пароль (необязательно)"
          />
          <select
            value={department_id}
            onChange={e => setDepartmentId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Выберите подразделение</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Отмена</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Сохранить</button>
        </div>
      </div>
    </div>
  );
}
