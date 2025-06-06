import React, { useState, useEffect } from 'react';

export default function ReferenceTab() {
  const [category, setCategory] = useState('kitchen');
  const [dishes, setDishes] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Получаем department_id из объекта user в localStorage
  const userStr = localStorage.getItem('user');
  const department_id = userStr ? JSON.parse(userStr).department_id : null;

  const fetchDishes = () => {
    if (!department_id) return; // Без отдела — не делаем запрос
    fetch(`https://schoolstol.onrender.com/dishes?category=${category}&department_id=${department_id}`)
      .then(res => res.json())
      .then(setDishes);
  };

  useEffect(() => {
    fetchDishes();
    // eslint-disable-next-line
  }, [category]);

  const handleAdd = async () => {
    if (!newName || !newPrice || !department_id) return alert('Заполните все поля');
    await fetch(`https://schoolstol.onrender.com/dishes/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        price: parseFloat(newPrice),
        category,
        department_id
      })
    });
    setNewName('');
    setNewPrice('');
    fetchDishes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить блюдо?')) return;
    await fetch(`https://schoolstol.onrender.com/dishes/${id}`, { method: 'DELETE' });
    fetchDishes();
  };

  const categories = {
    kitchen: 'Кухня',
    bakery: 'Выпечка',
    buffet: 'Буфет',
    organized: 'Орг. питание'
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-3 py-1 rounded ${category === key
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-medium mb-2">Добавить блюдо</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Название"
            className="border px-3 py-2 rounded"
          />
          <input
            type="number"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            placeholder="Цена"
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Добавить
          </button>
        </div>
      </div>

      <table className="min-w-full bg-white border divide-y divide-gray-200 shadow rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Название</th>
            <th className="px-4 py-2 text-left">Цена</th>
            <th className="px-4 py-2 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map(d => (
            <tr key={d.id}>
              <td className="px-4 py-2">{d.name}</td>
              <td className="px-4 py-2">{d.price} ₽</td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
