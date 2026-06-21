import json
import os
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Публичный контент: настройки сайта, отзывы, города, программа лояльности"""
    headers = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json'}
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    body = json.loads(event.get('body') or '{}')
    conn = get_db()
    
    try:
        # Настройки сайта
        if path.endswith('/settings') and method == 'GET':
            with conn.cursor() as cur:
                cur.execute("SELECT key, value FROM site_settings")
                rows = cur.fetchall()
                settings = {r[0]: r[1] for r in rows}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'settings': settings})}
        
        # Отзывы (опубликованные)
        elif path.endswith('/reviews') and method == 'GET':
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, text, rating, device, created_at FROM reviews WHERE is_published=true ORDER BY created_at DESC LIMIT 12")
                rows = cur.fetchall()
                reviews = [{'id': r[0], 'name': r[1], 'text': r[2], 'rating': r[3], 'device': r[4], 'created_at': str(r[5])} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'reviews': reviews})}
        
        # Города
        elif path.endswith('/cities') and method == 'GET':
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, phone, address, telegram FROM cities WHERE is_active=true ORDER BY name")
                rows = cur.fetchall()
                cities = [{'id': r[0], 'name': r[1], 'phone': r[2], 'address': r[3], 'telegram': r[4]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'cities': cities})}
        
        # Уровни лояльности
        elif path.endswith('/loyalty') and method == 'GET':
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, min_spent, max_spent, discount_percent, icon, color FROM loyalty_levels ORDER BY min_spent")
                rows = cur.fetchall()
                levels = [{'id': r[0], 'name': r[1], 'min_spent': r[2], 'max_spent': r[3], 'discount_percent': r[4], 'icon': r[5], 'color': r[6]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'levels': levels})}
        
        # Добавить отзыв (публичная)
        elif path.endswith('/reviews/add') and method == 'POST':
            name = body.get('name', '').strip()
            text = body.get('text', '').strip()
            device = body.get('device', '').strip()
            rating = int(body.get('rating', 5))
            
            if not name or not text:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Имя и текст обязательны'})}
            
            with conn.cursor() as cur:
                cur.execute("INSERT INTO reviews (name, text, rating, device, is_published) VALUES (%s, %s, %s, %s, false)",
                    (name, text, rating, device))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'message': 'Отзыв отправлен на модерацию'})}
        
        else:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}
    
    finally:
        conn.close()
