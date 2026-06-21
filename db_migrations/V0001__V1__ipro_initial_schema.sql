
-- ============================
-- iPro Service Center Database
-- ============================

-- Города
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  telegram VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO cities (name, phone, address, telegram) VALUES
('Барнаул', '+7(999)323-18-17', 'ул. Молодежная 34/1, 1 этаж', '@ipro_barnaul');

-- Пользователи
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(150),
  email VARCHAR(200),
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'client',
  bonus_balance INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  city_id INTEGER REFERENCES cities(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Уровни лояльности
CREATE TABLE loyalty_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  min_spent INTEGER NOT NULL,
  max_spent INTEGER,
  discount_percent INTEGER NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50)
);

INSERT INTO loyalty_levels (name, min_spent, max_spent, discount_percent, icon, color) VALUES
('Старт',   0,     4999,  3,  'star',    'gray'),
('Серебро', 5000,  19999, 5,  'award',   'silver'),
('Золото',  20000, 49999, 10, 'crown',   'gold'),
('Платина', 50000, NULL,  15, 'diamond', 'blue');

-- Категории устройств
CREATE TABLE device_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO device_categories (name, slug, icon, sort_order) VALUES
('iPhone',     'iphone',     'Smartphone',  1),
('iPad',       'ipad',       'Tablet',       2),
('MacBook',    'macbook',    'Laptop',       3),
('iMac',       'imac',       'Monitor',      4),
('Apple Watch','apple-watch','Watch',        5),
('AirPods',    'airpods',    'Headphones',   6),
('Samsung',    'samsung',    'Smartphone',   7),
('Другие',     'other',      'Wrench',       8);

-- Модели устройств
CREATE TABLE device_models (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES device_categories(id),
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO device_models (category_id, name, sort_order) VALUES
(1, 'iPhone 16 Pro Max', 1),
(1, 'iPhone 16 Pro', 2),
(1, 'iPhone 16 Plus', 3),
(1, 'iPhone 16', 4),
(1, 'iPhone 15 Pro Max', 5),
(1, 'iPhone 15 Pro', 6),
(1, 'iPhone 15 Plus', 7),
(1, 'iPhone 15', 8),
(1, 'iPhone 14 Pro Max', 9),
(1, 'iPhone 14 Pro', 10),
(1, 'iPhone 14 Plus', 11),
(1, 'iPhone 14', 12),
(1, 'iPhone 13 Pro Max', 13),
(1, 'iPhone 13 Pro', 14),
(1, 'iPhone 13', 15),
(1, 'iPhone 13 mini', 16),
(1, 'iPhone 12 Pro Max', 17),
(1, 'iPhone 12 Pro', 18),
(1, 'iPhone 12', 19),
(1, 'iPhone 12 mini', 20),
(1, 'iPhone 11 Pro Max', 21),
(1, 'iPhone 11 Pro', 22),
(1, 'iPhone 11', 23),
(1, 'iPhone XS Max', 24),
(1, 'iPhone XS', 25),
(1, 'iPhone XR', 26),
(1, 'iPhone X', 27),
(2, 'iPad Pro 12.9" (2022)', 1),
(2, 'iPad Pro 11" (2022)', 2),
(2, 'iPad Air (2022)', 3),
(2, 'iPad (2022)', 4),
(2, 'iPad mini (2021)', 5),
(3, 'MacBook Pro 16" (M3, 2023)', 1),
(3, 'MacBook Pro 14" (M3, 2023)', 2),
(3, 'MacBook Pro 13" (M2, 2022)', 3),
(3, 'MacBook Air 15" (M2, 2023)', 4),
(3, 'MacBook Air 13" (M2, 2022)', 5),
(3, 'MacBook Air 13" (M1, 2020)', 6),
(3, 'MacBook Pro 13" (до 2020)', 7),
(4, 'iMac 24" (M1/M3)', 1),
(4, 'iMac 27" (2020)', 2),
(4, 'iMac 21.5" (2019)', 3),
(5, 'Apple Watch Series 9', 1),
(5, 'Apple Watch Series 8', 2),
(5, 'Apple Watch Ultra 2', 3),
(5, 'Apple Watch SE (2022)', 4),
(6, 'AirPods Pro 2', 1),
(6, 'AirPods 3', 2),
(6, 'AirPods Max', 3);

-- Типы ремонта
CREATE TABLE repair_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category_id INTEGER REFERENCES device_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO repair_types (name, category_id, sort_order) VALUES
('Замена экрана', 1, 1),
('Замена батареи', 1, 2),
('Замена задней крышки', 1, 3),
('Замена разъема зарядки', 1, 4),
('Ремонт камеры', 1, 5),
('Замена кнопки Home/Face ID', 1, 6),
('Чистка от воды', 1, 7),
('Программный ремонт', 1, 8),
('Замена экрана', 2, 1),
('Замена батареи', 2, 2),
('Замена разъема', 2, 3),
('Замена аккумулятора', 3, 1),
('Замена матрицы', 3, 2),
('Замена клавиатуры', 3, 3),
('Замена трекпада', 3, 4),
('Чистка + термопаста', 3, 5),
('Ремонт разъемов', 3, 6),
('Замена аккумулятора', 5, 1),
('Замена экрана', 5, 2),
('Замена стекла', 5, 3);

-- Прайс-лист
CREATE TABLE price_list (
  id SERIAL PRIMARY KEY,
  model_id INTEGER REFERENCES device_models(id),
  repair_type_id INTEGER REFERENCES repair_types(id),
  price_from INTEGER NOT NULL,
  price_to INTEGER,
  duration_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(model_id, repair_type_id)
);

-- Заявки/Заказы
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  client_name VARCHAR(150),
  client_phone VARCHAR(20),
  city_id INTEGER REFERENCES cities(id),
  device_category VARCHAR(100),
  device_model VARCHAR(150),
  repair_type VARCHAR(150),
  description TEXT,
  status VARCHAR(50) DEFAULT 'new',
  price INTEGER,
  bonus_earned INTEGER DEFAULT 0,
  bonus_used INTEGER DEFAULT 0,
  admin_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE order_seq START 1000;

-- Транзакции бонусов
CREATE TABLE bonus_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  order_id INTEGER REFERENCES orders(id),
  type VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Сессии
CREATE TABLE sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Настройки сайта
CREATE TABLE site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  label VARCHAR(200),
  type VARCHAR(50) DEFAULT 'text',
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO site_settings (key, value, label, type) VALUES
('site_name', 'iPro Сервис', 'Название сайта', 'text'),
('hero_title', 'Ремонт Apple техники в Барнауле', 'Заголовок Hero', 'text'),
('hero_subtitle', 'Профессиональный сервис с гарантией. Оригинальные запчасти. Быстро и надёжно.', 'Подзаголовок Hero', 'textarea'),
('accent_color', '#3730a3', 'Акцентный цвет', 'color'),
('phone_primary', '+7(999)323-18-17', 'Телефон основной', 'text'),
('phone_secondary', '57-18-17', 'Телефон дополнительный', 'text'),
('telegram', '@ipro_barnaul', 'Telegram', 'text'),
('address', 'г. Барнаул, ул. Молодежная 34/1, 1 этаж', 'Адрес', 'text'),
('working_hours', 'Пн–Пт: 9:00–20:00, Сб–Вс: 10:00–18:00', 'Часы работы', 'text'),
('warranty_days', '90', 'Гарантия (дней)', 'number');

-- Отзывы
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  device VARCHAR(100),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO reviews (name, text, rating, device) VALUES
('Алексей М.', 'Отличный сервис! Заменили экран на iPhone 14 Pro за 2 часа. Качество отличное, цена справедливая.', 5, 'iPhone 14 Pro'),
('Марина К.', 'Сдавала MacBook с разбитой матрицей — сделали за день. Теперь как новый!', 5, 'MacBook Air'),
('Дмитрий С.', 'Починили Watch после падения в воду. Думал всё — ан нет, работает. Спасибо!', 5, 'Apple Watch'),
('Анна П.', 'Быстро, качественно, с гарантией. Рекомендую iPro всем друзьям!', 5, 'iPhone 13'),
('Сергей В.', 'Заменили батарею на iPad Pro, всё ок. Бонусы за заказ начислили сразу.', 5, 'iPad Pro'),
('Ольга Т.', 'Отличный сервисный центр в Барнауле. Мастера знают своё дело!', 5, 'iPhone 12 Pro');
