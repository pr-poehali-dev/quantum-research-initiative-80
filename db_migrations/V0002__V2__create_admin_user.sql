-- Создаём аккаунт администратора iPro
-- Пароль: ipro2024admin (sha256)
INSERT INTO users (phone, name, email, password_hash, role)
VALUES (
  '+79993231817',
  'Администратор iPro',
  'admin@ipro-service.ru',
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  'admin'
) ON CONFLICT (phone) DO UPDATE SET role = 'admin';
