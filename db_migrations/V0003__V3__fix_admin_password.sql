-- Обновляем хеш пароля для администратора
-- Пароль: ipro2024admin → sha256
UPDATE users 
SET password_hash = encode(sha256('ipro2024admin'), 'hex')
WHERE phone = '+79993231817' AND role = 'admin';
