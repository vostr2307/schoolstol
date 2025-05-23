// AdminStatsTab.jsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminStatsTab() {
  const [data, setData] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [department_id, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch('/departments')
      .then(res => res.json())
      .then(setDepartments);
  }, []);

  const load = () => {
    fetch(`/stats?department_id=${department_id}&start=${start}&end=${end}`)
      .then(res => res.json())
      .then(setData);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Статистика</h2>
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <select value={department_id} onChange={e => setDepartmentId(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Подразделение</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border rounded px-3 py-2" />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border rounded px-3 py-2" />
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Показать</button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-medium mb-2">Выручка по дням</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#2563eb" name="Выручка" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
