import React, { useState } from 'react';

export default function DishAddForm({ category, onDishAdded }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();

    const userStr = localStorage.getItem('user');
    let department_id = null;
    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        department_id = user.department_id;
      }
    } catch {
      department_id = null;
    }

    if (!name || !price || !department_id) {
      alert('Введите название, цену и убедитесь, что вы вошли в систему.');
      return;
    }

    try {
      const response = await fetch(`https://schoolstol.onrender.com/dishes/add`, {
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
        throw new Error(error.error || error.message || 'Ошибка при добавлении');
      }

      setName('');
      setPrice('');
      if (typeof onDishAdded === 'function') onDishAdded();
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
