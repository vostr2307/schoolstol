// ReportsTab.jsx
import React, { useState } from "react";
import { useDataContext } from "./App";

const initialEntry = () => ({ category: "", cash: "", acquiring: "", schoolCard: "" });
const initialExpense = () => ({ reason: "", amount: "" });

export default function ReportsTab() {
  const {
    data,
    updateReportField,
    calculateSalesRevenue,
    saveReport,
    user,
    date,
    dishes,
  } = useDataContext();

  // Добавления по оргпитанию
  const [incomeList, setIncomeList] = useState(data.reports.incomeList || []);
  // Вычеты (расходы)
  const [expenseList, setExpenseList] = useState(data.reports.expenseList || []);

  // Добавить поступление
  const addIncome = () => setIncomeList([...incomeList, initialEntry()]);
  const updateIncome = (i, field, value) => {
    const updated = incomeList.map((item, idx) => (idx === i ? { ...item, [field]: value } : item));
    setIncomeList(updated);
  };
  const removeIncome = (i) => setIncomeList(incomeList.filter((_, idx) => idx !== i));

  // Добавить расход
  const addExpense = () => setExpenseList([...expenseList, initialExpense()]);
  const updateExpense = (i, field, value) => {
    const updated = expenseList.map((item, idx) => (idx === i ? { ...item, [field]: value } : item));
    setExpenseList(updated);
  };
  const removeExpense = (i) => setExpenseList(expenseList.filter((_, idx) => idx !== i));

  // Сохранить всё в отчёт
  const handleSave = () => {
    updateReportField("incomeList", incomeList);
    updateReportField("expenseList", expenseList);
    saveReport();
  };

  // Автосохранение после 23:00 по Москве
  React.useEffect(() => {
    const checkAutoSave = () => {
      const now = new Date();
      // МСК = UTC+3
      const hourMoscow = now.getUTCHours() + 3;
      if (hourMoscow >= 23 && !data.reports.sent) {
        handleSave();
        updateReportField("sent", true);
      }
    };
    const interval = setInterval(checkAutoSave, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [incomeList, expenseList, data.reports.sent]);

  // Категории из справочника для оргпитания
  const orgDishes = dishes["organized"] || [];

  // Сумма продаж Кухня, Выпечка, Буфет
  const totalSales = calculateSalesRevenue(["kitchen", "bakery", "buffet"]);

  // Итог: сумма продаж (totalSales) + сумма по оргпитанию (введённая пользователем) - расходы
  const orgIncomeTotal = incomeList.reduce(
    (sum, e) => sum + Number(e.cash || 0) + Number(e.acquiring || 0) + Number(e.schoolCard || 0),
    0
  );
  const expensesTotal = expenseList.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const grandTotal = totalSales + orgIncomeTotal - expensesTotal;

  return (
    <div className="bg-white p-4 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Дневной отчет</h2>

      <div className="mb-3">
        <label className="block font-medium">Общая сумма продаж (кухня+выпечка+буфет):</label>
        <div className="font-bold text-2xl text-green-700">{totalSales} ₽</div>
      </div>

      <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 text-sm font-medium">Сумма по Z-отчету эквайринга</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded"
            value={data.reports.zAcquiring || ""}
            onChange={e => updateReportField("zAcquiring", e.target.value)}
            placeholder="Сумма по эквайрингу"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Сумма по Z-отчету школьные карты</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded"
            value={data.reports.zSchoolCard || ""}
            onChange={e => updateReportField("zSchoolCard", e.target.value)}
            placeholder="Сумма по школьным картам"
          />
        </div>
      </div>

      <div className="mt-4 mb-2 flex items-center gap-2">
        <span className="font-semibold">Добавить выручку по оргпитанию:</span>
        <button type="button" className="px-3 py-1 rounded bg-blue-500 text-white" onClick={addIncome}>+ Добавить</button>
      </div>
      {incomeList.map((entry, i) => (
        <div key={i} className="flex gap-2 mb-2 items-end">
          <select
            className="border rounded px-2 py-1"
            value={entry.category}
            onChange={e => updateIncome(i, "category", e.target.value)}
          >
            <option value="">Выберите категорию</option>
            {orgDishes.map(d => (
              <option value={d.id} key={d.id}>{d.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Нал"
            className="w-20 border rounded px-1"
            value={entry.cash}
            onChange={e => updateIncome(i, "cash", e.target.value)}
          />
          <input
            type="number"
            placeholder="Эквайринг"
            className="w-28 border rounded px-1"
            value={entry.acquiring}
            onChange={e => updateIncome(i, "acquiring", e.target.value)}
          />
          <input
            type="number"
            placeholder="Шк. карта"
            className="w-28 border rounded px-1"
            value={entry.schoolCard}
            onChange={e => updateIncome(i, "schoolCard", e.target.value)}
          />
          <button type="button" className="px-2 text-red-600" onClick={() => removeIncome(i)}>✕</button>
        </div>
      ))}

      <div className="mt-4 mb-2 flex items-center gap-2">
        <span className="font-semibold">Убрать из выручки (расходы):</span>
        <button type="button" className="px-3 py-1 rounded bg-blue-500 text-white" onClick={addExpense}>+ Добавить</button>
      </div>
      {expenseList.map((e, i) => (
        <div key={i} className="flex gap-2 mb-2 items-end">
          <input
            type="text"
            placeholder="Причина"
            className="border rounded px-2 py-1"
            value={e.reason}
            onChange={ev => updateExpense(i, "reason", ev.target.value)}
          />
          <input
            type="number"
            placeholder="Сумма"
            className="w-24 border rounded px-1"
            value={e.amount}
            onChange={ev => updateExpense(i, "amount", ev.target.value)}
          />
          <button type="button" className="px-2 text-red-600" onClick={() => removeExpense(i)}>✕</button>
        </div>
      ))}

      <div className="mt-6 mb-3">
        <label className="block mb-1 text-sm font-medium">Комментарий</label>
        <textarea
          className="w-full px-3 py-2 border rounded resize-none"
          rows={2}
          value={data.reports.comment || ""}
          onChange={e => updateReportField("comment", e.target.value)}
        />
      </div>

      <div className="mt-6 mb-4">
        <p className="text-lg font-bold text-green-700">Финальная сумма к сдаче: {grandTotal} ₽</p>
      </div>

      <div className="flex justify-end">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded text-lg font-semibold shadow"
          onClick={handleSave}
        >
          Отправить отчет
        </button>
      </div>
    </div>
  );
}
