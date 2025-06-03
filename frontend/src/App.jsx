import React, { useState, useEffect, createContext, useContext } from "react";

export const DataContext = createContext();

export function useDataContext() {
  return useContext(DataContext);
}

const getTodayISO = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const initialReports = {
  incomeList: [],
  expenseList: [],
  zAcquiring: "",
  zSchoolCard: "",
  comment: "",
  sent: false,
};

const App = ({ children }) => {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(getTodayISO());
  const [dishes, setDishes] = useState({});
  const [data, setData] = useState({
    sales: {},
    reports: { ...initialReports },
  });

  // Загрузка справочников блюд
  useEffect(() => {
    if (!user) return;
    const categories = ["kitchen", "bakery", "buffet", "organized"];
    const fetchAll = async () => {
      const all = {};
      for (const cat of categories) {
        const res = await fetch(
          `https://schoolstol.onrender.com/dishes?category=${cat}&department_id=${user.department_id}`
        );
        all[cat] = await res.json();
      }
      setDishes(all);
    };
    fetchAll();
  }, [user]);

  // Загрузка отчёта и продаж по подразделению и дате
  useEffect(() => {
    if (!user || !date) return;
    fetch(
      `https://schoolstol.onrender.com/user-data?department_id=${user.department_id}&date=${date}`
    )
      .then((r) => r.json())
      .then((res) => {
        setData({
          sales: res.sales || {},
          reports: {
            ...initialReports,
            ...(res.reports || {}),
            incomeList: res.reports?.incomeList ? JSON.parse(res.reports.incomeList) : [],
            expenseList: res.reports?.expenseList ? JSON.parse(res.reports.expenseList) : [],
            zAcquiring: res.reports?.zacquiring || "",
            zSchoolCard: res.reports?.zschoolcard || "",
            sent: res.reports?.sent || false,
            comment: res.reports?.comment || "",
          },
        });
      });
  }, [user, date]);

  // Обновить поле отчёта
  function updateReportField(field, value) {
    setData((prev) => ({
      ...prev,
      reports: { ...prev.reports, [field]: value },
    }));
  }

  // Обновить продажи (поддержка SalesTab)
  function updateSalesField(category, dishId, field, value) {
    setData((prev) => ({
      ...prev,
      sales: {
        ...prev.sales,
        [category]: {
          ...(prev.sales[category] || {}),
          [dishId]: {
            ...(prev.sales[category]?.[dishId] || {}),
            [field]: value,
          },
        },
      },
    }));
  }

  // Сохраняем продажи по вкладке (SalesTab)
  async function saveCategorySales() {
    await saveReport();
  }

  // Сохранить весь отчёт (вызывается из ReportsTab)
  async function saveReport() {
    if (!user) return;
    await fetch(`https://schoolstol.onrender.com/user-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        department_id: user.department_id,
        date,
        sales: data.sales,
        reports: {
          ...data.reports,
          incomeList: JSON.stringify(data.reports.incomeList || []),
          expenseList: JSON.stringify(data.reports.expenseList || []),
        },
      }),
    });
    updateReportField("sent", true);
  }

  // Подсчитать сумму продаж для нужных категорий (кухня, выпечка, буфет)
  function calculateSalesRevenue(categories = ["kitchen", "bakery", "buffet"]) {
    let sum = 0;
    for (const cat of categories) {
      const entries = data.sales[cat] || {};
      for (const dishId in entries) {
        const count = Number(entries[dishId]?.sold || 0);
        const price =
          (dishes[cat]?.find((d) => String(d.id) === String(dishId)) || {}).price || 0;
        sum += count * price;
      }
    }
    return sum;
  }

  const contextValue = {
    user,
    setUser,
    date,
    setDate,
    dishes,
    data,
    updateReportField,
    updateSalesField,
    saveCategorySales,
    saveReport,
    calculateSalesRevenue,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default App;
