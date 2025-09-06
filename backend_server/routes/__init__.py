from flask import Blueprint

def register_routes(app):
    from .supplements import supplements_bp
    from .users import users_bp
    from .health import health_bp
    from .auth import auth_bp
    from .essentials import essentials_bp

    app.register_blueprint(supplements_bp, url_prefix="/api/supplements")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(essentials_bp, url_prefix="/api/essentials")