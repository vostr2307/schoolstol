import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

const categoryLabels = {
  kitchen: 'Кухня',
  bakery: 'Выпечка',
  buffet: 'Буфет',
  organized: 'Организованное питание'
};

export default function DishAddForm() {
  const [dishes, setDishes] = useState([]);
  const [category, setCategory] = useState('kitchen');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editing, setEditing] = useState(null);

  const loadDishes = async () => {
    const res = await fetch(${API_URL}/dishes?category=${category});
    const data = await res.json();
    setDishes(data);
  };

  useEffect(() => {
    loadDishes();
  }, [category]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const payload = { name, price: parseFloat(price) || 0, category };

    if (editing) {
      await fetch(${API_URL}/dishes/${editing}, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(${API_URL}/dishes/add, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    setName('');
    setPrice('');
    setEditing(null);
    loadDishes();
  };

  const handleEdit = (dish) => {
    setName(dish.name);
    setPrice(dish.price);
    setEditing(dish.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить блюдо?')) return;
    await fetch(${API_URL}/dishes/${id}, { method: 'DELETE' });
    loadDishes();
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Справочник блюд</h2>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={px-3 py-1 rounded ${category === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />
        <input
          type="number"
          placeholder="Цена"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editing ? 'Сохранить' : 'Добавить'}
        </button>
      </div>

      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left">Название</th>
            <th className="px-3 py-2 text-left">Цена</th>
            <th className="px-3 py-2 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((d) => (
            <tr key={d.id}>
              <td className="px-3 py-2">{d.name}</td>
              <td className="px-3 py-2">{d.price} ₽</td>
              <td className="px-3 py-2 text-right space-x-2">
                <button onClick={() => handleEdit(d)} className="text-blue-600 hover:underline text-sm">Редактировать</button>
                <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline text-sm">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
