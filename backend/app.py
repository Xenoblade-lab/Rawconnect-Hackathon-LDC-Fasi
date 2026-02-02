<<<<<<< HEAD
# RAWCONNECT — Point d'entrée Flask (create_app, blueprints, config, CORS)

from flask import Flask

from backend.config import Config
from backend.extensions import init_app as init_extensions


def create_app(config_object=None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object or Config)

    init_extensions(app)

    from backend.api.routes_users import users_bp
    from backend.api.routes_accounts import accounts_bp
    from backend.api.routes_scores import scores_bp
    from backend.api.routes_loans import loans_bp
    from backend.api.routes_agents import agents_bp
    from backend.api.routes_notifications import notifications_bp

    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(accounts_bp, url_prefix="/api")
    app.register_blueprint(scores_bp, url_prefix="/api")
    app.register_blueprint(loans_bp, url_prefix="/api")
    app.register_blueprint(agents_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api")

    @app.route("/")
    def index():
        return {"service": "RAWCONNECT API", "docs": "/api"}, 200

    @app.route("/api")
    def api_index():
        return {
            "endpoints": {
                "register": "POST /api/register",
                "user": "GET /api/user/<phone>",
                "authenticate": "POST /api/authenticate",
                "balance": "GET /api/balance/<phone>",
                "transactions": "GET /api/transactions/<phone>",
                "deposit": "POST /api/deposit",
                "withdraw": "POST /api/withdraw",
                "score": "GET /api/score/<phone>",
                "loan_request": "POST /api/loan/request",
                "loan_accept": "POST /api/loan/accept",
                "loan_repay": "POST /api/loan/repay",
                "agents": "GET /api/agents",
                "agent_authenticate": "POST /api/agent/authenticate",
                "agent_deposit": "POST /api/agent/deposit",
                "agent_withdraw": "POST /api/agent/withdraw",
                "agent_reload": "POST /api/agent/reload",
                "agent_transactions": "POST /api/agent/transactions",
                "notifications": "GET /api/notifications/<phone>?since=id",
            }
        }, 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=Config.FLASK_ENV == "development")
=======
# RAWCONNECT — Point d'entrée Flask (create_app, blueprints, config, CORS)

from flask import Flask

from backend.config import Config
from backend.extensions import init_app as init_extensions


def create_app(config_object=None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object or Config)

    init_extensions(app)

    from backend.api.routes_users import users_bp
    from backend.api.routes_accounts import accounts_bp
    from backend.api.routes_scores import scores_bp
    from backend.api.routes_loans import loans_bp

    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(accounts_bp, url_prefix="/api")
    app.register_blueprint(scores_bp, url_prefix="/api")
    app.register_blueprint(loans_bp, url_prefix="/api")

    @app.route("/")
    def index():
        return {"service": "RAWCONNECT API", "docs": "/api"}, 200

    @app.route("/api")
    def api_index():
        return {
            "endpoints": {
                "register": "POST /api/register",
                "user": "GET /api/user/<phone>",
                "authenticate": "POST /api/authenticate",
                "balance": "GET /api/balance/<phone>",
                "deposit": "POST /api/deposit",
                "withdraw": "POST /api/withdraw",
                "score": "GET /api/score/<phone>",
                "loan_request": "POST /api/loan/request",
                "loan_accept": "POST /api/loan/accept",
                "loan_repay": "POST /api/loan/repay",
            }
        }, 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=Config.FLASK_ENV == "development")
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
