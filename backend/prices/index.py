import json
import os
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Прайс-лист: категории, модели, типы ремонта, цены"""
    headers = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json'}
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    path = event.get('path', '/')
    query = event.get('queryStringParameters') or {}
    conn = get_db()
    
    try:
        # Все категории
        if path.endswith('/categories'):
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, slug, icon, sort_order FROM device_categories WHERE is_active=true ORDER BY sort_order")
                rows = cur.fetchall()
                cats = [{'id': r[0], 'name': r[1], 'slug': r[2], 'icon': r[3], 'sort_order': r[4]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'categories': cats})}
        
        # Модели по категории
        elif path.endswith('/models'):
            category_id = query.get('category_id')
            category_slug = query.get('slug')
            with conn.cursor() as cur:
                if category_id:
                    cur.execute("SELECT id, name FROM device_models WHERE category_id=%s AND is_active=true ORDER BY sort_order", (category_id,))
                elif category_slug:
                    cur.execute("""SELECT dm.id, dm.name FROM device_models dm
                        JOIN device_categories dc ON dc.id = dm.category_id
                        WHERE dc.slug=%s AND dm.is_active=true ORDER BY dm.sort_order""", (category_slug,))
                else:
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите category_id или slug'})}
                rows = cur.fetchall()
                models = [{'id': r[0], 'name': r[1]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'models': models})}
        
        # Типы ремонта по категории
        elif path.endswith('/repair-types'):
            category_id = query.get('category_id')
            with conn.cursor() as cur:
                cur.execute("SELECT id, name FROM repair_types WHERE category_id=%s AND is_active=true ORDER BY sort_order", (category_id,))
                rows = cur.fetchall()
                types = [{'id': r[0], 'name': r[1]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'repair_types': types})}
        
        # Цены по модели и типу ремонта
        elif path.endswith('/list'):
            model_id = query.get('model_id')
            repair_type_id = query.get('repair_type_id')
            with conn.cursor() as cur:
                if model_id and repair_type_id:
                    cur.execute("""SELECT pl.id, dm.name, rt.name, pl.price_from, pl.price_to, pl.duration_hours
                        FROM price_list pl
                        JOIN device_models dm ON dm.id = pl.model_id
                        JOIN repair_types rt ON rt.id = pl.repair_type_id
                        WHERE pl.model_id=%s AND pl.repair_type_id=%s AND pl.is_active=true""", (model_id, repair_type_id))
                elif model_id:
                    cur.execute("""SELECT pl.id, dm.name, rt.name, pl.price_from, pl.price_to, pl.duration_hours
                        FROM price_list pl
                        JOIN device_models dm ON dm.id = pl.model_id
                        JOIN repair_types rt ON rt.id = pl.repair_type_id
                        WHERE pl.model_id=%s AND pl.is_active=true ORDER BY rt.sort_order""", (model_id,))
                else:
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите model_id'})}
                rows = cur.fetchall()
                prices = [{'id': r[0], 'model': r[1], 'repair_type': r[2], 'price_from': r[3], 'price_to': r[4], 'duration_hours': r[5]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'prices': prices})}
        
        else:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}
    
    finally:
        conn.close()
