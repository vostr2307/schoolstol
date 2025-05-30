import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppRouter from './AppRouter';

export const DataContext = createContext();

export function useDataContext() {
  return useContext(DataContext);
}

const getTodayISO = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const App = () => {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(getTodayISO());
  const [dishes, setDishes] = useState({});
  const [data, setData] = useState({
    sales: {},
    reports: {}
  });

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
    // Обновим глобальный стейт (можно дополнительно сделать всплывающее окно)
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
      <Router>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-blue-600 text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold">Учет продаж — школстол.рф</h1>
            <div className="text-sm mt-2 sm:mt-0">Дата: {new Date(date).toLocaleDateString('ru-RU')}</div>
          </header>
          <main className="p-4">
            <Routes>
              <Route path="*" element={<AppRouter />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DataContext.Provider>
  );
};

export default App;
