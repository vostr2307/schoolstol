// AdminReportsTab.jsx
import React, { useEffect, useState } from 'react';

export default function AdminReportsTab() {
  const [reports, setReports] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetch(`/reports?date=${date}`)
      .then(res => res.json())
      .then(setReports);
  }, [date]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Отчёты за дату</h2>
      <div className="mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border rounded"
        />
      </div>
      <div className="space-y-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex justify-between items-center bg-white p-4 rounded shadow"
          >
            <div>
              <p className="font-medium">{report.department_name}</p>
              <p className="text-sm text-gray-500">Сдан: {report.submitted_at} (МСК)</p>
            </div>
            <a href={`/report/${report.id}/pdf`} target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 hover:text-blue-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
