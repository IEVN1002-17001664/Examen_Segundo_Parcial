
from blueprints.pedidos.routes import pedidos_bp

def registrar_blueprints(app):
    app.register_blueprint(pedidos_bp)
