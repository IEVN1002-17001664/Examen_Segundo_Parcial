
from flask import Blueprint, jsonify, request
from database import mysql
from datetime import datetime

pedidos_bp = Blueprint(
    'pedidos',
    __name__,
    url_prefix='/api/pedidos'
)


def fila_a_diccionario(cursor, fila):
    columnas = [columna[0] for columna in cursor.description]
    return dict(zip(columnas, fila))


# GET: Listar pedidos
@pedidos_bp.route("/", methods=['GET'])
def listar_pedidos():

    cursor = None

    try:
        cursor = mysql.connection.cursor()

        cursor.execute("SELECT * FROM pedidos ORDER BY id_pedido DESC")

        datos = cursor.fetchall()

        pedidos = [
            fila_a_diccionario(cursor, fila)
            for fila in datos
        ]

        return jsonify({
            'pedidos': pedidos,
            'mensaje': 'Lista de pedidos',
            'exito': True
        }), 200

    except Exception as ex:
        return jsonify({
            'mensaje': 'Error al consultar los pedidos {}'.format(ex),
            'exito': False
        }), 500

    finally:
        if cursor is not None:
            cursor.close()


# GET: Consultar un pedido con su detalle
@pedidos_bp.route("/<int:id_pedido>", methods=['GET'])
def leer_pedido(id_pedido):

    cursor = None

    try:
        cursor = mysql.connection.cursor()

        cursor.execute(
            "SELECT * FROM pedidos WHERE id_pedido=%s",
            (id_pedido,)
        )

        fila = cursor.fetchone()

        if fila is None:
            return jsonify({
                'mensaje': 'Pedido no encontrado',
                'exito': False
            }), 404

        pedido = fila_a_diccionario(cursor, fila)

        cursor.execute(
            "SELECT * FROM detalle_pedido WHERE id_pedido=%s",
            (id_pedido,)
        )

        datos = cursor.fetchall()

        detalle = [
            fila_a_diccionario(cursor, fila)
            for fila in datos
        ]

        return jsonify({
            'pedido': pedido,
            'detalle': detalle,
            'exito': True
        }), 200

    except Exception as ex:
        return jsonify({
            'mensaje': 'Error al consultar el pedido {}'.format(ex),
            'exito': False
        }), 500

    finally:
        if cursor is not None:
            cursor.close()


# POST: Registrar pedido y sus pizzas
@pedidos_bp.route("/", methods=['POST'])
def registrar_pedido():

    datos = request.get_json(silent=True)

    if not isinstance(datos, dict):
        return jsonify({
            'mensaje': 'Se requiere un objeto JSON',
            'exito': False
        }), 400

    nombre = datos.get('nombre_cliente')
    direccion = datos.get('direccion')
    telefono = datos.get('telefono')
    fecha_pedido = datos.get('fecha_pedido')
    detalle = datos.get('detalle')

    if not all(
        isinstance(campo, str) and campo.strip()
        for campo in [nombre, direccion, telefono, fecha_pedido]
    ):
        return jsonify({
            'mensaje': 'Faltan datos del cliente',
            'exito': False
        }), 400

    try:
        fecha_pedido = datetime.strptime(
            fecha_pedido.strip(),
            '%Y-%m-%d'
        ).date()

    except ValueError:
        return jsonify({
            'mensaje': 'La fecha debe tener el formato AAAA-MM-DD',
            'exito': False
        }), 400

    if not isinstance(detalle, list) or len(detalle) == 0:
        return jsonify({
            'mensaje': 'El pedido debe contener al menos una pizza',
            'exito': False
        }), 400

    total = 0

    for pizza in detalle:

        if not isinstance(pizza, dict):
            return jsonify({
                'mensaje': 'Datos de pizza invalidos',
                'exito': False
            }), 400

        tamano = pizza.get('tamano')
        ingredientes = pizza.get('ingredientes', '')
        cantidad = pizza.get('cantidad')
        subtotal = pizza.get('subtotal')

        if (
            not isinstance(tamano, str)
            or not tamano.strip()
            or not isinstance(ingredientes, str)
            or not isinstance(cantidad, int)
            or isinstance(cantidad, bool)
            or cantidad <= 0
            or not isinstance(subtotal, (int, float))
            or isinstance(subtotal, bool)
            or subtotal < 0
        ):
            return jsonify({
                'mensaje': 'Datos de pizza invalidos',
                'exito': False
            }), 400

        total += subtotal

    cursor = None

    try:
        cursor = mysql.connection.cursor()

        cursor.execute("""
            INSERT INTO pedidos
                (nombre_cliente, direccion, telefono, fecha_pedido, total)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            nombre.strip(),
            direccion.strip(),
            telefono.strip(),
            fecha_pedido,
            total
        ))

        id_pedido = cursor.lastrowid

        for pizza in detalle:

            cursor.execute("""
                INSERT INTO detalle_pedido
                    (id_pedido, tamano, ingredientes, cantidad, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                id_pedido,
                pizza['tamano'].strip(),
                pizza.get('ingredientes', ''),
                pizza['cantidad'],
                pizza['subtotal']
            ))

        mysql.connection.commit()

        return jsonify({
            'mensaje': 'Pedido registrado correctamente',
            'id_pedido': id_pedido,
            'total': total,
            'exito': True
        }), 201

    except Exception as ex:
        mysql.connection.rollback()

        return jsonify({
            'mensaje': 'Error al registrar el pedido {}'.format(ex),
            'exito': False
        }), 500

    finally:
        if cursor is not None:
            cursor.close()


# GET: Consultar ventas por dia de la semana
@pedidos_bp.route("/ventas/dia/<string:dia>", methods=['GET'])
def ventas_dia(dia):

    cursor = None

    dias = {
        'lunes': 2,
        'martes': 3,
        'miercoles': 4,
        'jueves': 5,
        'viernes': 6,
        'sabado': 7,
        'domingo': 1
    }

    try:
        dia = dia.lower()

        if dia not in dias:
            return jsonify({
                'mensaje': 'Dia invalido',
                'exito': False
            }), 400

        cursor = mysql.connection.cursor()

        cursor.execute("""
            SELECT id_pedido, nombre_cliente, total, fecha_pedido
            FROM pedidos
            WHERE DAYOFWEEK(fecha_pedido)=%s
            ORDER BY fecha_pedido DESC
        """, (dias[dia],))

        datos = cursor.fetchall()

        ventas = [
            fila_a_diccionario(cursor, fila)
            for fila in datos
        ]

        cursor.execute("""
            SELECT COALESCE(SUM(total), 0)
            FROM pedidos
            WHERE DAYOFWEEK(fecha_pedido)=%s
        """, (dias[dia],))

        total_dia = cursor.fetchone()[0]

        return jsonify({
            'ventas': ventas,
            'total_dia': float(total_dia),
            'mensaje': 'Ventas del dia consultadas',
            'exito': True
        }), 200

    except Exception as ex:
        return jsonify({
            'mensaje': 'Error al consultar las ventas {}'.format(ex),
            'exito': False
        }), 500

    finally:
        if cursor is not None:
            cursor.close()


# GET: Consultar ventas por mes
@pedidos_bp.route("/ventas/mes/<int:anio>/<int:mes>", methods=['GET'])
def ventas_mes(anio, mes):

    cursor = None

    try:
        if mes < 1 or mes > 12:
            return jsonify({
                'mensaje': 'Mes invalido',
                'exito': False
            }), 400

        cursor = mysql.connection.cursor()

        cursor.execute("""
            SELECT id_pedido, nombre_cliente, total, fecha_pedido
            FROM pedidos
            WHERE YEAR(fecha_pedido)=%s
            AND MONTH(fecha_pedido)=%s
            ORDER BY fecha_pedido DESC
        """, (anio, mes))

        datos = cursor.fetchall()

        ventas = [
            fila_a_diccionario(cursor, fila)
            for fila in datos
        ]

        cursor.execute("""
            SELECT COALESCE(SUM(total), 0)
            FROM pedidos
            WHERE YEAR(fecha_pedido)=%s
            AND MONTH(fecha_pedido)=%s
        """, (anio, mes))

        total_mes = cursor.fetchone()[0]

        return jsonify({
            'ventas': ventas,
            'total_mes': float(total_mes),
            'mensaje': 'Ventas del mes consultadas',
            'exito': True
        }), 200

    except Exception as ex:
        return jsonify({
            'mensaje': 'Error al consultar las ventas {}'.format(ex),
            'exito': False
        }), 500

    finally:
        if cursor is not None:
            cursor.close()
