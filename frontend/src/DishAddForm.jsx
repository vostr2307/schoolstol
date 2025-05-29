// DishAddForm.jsx
import React, { useState } from 'react';
import { API_URL } from './config';

export default function DishAddForm({ category, onDishAdded }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    const department_id = user?.department_id;

    if (!name || !price || !department_id) {
      alert('Введите название, цену и убедитесь, что вы вошли в систему.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/dishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          category,
          department_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка при добавлении');
      }

      setName('');
      setPrice('');
      onDishAdded(); // обновим список
    } catch (err) {
      console.error('Ошибка при добавлении:', err.message);
      alert(`Ошибка: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-medium mb-2">Добавить блюдо</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название"
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Цена"
          className="border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Добавить
        </button>
      </div>
    </form>
  );
}
