// ReportsTab.jsx
import React from 'react';
import { useDataContext } from './App';

export default function ReportsTab() {
  const { data, updateReportField, calculateRevenue } = useDataContext();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Отчет за день</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Наличные</label>
          <input
            type="number"
            value={data.reports.totalCash}
            onChange={e => updateReportField('totalCash', e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Безнал</label>
          <input
            type="number"
            value={data.reports.totalCard}
            onChange={e => updateReportField('totalCard', e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Затраты</label>
          <input
            type="number"
            value={data.reports.expenses}
            onChange={e => updateReportField('expenses', e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Комментарий</label>
          <textarea
            value={data.reports.comment}
            onChange={e => updateReportField('comment', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded resize-none"
          ></textarea>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-lg font-bold text-green-600">Итоговая сумма: {calculateRevenue()} ₽</p>
      </div>
    </div>
  );
}
