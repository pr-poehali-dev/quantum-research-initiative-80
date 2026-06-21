import json
import os
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_admin_user(conn, session_id):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.phone, u.name, u.role
            FROM users u JOIN sessions s ON s.user_id = u.id
            WHERE s.id = %s AND s.expires_at > NOW() AND u.role IN ('admin', 'manager')
        """, (session_id,))
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'phone': row[1], 'name': row[2], 'role': row[3]}
    return None

def handler(event: dict, context) -> dict:
    """Админ-панель: заказы, пользователи, бонусы, настройки сайта, прайс"""
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
        admin = get_admin_user(conn, session_id)
        if not admin:
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Доступ запрещён'})}
        
        # --- ЗАКАЗЫ ---
        if path.endswith('/orders') and method == 'GET':
            status_filter = query.get('status', '')
            with conn.cursor() as cur:
                if status_filter:
                    cur.execute("""SELECT o.id, o.order_number, o.client_name, o.client_phone, o.device_category, o.device_model, o.repair_type, o.status, o.price, o.bonus_earned, o.bonus_used, o.created_at, o.admin_comment, u.name as user_name
                        FROM orders o LEFT JOIN users u ON u.id = o.user_id
                        WHERE o.status = %s ORDER BY o.created_at DESC LIMIT 100""", (status_filter,))
                else:
                    cur.execute("""SELECT o.id, o.order_number, o.client_name, o.client_phone, o.device_category, o.device_model, o.repair_type, o.status, o.price, o.bonus_earned, o.bonus_used, o.created_at, o.admin_comment, u.name as user_name
                        FROM orders o LEFT JOIN users u ON u.id = o.user_id
                        ORDER BY o.created_at DESC LIMIT 100""")
                rows = cur.fetchall()
                orders = [{'id': r[0], 'order_number': r[1], 'client_name': r[2], 'client_phone': r[3], 'device_category': r[4], 'device_model': r[5], 'repair_type': r[6], 'status': r[7], 'price': r[8], 'bonus_earned': r[9], 'bonus_used': r[10], 'created_at': str(r[11]), 'admin_comment': r[12], 'user_name': r[13]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'orders': orders})}
        
        elif path.endswith('/orders/update') and method == 'PUT':
            order_id = body.get('order_id')
            status = body.get('status')
            price = body.get('price')
            admin_comment = body.get('admin_comment')
            
            with conn.cursor() as cur:
                cur.execute("SELECT user_id, status, price, bonus_earned FROM orders WHERE id=%s", (order_id,))
                row = cur.fetchone()
                if not row:
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Заказ не найден'})}
                user_id, old_status, old_price, old_bonus = row
                
                updates = []
                params = []
                if status:
                    updates.append("status=%s")
                    params.append(status)
                if price is not None:
                    updates.append("price=%s")
                    params.append(price)
                if admin_comment is not None:
                    updates.append("admin_comment=%s")
                    params.append(admin_comment)
                updates.append("updated_at=NOW()")
                params.append(order_id)
                
                cur.execute(f"UPDATE orders SET {', '.join(updates)} WHERE id=%s", params)
                
                # Начислить бонусы при завершении
                if status == 'done' and old_status != 'done' and user_id and price:
                    bonus_amount = int(price * 0.05)
                    cur.execute("UPDATE orders SET bonus_earned=%s WHERE id=%s", (bonus_amount, order_id))
                    cur.execute("UPDATE users SET bonus_balance=bonus_balance+%s, total_spent=total_spent+%s, updated_at=NOW() WHERE id=%s", (bonus_amount, price, user_id))
                    cur.execute("INSERT INTO bonus_transactions (user_id, order_id, type, amount, description) VALUES (%s, %s, 'earn', %s, %s)",
                        (user_id, order_id, bonus_amount, f'Бонусы за заказ #{order_id}'))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
        
        # --- ПОЛЬЗОВАТЕЛИ ---
        elif path.endswith('/users') and method == 'GET':
            search = query.get('search', '')
            with conn.cursor() as cur:
                if search:
                    cur.execute("""SELECT id, phone, name, email, role, bonus_balance, total_spent, created_at FROM users
                        WHERE phone ILIKE %s OR name ILIKE %s ORDER BY created_at DESC LIMIT 50""", (f'%{search}%', f'%{search}%'))
                else:
                    cur.execute("SELECT id, phone, name, email, role, bonus_balance, total_spent, created_at FROM users ORDER BY created_at DESC LIMIT 50")
                rows = cur.fetchall()
                users = [{'id': r[0], 'phone': r[1], 'name': r[2], 'email': r[3], 'role': r[4], 'bonus_balance': r[5], 'total_spent': r[6], 'created_at': str(r[7])} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'users': users})}
        
        # --- БОНУСЫ ---
        elif path.endswith('/bonuses/adjust') and method == 'POST':
            user_id = body.get('user_id')
            amount = int(body.get('amount', 0))
            description = body.get('description', 'Ручная корректировка')
            tx_type = 'earn' if amount > 0 else 'spend'
            
            with conn.cursor() as cur:
                cur.execute("UPDATE users SET bonus_balance=bonus_balance+%s WHERE id=%s", (amount, user_id))
                cur.execute("INSERT INTO bonus_transactions (user_id, type, amount, description) VALUES (%s, %s, %s, %s)",
                    (user_id, tx_type, abs(amount), description))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
        
        # --- НАСТРОЙКИ САЙТА ---
        elif path.endswith('/settings') and method == 'GET':
            with conn.cursor() as cur:
                cur.execute("SELECT key, value, label, type FROM site_settings ORDER BY key")
                rows = cur.fetchall()
                settings = {r[0]: {'value': r[1], 'label': r[2], 'type': r[3]} for r in rows}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'settings': settings})}
        
        elif path.endswith('/settings') and method == 'PUT':
            updates = body.get('updates', {})
            with conn.cursor() as cur:
                for key, value in updates.items():
                    cur.execute("INSERT INTO site_settings (key, value, updated_at) VALUES (%s, %s, NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()", (key, value))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
        
        # --- ПРАЙС ---
        elif path.endswith('/prices') and method == 'GET':
            with conn.cursor() as cur:
                cur.execute("""SELECT pl.id, dc.name as category, dm.name as model, rt.name as repair_type, pl.price_from, pl.price_to, pl.duration_hours, pl.is_active
                    FROM price_list pl
                    JOIN device_models dm ON dm.id=pl.model_id
                    JOIN device_categories dc ON dc.id=dm.category_id
                    JOIN repair_types rt ON rt.id=pl.repair_type_id
                    ORDER BY dc.sort_order, dm.sort_order, rt.sort_order""")
                rows = cur.fetchall()
                prices = [{'id': r[0], 'category': r[1], 'model': r[2], 'repair_type': r[3], 'price_from': r[4], 'price_to': r[5], 'duration_hours': r[6], 'is_active': r[7]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'prices': prices})}
        
        elif path.endswith('/prices') and method == 'POST':
            with conn.cursor() as cur:
                cur.execute("""INSERT INTO price_list (model_id, repair_type_id, price_from, price_to, duration_hours)
                    VALUES (%s, %s, %s, %s, %s) ON CONFLICT (model_id, repair_type_id) DO UPDATE SET price_from=EXCLUDED.price_from, price_to=EXCLUDED.price_to, duration_hours=EXCLUDED.duration_hours""",
                    (body.get('model_id'), body.get('repair_type_id'), body.get('price_from'), body.get('price_to'), body.get('duration_hours', 24)))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
        
        # --- ОТЗЫВЫ ---
        elif path.endswith('/reviews') and method == 'GET':
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, text, rating, device, is_published, created_at FROM reviews ORDER BY created_at DESC")
                rows = cur.fetchall()
                reviews = [{'id': r[0], 'name': r[1], 'text': r[2], 'rating': r[3], 'device': r[4], 'is_published': r[5], 'created_at': str(r[6])} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'reviews': reviews})}
        
        elif path.endswith('/reviews/toggle') and method == 'PUT':
            with conn.cursor() as cur:
                cur.execute("UPDATE reviews SET is_published = NOT is_published WHERE id=%s", (body.get('id'),))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
        
        # --- СТАТИСТИКА ---
        elif path.endswith('/stats') and method == 'GET':
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM orders WHERE status='new'")
                new_orders = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM orders WHERE status='in_progress'")
                in_progress = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM orders WHERE status='done' AND created_at > NOW() - INTERVAL '30 days'")
                done_month = cur.fetchone()[0]
                cur.execute("SELECT COALESCE(SUM(price), 0) FROM orders WHERE status='done' AND created_at > NOW() - INTERVAL '30 days'")
                revenue_month = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM users WHERE role='client'")
                total_clients = cur.fetchone()[0]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'stats': {'new_orders': new_orders, 'in_progress': in_progress, 'done_month': done_month, 'revenue_month': revenue_month, 'total_clients': total_clients}})}
        
        # --- СОЗДАНИЕ АДМИНА ---
        elif path.endswith('/make-admin') and method == 'POST':
            if admin['role'] != 'admin':
                return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Только главный админ'})}
            with conn.cursor() as cur:
                cur.execute("UPDATE users SET role=%s WHERE id=%s", (body.get('role', 'manager'), body.get('user_id')))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
        
        else:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}
    
    finally:
        conn.close()
