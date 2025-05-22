// SalesTab.jsx
import React, { useState } from 'react';
import { useDataContext } from './App';

export default function SalesTab() {
  const { data, updateSalesField } = useDataContext();
  const [subTab, setSubTab] = useState('kitchen');

  const categories = {
    kitchen: 'Кухня',
    bakery: 'Выпечка',
    buffet: 'Буфет',
    organized: 'Организованное питание'
  };

  const sampleDishes = Object.keys(data.sales[subTab] || {});

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`px-3 py-1 rounded ${subTab === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >{label}</button>
        ))}
      </div>

      <table className="min-w-full bg-white border divide-y divide-gray-200 shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Приготовлено</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Продано</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Списано</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Остатки</th>
          </tr>
        </thead>
        <tbody>
          {sampleDishes.map(dishId => {
            const item = data.sales[subTab][dishId] || {};
            return (
              <tr key={dishId}>
                <td className="px-4 py-2">{dishId}</td>
                <td className="px-4 py-2">
                  <input type="number" value={item.preparedToday || ''} onChange={e => updateSalesField(subTab, dishId, 'preparedToday', e.target.value)} className="w-20 border rounded px-2" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={item.sold || ''} onChange={e => updateSalesField(subTab, dishId, 'sold', e.target.value)} className="w-20 border rounded px-2" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={item.writtenOff || ''} onChange={e => updateSalesField(subTab, dishId, 'writtenOff', e.target.value)} className="w-20 border rounded px-2" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={item.previousStock || ''} onChange={e => updateSalesField(subTab, dishId, 'previousStock', e.target.value)} className="w-20 border rounded px-2" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
