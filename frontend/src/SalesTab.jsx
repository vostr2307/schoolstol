import React, { useEffect, useState } from 'react';

const categories = {
  kitchen: 'Кухня',
  bakery: 'Выпечка',
  buffet: 'Буфет',
  organized: 'Организованное питание'
};

const SalesTab = ({ user, date }) => {
  const [sales, setSales] = useState({});
  const [dishes, setDishes] = useState({});
  const [category, setCategory] = useState('kitchen');

  useEffect(() => {
    if (!user || !date) return;
    fetch(`https://schoolstol.onrender.com/user-data?department_id=${user.department_id}&date=${date}`)
      .then(res => res.json())
      .then(data => {
        setSales(data.sales || {});
      });
  }, [user, date]);

  useEffect(() => {
    if (!user || !category) return;
    fetch(`https://schoolstol.onrender.com/dishes?category=${category}&department_id=${user.department_id}`)
      .then(res => res.json())
      .then(data => {
        setDishes(prev => ({ ...prev, [category]: data }));
      });
  }, [user, category]);

  const handleChange = (dishId, field, value) => {
    setSales(prev => {
      const updated = { ...prev };
      if (!updated[category]) updated[category] = {};
      if (!updated[category][dishId]) updated[category][dishId] = {};
      updated[category][dishId][field] = value;
      return updated;
    });
  };

  const currentDishes = dishes[category] || [];
  const currentSales = sales[category] || {};

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-4 py-2 rounded ${category === key ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Название</th>
            <th className="border px-2 py-1">Приготовлено</th>
            <th className="border px-2 py-1">Продано</th>
            <th className="border px-2 py-1">Списано</th>
            <th className="border px-2 py-1">Остатки</th>
          </tr>
        </thead>
        <tbody>
          {currentDishes.map(dish => {
            const entry = currentSales[dish.id] || {};
            return (
              <tr key={dish.id}>
                <td className="border px-2 py-1">{dish.name}</td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={entry.preparedToday || ''}
                    onChange={e => handleChange(dish.id, 'preparedToday', e.target.value)}
                    className="w-full border rounded px-1"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={entry.sold || ''}
                    onChange={e => handleChange(dish.id, 'sold', e.target.value)}
                    className="w-full border rounded px-1"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={entry.writtenOff || ''}
                    onChange={e => handleChange(dish.id, 'writtenOff', e.target.value)}
                    className="w-full border rounded px-1"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={entry.previousStock || ''}
                    onChange={e => handleChange(dish.id, 'previousStock', e.target.value)}
                    className="w-full border rounded px-1"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTab;
