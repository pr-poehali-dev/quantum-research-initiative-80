import json
import os
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_by_session(conn, session_id):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.phone, u.name, u.role, u.bonus_balance, u.total_spent
            FROM users u JOIN sessions s ON s.user_id = u.id
            WHERE s.id = %s AND s.expires_at > NOW()
        """, (session_id,))
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'phone': row[1], 'name': row[2], 'role': row[3], 'bonus_balance': row[4], 'total_spent': row[5]}
    return None

def handler(event: dict, context) -> dict:
    """Заявки: создание заявки, список заказов клиента, статус заказа"""
    headers = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id', 'Content-Type': 'application/json'}
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    body = json.loads(event.get('body') or '{}')
    session_id = event.get('headers', {}).get('X-Session-Id') or event.get('headers', {}).get('x-session-id', '')
    query = event.get('queryStringParameters') or {}
    
    conn = get_db()
    
    try:
        # Создать заявку (публичная)
        if path.endswith('/create') and method == 'POST':
            user = get_user_by_session(conn, session_id) if session_id else None
            
            client_name = body.get('client_name', '').strip()
            client_phone = body.get('client_phone', '').strip()
            device_category = body.get('device_category', '')
            device_model = body.get('device_model', '')
            repair_type = body.get('repair_type', '')
            description = body.get('description', '')
            bonus_used = int(body.get('bonus_used', 0))
            city_id = int(body.get('city_id', 1))
            
            if not client_phone or not device_category:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите телефон и тип устройства'})}
            
            with conn.cursor() as cur:
                cur.execute("SELECT nextval('order_seq')")
                seq = cur.fetchone()[0]
                order_number = f'IP-{seq}'
                
                user_id = user['id'] if user else None
                
                if user and bonus_used > 0:
                    if bonus_used > user['bonus_balance']:
                        bonus_used = user['bonus_balance']
                    cur.execute("UPDATE users SET bonus_balance = bonus_balance - %s WHERE id = %s", (bonus_used, user['id']))
                    cur.execute("INSERT INTO bonus_transactions (user_id, type, amount, description) VALUES (%s, 'spend', %s, %s)",
                        (user['id'], bonus_used, f'Списание по заявке {order_number}'))
                
                cur.execute("""
                    INSERT INTO orders (order_number, user_id, client_name, client_phone, city_id, device_category, device_model, repair_type, description, status, bonus_used)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'new', %s)
                    RETURNING id
                """, (order_number, user_id, client_name, client_phone, city_id, device_category, device_model, repair_type, description, bonus_used))
                order_id = cur.fetchone()[0]
            conn.commit()
            
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'order_number': order_number, 'order_id': order_id})}
        
        # Мои заказы
        elif path.endswith('/my') and method == 'GET':
            user = get_user_by_session(conn, session_id)
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, order_number, device_category, device_model, repair_type, status, price, bonus_earned, bonus_used, created_at, admin_comment
                    FROM orders WHERE user_id = %s ORDER BY created_at DESC
                """, (user['id'],))
                rows = cur.fetchall()
                orders = [{'id': r[0], 'order_number': r[1], 'device_category': r[2], 'device_model': r[3], 'repair_type': r[4], 'status': r[5], 'price': r[6], 'bonus_earned': r[7], 'bonus_used': r[8], 'created_at': str(r[9]), 'admin_comment': r[10]} for r in rows]
            
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'orders': orders})}
        
        # Статус по номеру (публичная)
        elif path.endswith('/status') and method == 'GET':
            order_number = query.get('number', '')
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT order_number, device_category, device_model, repair_type, status, price, created_at, admin_comment
                    FROM orders WHERE order_number = %s
                """, (order_number,))
                row = cur.fetchone()
                if not row:
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Заказ не найден'})}
                order = {'order_number': row[0], 'device_category': row[1], 'device_model': row[2], 'repair_type': row[3], 'status': row[4], 'price': row[5], 'created_at': str(row[6]), 'admin_comment': row[7]}
            
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'order': order})}
        
        else:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}
    
    finally:
        conn.close()
