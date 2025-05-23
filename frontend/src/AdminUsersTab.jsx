// AdminUsersTab.jsx
import React, { useEffect, useState } from 'react';
import AdminAddUserForm from './AdminAddUserForm';
import EditUserModal from './EditUserModal';

export default function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = () => {
    fetch(API_URL + '/users')
      .then(res => res.json())
      .then(setUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    await fetch(`/users/${id}`, { method: 'DELETE' });
    loadUsers();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Пользователи</h2>
      <AdminAddUserForm onUserAdded={loadUsers} />
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border divide-y divide-gray-200 shadow rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 uppercase tracking-wider">ФИО</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 uppercase tracking-wider">Логин</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 uppercase tracking-wider">Подразделение</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 uppercase tracking-wider">Роль</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-3 whitespace-nowrap">{user.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{user.login}</td>
                <td className="px-4 py-3 whitespace-nowrap">{user.department}</td>
                <td className="px-4 py-3 whitespace-nowrap">{user.role}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                  <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:underline text-sm">Редактировать</button>
                  <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:underline text-sm">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingUser && <EditUserModal user={editingUser} onClose={() => { setEditingUser(null); loadUsers(); }} />}
    </div>
  );
}
