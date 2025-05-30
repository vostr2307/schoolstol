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
        const flatSales = {};
        for (const cat in data.sales) {
          for (const id in data.sales[cat]) {
            flatSales[String(id)] = data.sales[cat][id];
          }
        }
        setSales(flatSales);
      });
  }, [user, date]);

  useEffect(() => {
    if (!user) return;
    const fetchAllDishes = async () => {
      const catKeys = Object.keys(categories);
      const all = {};
      for (const cat of catKeys) {
        const res = await fetch(`https://schoolstol.onrender.com/dishes?category=${cat}&department_id=${user.department_id}`);
        const data = await res.json();
        all[cat] = data;
      }
      setDishes(all);
    };
    fetchAllDishes();
  }, [user]);

  const handleChange = (dishId, field, value) => {
    setSales(prev => {
      const updated = { ...prev };
      const dishKey = String(dishId);
      if (!updated[dishKey]) updated[dishKey] = {};
      updated[dishKey][field] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`https://schoolstol.onrender.com/user-data?department_id=${user.department_id}&date=${date}`);
      const serverData = await res.json();
      const allSales = serverData.sales || {};

      const updatedCategorySales = {};
      for (const dish of dishes[category]) {
        const entry = sales[dish.id] || {};
        updatedCategorySales[dish.id] = entry;
      }

      const newSales = { ...allSales, [category]: updatedCategorySales };

      const saveRes = await fetch('https://schoolstol.onrender.com/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: user.department_id,
          date,
          sales: newSales,
          reports: serverData.reports || {}
        })
      });

      if (saveRes.ok) {
        alert('Данные сохранены');
      } else {
        alert('Ошибка при сохранении');
      }
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      alert('Произошла ошибка');
    }
  };

  const currentDishes = dishes[category] || [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-4 py-2 rounded-full ${category === key ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={handleSave}
          title="Закрепить данные вкладки"
          className="ml-auto bg-green-600 text-white px-3 py-2 rounded-full text-lg"
        >
          ✓
        </button>
      </div>

      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Название</th>
            <th className="border px-2 py-1">Остатки</th>
            {category !== 'organized' && (
              <>
                <th className="border px-2 py-1">Приготовлено</th>
                <th className="border px-2 py-1">Продано</th>
                <th className="border px-2 py-1">Списано</th>
              </>
            )}
            {category === 'organized' && (
              <>
                <th className="border px-2 py-1">Отпущено</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {currentDishes.map(dish => {
            const entry = sales[String(dish.id)] || {};
            return (
              <tr key={dish.id}>
                <td className="border px-2 py-1">{dish.name}</td>
                <td className="border px-2 py-1">{entry.previousStock || 0}</td>
                {category !== 'organized' && (
                  <>
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
                  </>
                )}
                {category === 'organized' && (
                  <>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={entry.issued || ''}
                        onChange={e => handleChange(dish.id, 'issued', e.target.value)}
                        className="w-full border rounded px-1"
                      />
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTab;
