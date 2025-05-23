import React, { useState, useEffect } from 'react';

export default function ReferenceTab() {
  const [category, setCategory] = useState('kitchen');
  const [dishes, setDishes] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const fetchDishes = () => {
    fetch(`https://schoolstol.onrender.com/dishes?category= ${category}`)
      .then(res => res.json())
      .then(setDishes)
      .catch(err => console.error('Ошибка загрузки блюд:', err));
  };

  useEffect(() => {
    fetchDishes();
  }, [category]);

  const handleAdd = async () => {
    if (!newName || !newPrice) return alert('Заполните все поля');

    const user = JSON.parse(localStorage.getItem('user'));
    const department_id = user?.department_id;
    if (!department_id) return alert('Ошибка: не найден department_id');

    try {
      await fetch('https://schoolstol.onrender.com/dishes ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name: newName,
          price: parseFloat(newPrice),
          department_id
        })
      });
      setNewName('');
      setNewPrice('');
      fetchDishes();
    } catch (err) {
      console.error('Ошибка при добавлении блюда:', err);
      alert('Не удалось добавить блюдо');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить блюдо?')) return;

    try {
      await fetch(`https://schoolstol.onrender.com/dishes/ ${id}`, {
        method: 'DELETE'
      });
      fetchDishes();
    } catch (err) {
      console.error('Ошибка при удалении блюда:', err);
      alert('Не удалось удалить блюдо');
    }
  };

  const categories = {
    kitchen: 'Кухня',
    bakery: 'Выпечка',
    buffet: 'Буфет',
    organized: 'Орг. питание'
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-3 py-1 rounded ${
              category === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
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
          {dishes.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                Нет данных
              </td>
            </tr>
          )}
          {dishes
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(dish => (
              <tr key={dish.id}>
                <td className="px-4 py-2">{dish.name}</td>
                <td className="px-4 py-2">{dish.price} ₽</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDelete(dish.id)}
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
