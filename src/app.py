
from flask import Flask, jsonify, request, Blueprint

from flask_cors import CORS

from blueprints.pedidos.routes import pedidos_bp

from database import mysql

from config import config

app = Flask(__name__)

app.config.from_object(config['development'])

mysql.init_app(app)

# Permitir conexión de Angular con Flask
CORS(app, resources={
    r"/api/.*": {
        "origins": ["http://localhost:4200"]
    }
})

app.register_blueprint(pedidos_bp)


def pagina_no_encontrada(error):

    return jsonify({
        'mensaje': 'Pagina no encontrada',
        'exito': False
    }), 404


app.register_error_handler(404, pagina_no_encontrada)


if __name__ == "__main__":

    print(app.url_map)

    app.run(host='0.0.0.0', port=5000)
