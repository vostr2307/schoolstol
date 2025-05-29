// ReferenceTab.jsx
import React, { useState, useEffect } from 'react';
import { API_URL } from './config';
import DishAddForm from './DishAddForm';

export default function ReferenceTab() {
  const [category, setCategory] = useState('kitchen');
  const [dishes, setDishes] = useState([]);

  const department_id = localStorage.getItem('department_id');

  const fetchDishes = () => {
    if (!department_id) return;
    fetch(`${API_URL}/dishes?category=${category}&department_id=${department_id}`)
      .then(res => res.json())
      .then(setDishes);
  };

  useEffect(() => {
    fetchDishes();
  }, [category]);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить блюдо?')) return;
    await fetch(`${API_URL}/dishes/${id}`, { method: 'DELETE' });
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
        <DishAddForm onDishAdded={fetchDishes} category={category} />
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
          {dishes.sort((a, b) => a.name.localeCompare(b.name)).map(d => (
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
