import React, { useState, useEffect, createContext, useContext } from "react";
import SalesTab from "./SalesTab";
import ReportsTab from "./ReportsTab";
// import ReferenceTab from "./ReferenceTab"; // ← раскомментируй, если есть
// import StatsTab from "./StatsTab"; // ← раскомментируй, если есть

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

const TABS = [
  { id: "sales", label: "Продажи", icon: "🍽️" },
  { id: "report", label: "Отчёт", icon: "📄" },
  // { id: "reference", label: "Справочник", icon: "📚" }, // ← если нужен справочник
  // { id: "stats", label: "Статистика", icon: "📊" }, // ← если нужна статистика
];

const App = ({ user, onLogout }) => {
  const [date, setDate] = useState(getTodayISO());
  const [tab, setTab] = useState("sales");
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

  // --- Контекстные функции ---

  function updateReportField(field, value) {
    setData((prev) => ({
      ...prev,
      reports: { ...prev.reports, [field]: value },
    }));
  }

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

  async function saveCategorySales() {
    await saveReport();
  }

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

  // --- Контекст ---
  const contextValue = {
    user,
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

  // --- Интерфейс ---

  return (
    <DataContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Шапка */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-700 text-white shadow">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span role="img" aria-label="logo">🏫</span> школстол.рф
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0">
            <span className="text-base">{user?.name}</span>
            {user?.department && <span className="text-xs bg-blue-900 rounded px-2 py-1 ml-2">{user.department}</span>}
            <button
              onClick={onLogout}
              className="ml-3 px-4 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold shadow"
            >
              Выйти
            </button>
          </div>
        </header>

        {/* Верхняя панель: дата + вкладки */}
        <nav className="flex flex-col sm:flex-row justify-between items-center bg-blue-100 p-4 gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Дата:</label>
            <input
              type="date"
              className="px-2 py-1 rounded border"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={getTodayISO()}
              style={{ minWidth: 120 }}
            />
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            {TABS.map(tabItem => (
              <button
                key={tabItem.id}
                className={
                  tab === tabItem.id
                    ? "bg-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow"
                    : "px-4 py-2 rounded-full font-semibold text-blue-900 hover:bg-blue-200"
                }
                onClick={() => setTab(tabItem.id)}
              >
                <span className="mr-1">{tabItem.icon}</span>
                {tabItem.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Контент вкладки */}
        <main className="flex-1 p-2 sm:p-4 max-w-4xl mx-auto w-full">
          {tab === "sales" && <SalesTab />}
          {tab === "report" && <ReportsTab />}
          {/* {tab === "reference" && <ReferenceTab />} */}
          {/* {tab === "stats" && <StatsTab />} */}
        </main>

        {/* Футер (опционально) */}
        <footer className="text-center text-gray-500 py-2 text-xs bg-gray-100 border-t">
          © {new Date().getFullYear()} школстол.рф — учёт питания, v1.0
        </footer>
      </div>
    </DataContext.Provider>
  );
};

export default App;
