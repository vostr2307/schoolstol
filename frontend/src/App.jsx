// App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import SalesTab from './SalesTab';
import ReportsTab from './ReportsTab';
import ReferenceTab from './ReferenceTab';

const DataContext = createContext();
export const useDataContext = () => useContext(DataContext);

export default function App({ user, onLogout }) {
  const [departmentName, setDepartmentName] = useState('');
  const [date] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('sales');
  const [data, setData] = useState({
    sales: { kitchen: {}, bakery: {}, buffet: {}, organized: {} },
    reports: { expenses: '', comment: '', totalCash: '', totalCard: '' }
  });

  useEffect(() => {
    fetch('/departments')
      .then(res => res.json())
      .then(deps => {
        const dep = deps.find(d => d.id === user.department_id);
        if (dep) setDepartmentName(dep.name);
      });
  }, [user.department_id]);

  useEffect(() => {
    fetch(`/user-data?department_id=${user.department_id}&date=${date}`)
      .then(res => res.json())
      .then(setData);
  }, [user.department_id, date]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetch('/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department_id: user.department_id, date, ...data })
      });
    }, 1000);
    return () => clearTimeout(delay);
  }, [data, user.department_id, date]);

  const updateSalesField = (category, dishId, field, value) => {
    setData(prev => ({
      ...prev,
      sales: {
        ...prev.sales,
        [category]: {
          ...prev.sales[category],
          [dishId]: {
            ...prev.sales[category][dishId],
            [field]: value
          }
        }
      }
    }));
  };

  const updateReportField = (field, value) => {
    setData(prev => ({
      ...prev,
      reports: { ...prev.reports, [field]: value }
    }));
  };

  const calculateRevenue = () => {
    let revenue = 0;
    Object.entries(data.sales).forEach(([category, items]) => {
      Object.entries(items).forEach(([_, values]) => {
        const val = values.sold || values.issued || 0;
        revenue += parseFloat(val) || 0;
      });
    });
    revenue += parseFloat(data.reports.totalCash) || 0;
    revenue += parseFloat(data.reports.totalCard) || 0;
    revenue -= parseFloat(data.reports.expenses) || 0;
    return revenue.toFixed(2);
  };

  return (
    <DataContext.Provider value={{ data, updateSalesField, updateReportField, calculateRevenue }}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">Учет продаж — школстол.рф</h1>
            <p className="text-sm text-gray-600">{user.name} — Подразделение: {departmentName}</p>
          </div>
          <button onClick={onLogout} className="text-sm text-blue-600 hover:underline">Выйти</button>
        </header>
        <nav className="bg-white shadow-sm px-4 py-2 flex gap-2">
          <button onClick={() => setActiveTab('sales')} className={`px-3 py-1 rounded ${activeTab === 'sales' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Продажи</button>
          <button onClick={() => setActiveTab('reference')} className={`px-3 py-1 rounded ${activeTab === 'reference' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Справочник</button>
          <button onClick={() => setActiveTab('reports')} className={`px-3 py-1 rounded ${activeTab === 'reports' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Отчет</button>
        </nav>
        <main className="p-4">
          {activeTab === 'sales' && <SalesTab />}
          {activeTab === 'reference' && <ReferenceTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </main>
      </div>
    </DataContext.Provider>
  );
}
