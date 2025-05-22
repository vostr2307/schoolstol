-- Подразделения
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  department_id INTEGER REFERENCES departments(id)
);

-- Блюда
CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL,
  category TEXT,
  department_id INTEGER REFERENCES departments(id)
);

-- Продажи
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL,
  dish_id TEXT NOT NULL,
  date DATE NOT NULL,
  preparedToday INTEGER,
  sold INTEGER,
  writtenOff INTEGER,
  previousStock INTEGER,
  issued INTEGER
);

-- Отчёты
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL,
  date DATE NOT NULL,
  expenses TEXT,
  comment TEXT,
  totalCash TEXT,
  totalCard TEXT
);
