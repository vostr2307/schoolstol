import React, { useState, useEffect, createContext, useContext } from 'react';
import SalesTab from './SalesTab';
import ReferenceTab from './ReferenceTab';
import ReportsTab from './ReportsTab';

export const DataContext = createContext();

export function useDataContext() {
  return useContext(DataContext);
}

const getTodayISO = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const App = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState(initialUser || null);
  const [date, setDate] = useState(getTodayISO());
  const [dishes, setDishes] = useState({});
  const [data, setData] = useState({
    sales: {},
    reports: {}
  });
  const [tab, setTab] = useState('sales');

  // Подхватываем пользователя из пропсов (при логине)
  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  // Загрузка всех справочников блюд
  useEffect(() => {
    if (!user) return;
    const categories = ['kitchen', 'bakery', 'buffet', 'organized'];
    const fetchAll = async () => {
      const all = {};
      for (const cat of categories) {
        const res = await fetch(`https://schoolstol.onrender.com/dishes?category=${cat}&department_id=${user.department_id}`);
        const data = await res.json();
        all[cat] = data;
      }
      setDishes(all);
    };
    fetchAll();
  }, [user]);

  // Загрузка данных продаж и отчёта для пользователя и даты
  useEffect(() => {
    if (!user || !date) return;
    fetch(`https://schoolstol.onrender.com/user-data?department_id=${user.department_id}&date=${date}`)
      .then(res => res.json())
      .then(resData => {
        setData({
          sales: resData.sales || {},
          reports: resData.reports || {}
        });
      });
  }, [user, date]);

  // Обновление поля продажи
  const updateSalesField = (category, dishId, field, value) => {
    setData(prev => ({
      ...prev,
      sales: {
        ...prev.sales,
        [category]: {
          ...prev.sales[category],
          [dishId]: {
            ...prev.sales[category]?.[dishId],
            [field]: value
          }
        }
      }
    }));
  };

  // Сохранение текущей вкладки продаж на сервере (только одну категорию!)
  const saveCategorySales = async (category) => {
    if (!user) return;
    // Получаем актуальные данные с сервера
    const serverRes = await fetch(`https://schoolstol.onrender.com/user-data?department_id=${user.department_id}&date=${date}`);
    const serverData = await serverRes.json();
    const categorySales = data.sales[category] || {};
    const newSales = { ...serverData.sales, [category]: categorySales };
    // Сохраняем
    await fetch('https://schoolstol.onrender.com/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department_id: user.department_id,
        date,
        sales: newSales,
        reports: serverData.reports || {}
      })
    });
    // Обновим глобальный стейт
    setData(prev => ({
      ...prev,
      sales: newSales
    }));
  };

  // Для отчёта: обновление полей отчёта
  const updateReportField = (field, value) => {
    setData(prev => ({
      ...prev,
      reports: {
        ...prev.reports,
        [field]: value
      }
    }));
  };

  // Для отчёта: подсчёт выручки (суммирует только кухни, выпечки, буфет)
  const calculateRevenue = () => {
    const kitchen = Object.values(data.sales.kitchen || {}).reduce((sum, dish) => sum + Number(dish.sold || 0) * Number(dish.price || 0), 0);
    const bakery = Object.values(data.sales.bakery || {}).reduce((sum, dish) => sum + Number(dish.sold || 0) * Number(dish.price || 0), 0);
    const buffet = Object.values(data.sales.buffet || {}).reduce((sum, dish) => sum + Number(dish.sold || 0) * Number(dish.price || 0), 0);
    return kitchen + bakery + buffet;
  };

  // --- UI с табами ---
  return (
    <DataContext.Provider value={{
      data,
      setData,
      updateSalesField,
      saveCategorySales,
      updateReportField,
      calculateRevenue,
      user,
      setUser,
      date,
      setDate,
      dishes
    }}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold">Учет продаж — школстол.рф</h1>
          <div className="text-sm mt-2 sm:mt-0">Дата: {new Date(date).toLocaleDateString('ru-RU')}</div>
        </header>
        <nav className="flex gap-2 mt-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${tab === 'sales' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTab('sales')}
          >
            Продажи
          </button>
          <button
            className={`px-4 py-2 rounded ${tab === 'reference' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTab('reference')}
          >
            Справочник
          </button>
          <button
            className={`px-4 py-2 rounded ${tab === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTab('report')}
          >
            Отчет
          </button>
          {onLogout && (
            <button className="ml-auto px-4 py-2 rounded bg-red-500 text-white" onClick={onLogout}>
              Выйти
            </button>
          )}
        </nav>
        <main className="p-4 bg-white rounded shadow min-h-[60vh]">
          {tab === 'sales' && <SalesTab />}
          {tab === 'reference' && <ReferenceTab />}
          {tab === 'report' && <ReportsTab />}
        </main>
      </div>
    </DataContext.Provider>
  );
};

export default App;
