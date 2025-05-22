// server.js — полный backend для школстол.рф
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const { DateTime } = require('luxon');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./cafeteria.db');

app.post('/login', (req, res) => {
  const { login, password } = req.body;
  db.get(`SELECT id, name, role, department_id FROM users WHERE login = ? AND password = ?`, [login, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Неверный логин или пароль' });
    res.json(row);
  });
});

app.get('/departments', (req, res) => {
  db.all(`SELECT id, name FROM departments`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/users', (req, res) => {
  db.all(`SELECT u.id, u.name, u.role, u.login, u.department_id, d.name as department FROM users u LEFT JOIN departments d ON u.department_id = d.id`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/users/add', (req, res) => {
  const { name, login, password, department_id, role } = req.body;
  db.run(`INSERT INTO users (name, login, password, role, department_id) VALUES (?, ?, ?, ?, ?)`, [name, login, password, role || 'user', department_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/users/:id', (req, res) => {
  const { name, login, password, department_id, role } = req.body;
  const fields = [];
  const values = [];
  if (name) { fields.push('name = ?'); values.push(name); }
  if (login) { fields.push('login = ?'); values.push(login); }
  if (password) { fields.push('password = ?'); values.push(password); }
  if (department_id) { fields.push('department_id = ?'); values.push(department_id); }
  if (role) { fields.push('role = ?'); values.push(role); }
  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.delete('/users/:id', (req, res) => {
  db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.get('/user-data', (req, res) => {
  const { department_id, date } = req.query;
  const salesSql = `SELECT s.*, d.category, d.name, d.price FROM sales s JOIN dishes d ON s.dish_id = d.id WHERE s.department_id = ? AND s.date = ?`;
  const reportSql = `SELECT * FROM reports WHERE department_id = ? AND date = ?`;

  db.all(salesSql, [department_id, date], (err, sales) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get(reportSql, [department_id, date], (err2, report) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const categorized = { kitchen: {}, bakery: {}, buffet: {}, organized: {} };
      sales.forEach(row => {
        const entry = {
          preparedToday: row.preparedToday,
          sold: row.sold,
          writtenOff: row.writtenOff,
          previousStock: row.previousStock,
          issued: row.issued
        };
        categorized[row.category][row.dish_id] = entry;
      });

      res.json({
        sales: categorized,
        reports: report || {
          expenses: '',
          comment: '',
          totalCash: '',
          totalCard: ''
        }
      });
    });
  });
});

app.post('/user-data', (req, res) => {
  const { department_id, date, sales, reports } = req.body;
  const insertSales = [];
  Object.entries(sales).forEach(([category, dishData]) => {
    Object.entries(dishData).forEach(([dish_id, entry]) => {
      insertSales.push({ department_id, dish_id, category, date, ...entry });
    });
  });

  db.serialize(() => {
    db.run('DELETE FROM sales WHERE department_id = ? AND date = ?', [department_id, date]);
    db.run('DELETE FROM reports WHERE department_id = ? AND date = ?', [department_id, date]);

    const stmt = db.prepare(`INSERT INTO sales (department_id, dish_id, date, preparedToday, sold, writtenOff, previousStock, issued) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    insertSales.forEach(row => {
      stmt.run([row.department_id, row.dish_id, row.date, row.preparedToday || 0, row.sold || 0, row.writtenOff || 0, row.previousStock || 0, row.issued || 0]);
    });
    stmt.finalize();

    db.run(`INSERT INTO reports (department_id, date, expenses, comment, totalCash, totalCard) VALUES (?, ?, ?, ?, ?, ?)`, [department_id, date, reports.expenses || '', reports.comment || '', reports.totalCash || '', reports.totalCard || ''], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Сохранено' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
