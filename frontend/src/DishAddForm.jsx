// DishAddForm.jsx
import React, { useState } from 'react';
import { API_URL } from './config';

export default function DishAddForm({ onDishAdded, category }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const department_id = localStorage.getItem('department_id');

  const handleAdd = async () => {
    if (!name || !price || !department_id) return;

    await fetch(`${API_URL}/dishes/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: parseFloat(price), category, department_id })
    });

    setName('');
    setPrice('');
    onDishAdded();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Название"
        className="border px-3 py-2 rounded"
      />
      <input
        type="number"
        value={price}
        onChange={e => setPrice(e.target.value)}
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
  );
}
