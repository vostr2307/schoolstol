const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Подключение к PostgreSQL из переменной окружения DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Авторизация
app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT id, name, role, department_id FROM users WHERE login = $1 AND password = $2`,
      [login, password]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Неверный логин или пароль' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить список подразделений
app.get('/departments', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name FROM departments`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить список пользователей
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.role, u.login, u.department_id, d.name as department 
      FROM users u LEFT JOIN departments d ON u.department_id = d.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить пользователя
app.post('/users/add', async (req, res) => {
  const { name, login, password, department_id, role } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO users (name, login, password, role, department_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [name, login, password, role || 'user', department_id]);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Редактировать пользователя
app.put('/users/:id', async (req, res) => {
  const { name, login, password, department_id, role } = req.body;
  const fields = [];
  const values = [];
  let i = 1;

  if (name) { fields.push(`name = $${i++}`); values.push(name); }
  if (login) { fields.push(`login = $${i++}`); values.push(login); }
  if (password) { fields.push(`password = $${i++}`); values.push(password); }
  if (department_id) { fields.push(`department_id = $${i++}`); values.push(department_id); }
  if (role) { fields.push(`role = $${i++}`); values.push(role); }

  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);

  try {
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${i}`, values);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить пользователя
app.delete('/users/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить данные пользователя
app.get('/user-data', async (req, res) => {
  const { department_id, date } = req.query;
  try {
    const sales = await pool.query(`
      SELECT s.*, d.category, d.name, d.price 
      FROM sales s JOIN dishes d ON s.dish_id = d.id 
      WHERE s.department_id = $1 AND s.date = $2
    `, [department_id, date]);

    const report = await pool.query(`
      SELECT * FROM reports WHERE department_id = $1 AND date = $2
    `, [department_id, date]);

    const categorized = { kitchen: {}, bakery: {}, buffet: {}, organized: {} };
    sales.rows.forEach(row => {
      const entry = {
        preparedToday: row.preparedtoday,
        sold: row.sold,
        writtenOff: row.writtenoff,
        previousStock: row.previousstock,
        issued: row.issued
      };
      categorized[row.category][row.dish_id] = entry;
    });

    res.json({
      sales: categorized,
      reports: report.rows[0] || {
        expenses: '',
        comment: '',
        totalCash: '',
        totalCard: ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Сохранить данные пользователя
app.post('/user-data', async (req, res) => {
  const { department_id, date, sales, reports } = req.body;

  try {
    await pool.query(`DELETE FROM sales WHERE department_id = $1 AND date = $2`, [department_id, date]);
    await pool.query(`DELETE FROM reports WHERE department_id = $1 AND date = $2`, [department_id, date]);

    const salesInserts = [];
    for (const [category, dishData] of Object.entries(sales)) {
      for (const [dish_id, entry] of Object.entries(dishData)) {
        salesInserts.push(pool.query(`
          INSERT INTO sales (department_id, dish_id, date, preparedToday, sold, writtenOff, previousStock, issued)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          department_id, dish_id, date,
          entry.preparedToday || 0,
          entry.sold || 0,
          entry.writtenOff || 0,
          entry.previousStock || 0,
          entry.issued || 0
        ]));
      }
    }

    await Promise.all(salesInserts);

    await pool.query(`
      INSERT INTO reports (department_id, date, expenses, comment, totalCash, totalCard)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [department_id, date, reports.expenses || '', reports.comment || '', reports.totalCash || '', reports.totalCard || '']);

    res.json({ message: 'Сохранено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Получить список блюд по категории
app.get('/dishes', async (req, res) => {
  const { category, department_id } = req.query;
  try {
    const result = await pool.query(
      'SELECT id, name, price, category FROM dishes WHERE category = $1 AND department_id = $2 ORDER BY name',
      [category, department_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавление блюда пользователем
app.post('/dishes/add', async (req, res) => {
  const { name, price, category, department_id } = req.body;

  if (!name || !category || !department_id) {
    return res.status(400).json({ error: 'Необходимо указать название, категорию и подразделение' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO dishes (name, price, category, department_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, price || 0, category, department_id]
    );
    res.json({ message: 'Блюдо добавлено', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновление блюда
app.put('/dishes/:id', async (req, res) => {
  const { name, price, category } = req.body;
  const { id } = req.params;

  if (!name || !category) {
    return res.status(400).json({ error: 'Укажите название и категорию' });
  }

  try {
    await pool.query(
      'UPDATE dishes SET name = $1, price = $2, category = $3 WHERE id = $4',
      [name, price || 0, category, id]
    );
    res.json({ message: 'Блюдо обновлено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удаление блюда
app.delete('/dishes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(DELETE FROM dishes WHERE id = $1, [id]);
    res.json({ message: 'Блюдо удалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
