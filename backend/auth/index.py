import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_session(conn, user_id):
    session_id = secrets.token_hex(32)
    expires_at = datetime.now() + timedelta(days=30)
    with conn.cursor() as cur:
        cur.execute("INSERT INTO sessions (id, user_id, expires_at) VALUES (%s, %s, %s)", (session_id, user_id, expires_at))
    conn.commit()
    return session_id

def get_user_by_session(conn, session_id):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.phone, u.name, u.email, u.role, u.bonus_balance, u.total_spent
            FROM users u
            JOIN sessions s ON s.user_id = u.id
            WHERE s.id = %s AND s.expires_at > NOW()
        """, (session_id,))
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'phone': row[1], 'name': row[2], 'email': row[3], 'role': row[4], 'bonus_balance': row[5], 'total_spent': row[6]}
    return None

def get_loyalty_level(total_spent):
    if total_spent >= 50000:
        return {'name': 'Платина', 'discount': 15, 'icon': 'diamond', 'color': 'blue'}
    elif total_spent >= 20000:
        return {'name': 'Золото', 'discount': 10, 'icon': 'crown', 'color': 'gold'}
    elif total_spent >= 5000:
        return {'name': 'Серебро', 'discount': 5, 'icon': 'award', 'color': 'silver'}
    else:
        return {'name': 'Старт', 'discount': 3, 'icon': 'star', 'color': 'gray'}

def handler(event: dict, context) -> dict:
    """Аутентификация: регистрация, вход, выход, профиль"""
    headers = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id', 'Content-Type': 'application/json'}
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    body = json.loads(event.get('body') or '{}')
    session_id = event.get('headers', {}).get('X-Session-Id') or event.get('headers', {}).get('x-session-id', '')
    
    conn = get_db()
    
    try:
        # Регистрация
        if path.endswith('/register') and method == 'POST':
            phone = body.get('phone', '').strip()
            name = body.get('name', '').strip()
            password = body.get('password', '').strip()
            email = body.get('email', '').strip()
            
            if not phone or not password:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Телефон и пароль обязательны'})}
            
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
                if cur.fetchone():
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Пользователь с таким телефоном уже существует'})}
                
                cur.execute(
                    "INSERT INTO users (phone, name, email, password_hash, role) VALUES (%s, %s, %s, %s, 'client') RETURNING id",
                    (phone, name, email, hash_password(password))
                )
                user_id = cur.fetchone()[0]
            conn.commit()
            
            session_id = create_session(conn, user_id)
            user = get_user_by_session(conn, session_id)
            user['loyalty'] = get_loyalty_level(user['total_spent'])
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'session_id': session_id, 'user': user})}
        
        # Вход
        elif path.endswith('/login') and method == 'POST':
            phone = body.get('phone', '').strip()
            password = body.get('password', '').strip()
            
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM users WHERE phone = %s AND password_hash = %s", (phone, hash_password(password)))
                row = cur.fetchone()
                if not row:
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный телефон или пароль'})}
                user_id = row[0]
            
            session_id = create_session(conn, user_id)
            user = get_user_by_session(conn, session_id)
            user['loyalty'] = get_loyalty_level(user['total_spent'])
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'session_id': session_id, 'user': user})}
        
        # Профиль
        elif path.endswith('/me') and method == 'GET':
            user = get_user_by_session(conn, session_id)
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            user['loyalty'] = get_loyalty_level(user['total_spent'])
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'user': user})}
        
        # Обновление профиля
        elif path.endswith('/me') and method == 'PUT':
            user = get_user_by_session(conn, session_id)
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            
            name = body.get('name', user['name'])
            email = body.get('email', user['email'])
            with conn.cursor() as cur:
                cur.execute("UPDATE users SET name=%s, email=%s, updated_at=NOW() WHERE id=%s", (name, email, user['id']))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
        
        # Выход
        elif path.endswith('/logout') and method == 'POST':
            if session_id:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM sessions WHERE id = %s", (session_id,))
                conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
        
        else:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}
    
    finally:
        conn.close()
