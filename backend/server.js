// server.js
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ... другие роуты (login, users, dishes и т.д.)

// Получить user-data
app.get("/user-data", async (req, res) => {
  const { department_id, date } = req.query;
  try {
    const sales = await pool.query(
      `SELECT s.*, d.category, d.name, d.price 
       FROM sales s JOIN dishes d ON s.dish_id = d.id 
       WHERE s.department_id = $1 AND s.date = $2`,
      [department_id, date]
    );
    const report = await pool.query(
      `SELECT * FROM reports WHERE department_id = $1 AND date = $2`,
      [department_id, date]
    );

    const categorized = { kitchen: {}, bakery: {}, buffet: {}, organized: {} };
    sales.rows.forEach((row) => {
      const entry = {
        preparedToday: row.preparedtoday,
        sold: row.sold,
        writtenOff: row.writtenoff,
        previousStock: row.previousstock,
        issued: row.issued,
      };
      categorized[row.category][row.dish_id] = entry;
    });

    res.json({
      sales: categorized,
      reports: report.rows[0] || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Сохранить user-data
app.post("/user-data", async (req, res) => {
  const { department_id, date, sales, reports } = req.body;
  try {
    await pool.query(
      `DELETE FROM sales WHERE department_id = $1 AND date = $2`,
      [department_id, date]
    );
    await pool.query(
      `DELETE FROM reports WHERE department_id = $1 AND date = $2`,
      [department_id, date]
    );

    // Вставить продажи
    const salesInserts = [];
    for (const [category, dishData] of Object.entries(sales)) {
      for (const [dish_id, entry] of Object.entries(dishData)) {
        salesInserts.push(
          pool.query(
            `INSERT INTO sales (department_id, dish_id, date, preparedToday, sold, writtenOff, previousStock, issued)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              department_id,
              dish_id,
              date,
              entry.preparedToday || 0,
              entry.sold || 0,
              entry.writtenOff || 0,
              entry.previousStock || 0,
              entry.issued || 0,
            ]
          )
        );
      }
    }
    await Promise.all(salesInserts);

    // Вставить отчёт
    await pool.query(
      `INSERT INTO reports 
        (department_id, date, incomeList, expenseList, zAcquiring, zSchoolCard, comment, sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        department_id,
        date,
        reports.incomeList || "[]",
        reports.expenseList || "[]",
        reports.zAcquiring || "",
        reports.zSchoolCard || "",
        reports.comment || "",
        reports.sent || false,
      ]
    );
    res.json({ message: "Сохранено" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... остальные роуты как раньше

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
