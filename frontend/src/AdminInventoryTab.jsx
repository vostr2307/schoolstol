// AdminInventoryTab.jsx
import React, { useEffect, useState } from 'react';

export default function AdminInventoryTab() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [department_id, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [filename, setFilename] = useState('');

  useEffect(() => {
    fetch('/departments')
      .then(res => res.json())
      .then(setDepartments);
  }, []);

  const generate = async () => {
    const res = await fetch(`/inventory?department_id=${department_id}&start=${start}&end=${end}`);
    const result = await res.json();
    setFilename(result.filename);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Инвентаризация</h2>
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <select value={department_id} onChange={e => setDepartmentId(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Выберите подразделение</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border rounded px-3 py-2" />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border rounded px-3 py-2" />
        <button onClick={generate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Сформировать</button>
      </div>
      {filename && (
        <div className="bg-white p-4 rounded shadow">
          <p className="mb-2">Инвентаризация: <strong>{filename}</strong></p>
          <a
            href={`/inventory/download/${filename}`}
            className="text-blue-600 hover:underline"
            download
          >Скачать PDF</a>
        </div>
      )}
    </div>
  );
}
