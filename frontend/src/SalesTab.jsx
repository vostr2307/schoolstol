import React, { useState } from 'react';
import { useDataContext } from './App';
import { Check } from 'lucide-react';

const categories = {
  kitchen: 'Кухня',
  bakery: 'Выпечка',
  buffet: 'Буфет',
  organized: 'Орг. питание'
};

const fields = {
  kitchen: [
    { key: 'previousStock', label: 'Остатки', readonly: true },
    { key: 'preparedToday', label: 'Приготовлено' },
    { key: 'sold', label: 'Продано' },
    { key: 'writtenOff', label: 'Списано' }
  ],
  bakery: [
    { key: 'previousStock', label: 'Остатки', readonly: true },
    { key: 'preparedToday', label: 'Приготовлено' },
    { key: 'sold', label: 'Продано' },
    { key: 'writtenOff', label: 'Списано' }
  ],
  buffet: [
    { key: 'previousStock', label: 'Остатки', readonly: true },
    { key: 'preparedToday', label: 'Приготовлено' },
    { key: 'sold', label: 'Продано' },
    { key: 'writtenOff', label: 'Списано' }
  ],
  organized: [
    { key: 'issued', label: 'Отпущено' }
  ]
};

const SalesTab = () => {
  const { data, updateSalesField, saveCategorySales, user, date, dishes } = useDataContext();
  const [category, setCategory] = useState('kitchen');

  const currentDishes = dishes[category] || [];
  const currentSales = data.sales[category] || {};

  const handleInput = (dishId, field, value) => {
    updateSalesField(category, dishId, field, value);
  };

  const handleSaveCategory = () => {
    saveCategorySales(category); // эта функция отправляет данные на сервер (должна быть реализована в App.jsx)
  };

  // ——— АДАПТИВНАЯ ТАБЛИЦА для мобильных и десктопа ———
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium 
              ${category === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}
              transition-colors duration-100`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Галочка закрепить — одна на всю ширину и всегда видна */}
      <div className="flex justify-center mb-3">
        <button
          onClick={handleSaveCategory}
          title="Закрепить данные этой вкладки"
          className="w-full flex justify-center py-2"
        >
          <span className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full w-10 h-10 shadow-md">
            <Check size={28} />
          </span>
        </button>
      </div>

      {/* Таблица/список — на мобиле 2 строки, на десктопе таблица */}
      <div className="hidden md:block">
        <table className="w-full table-auto border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Название</th>
              {fields[category].map(f => (
                <th key={f.key} className="border px-2 py-1">{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentDishes.map(dish => {
              const entry = currentSales[dish.id] || {};
              return (
                <tr key={dish.id}>
                  <td className="border px-2 py-1">{dish.name}</td>
                  {fields[category].map(f => (
                    <td key={f.key} className="border px-2 py-1">
                      {f.readonly
                        ? entry[f.key] || 0
                        : (
                          <input
                            type="number"
                            value={entry[f.key] || ''}
                            onChange={e => handleInput(dish.id, f.key, e.target.value)}
                            className="w-full border rounded px-1"
                          />
                        )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Мобильная версия — в две строки у блюда */}
      <div className="md:hidden space-y-3">
        {currentDishes.map(dish => {
          const entry = currentSales[dish.id] || {};
          return (
            <div key={dish.id} className="border rounded-lg bg-white px-2 py-1">
              <div className="font-semibold mb-1">{dish.name}</div>
              <div className="flex flex-wrap gap-2 mb-1">
                {fields[category].slice(0, 2).map(f => (
                  <div key={f.key} className="flex flex-col items-start text-sm w-1/2">
                    <span className="text-gray-500">{f.label}</span>
                    {f.readonly
                      ? <span>{entry[f.key] || 0}</span>
                      : (
                        <input
                          type="number"
                          value={entry[f.key] || ''}
                          onChange={e => handleInput(dish.id, f.key, e.target.value)}
                          className="border rounded px-1 w-full"
                        />
                      )
                    }
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {fields[category].slice(2).map(f => (
                  <div key={f.key} className="flex flex-col items-start text-sm w-1/2">
                    <span className="text-gray-500">{f.label}</span>
                    {f.readonly
                      ? <span>{entry[f.key] || 0}</span>
                      : (
                        <input
                          type="number"
                          value={entry[f.key] || ''}
                          onChange={e => handleInput(dish.id, f.key, e.target.value)}
                          className="border rounded px-1 w-full"
                        />
                      )
                    }
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesTab;
