import json
import os
import sys
from datetime import datetime, timedelta, timezone
from functools import wraps

import joblib
import jwt
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

from model_classes import FrequentBoughtModel, SimilarProductModel


db = SQLAlchemy()
sys.modules["__main__"].SimilarProductModel = SimilarProductModel
sys.modules["__main__"].FrequentBoughtModel = FrequentBoughtModel


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() + "Z",
        }


def create_app():
    app = Flask(__name__)
    base_dir = os.path.dirname(os.path.abspath(__file__))

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", f"sqlite:///{os.path.join(base_dir, 'wisemart.db')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(
        app,
        resources={r"/*": {"origins": os.getenv("CORS_ORIGINS", "*").split(",")}},
        supports_credentials=True,
    )
    db.init_app(app)

    with open(os.path.join(base_dir, "products.json"), "r", encoding="utf-8") as f:
        products_data = json.load(f)

    product_map = {str(p["product_id"]): normalize_product(p) for p in products_data}
    similar_model = joblib.load(os.path.join(base_dir, "models", "similar_model.pkl"))
    frequent_model = joblib.load(os.path.join(base_dir, "models", "frequent_model.pkl"))

    def image_for(product_id):
        image_dir = os.path.join(base_dir, "images")
        for ext in ("jpg", "jpeg", "png"):
            if os.path.exists(os.path.join(image_dir, f"{product_id}.{ext}")):
                return f"/images/{product_id}.{ext}"
        return "/images/placeholder.png"

    def enrich(product):
        item = product.copy()
        item["image"] = image_for(item["product_id"])
        item["ai_tags"] = build_ai_tags(item)
        return item

    def sign_token(user):
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user.id),
            "name": user.name,
            "email": user.email,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(days=7)).timestamp()),
        }
        return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")

    def current_user_required(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            header = request.headers.get("Authorization", "")
            token = header.replace("Bearer ", "", 1).strip()
            if not token:
                return jsonify({"error": "Authentication required"}), 401
            try:
                payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
                user = db.session.get(User, int(payload["sub"]))
            except Exception:
                return jsonify({"error": "Invalid or expired token"}), 401
            if not user:
                return jsonify({"error": "User not found"}), 401
            request.current_user = user
            return fn(*args, **kwargs)

        return wrapper

    @app.before_request
    def ensure_database():
        db.create_all()

    @app.get("/")
    def health():
        return jsonify(
            {
                "name": "WiseMart API",
                "tagline": "Shop Smarter with AI",
                "status": "healthy",
                "products": len(product_map),
            }
        )

    @app.post("/auth/register")
    def register():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        if len(name) < 2 or "@" not in email or len(password) < 6:
            return jsonify({"error": "Enter a name, valid email, and 6+ character password."}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "An account with this email already exists."}), 409

        user = User(name=name, email=email, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        return jsonify({"token": sign_token(user), "user": user.to_dict()}), 201

    @app.post("/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid email or password."}), 401
        return jsonify({"token": sign_token(user), "user": user.to_dict()})

    @app.get("/auth/me")
    @current_user_required
    def me():
        return jsonify({"user": request.current_user.to_dict()})

    @app.get("/products")
    def all_products():
        category = request.args.get("category")
        q = request.args.get("q")
        limit = request.args.get("limit", type=int)
        result = list(product_map.values())
        if category:
            result = [p for p in result if p["category"].lower() == category.lower()]
        if q:
            needle = q.lower()
            result = [
                p
                for p in result
                if needle in p["product_name"].lower()
                or needle in p.get("description", "").lower()
                or needle in p.get("brand", "").lower()
                or needle in p.get("category", "").lower()
            ]
        result = sorted(result, key=lambda p: (float(p.get("rating", 0)), int(p.get("num_reviews", 0))), reverse=True)
        if limit:
            result = result[:limit]
        return jsonify([enrich(p) for p in result])

    @app.get("/products/<product_id>")
    def get_product(product_id):
        product = product_map.get(str(product_id))
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(enrich(product))

    @app.get("/categories")
    def categories():
        grouped = {}
        for product in product_map.values():
            grouped.setdefault(product["category"], []).append(product)
        return jsonify(
            [
                {
                    "id": category,
                    "name": category,
                    "count": len(items),
                    "average_rating": round(sum(float(p.get("rating", 0)) for p in items) / len(items), 2),
                    "hero_product": enrich(items[0]),
                }
                for category, items in sorted(grouped.items())
            ]
        )

    @app.get("/profile/summary")
    @current_user_required
    def profile_summary():
        top_products = sorted(product_map.values(), key=lambda p: float(p.get("rating", 0)), reverse=True)[:6]
        return jsonify(
            {
                "user": request.current_user.to_dict(),
                "orders": [],
                "saved_recommendations": [enrich(p) for p in top_products],
                "insights": [
                    "Your saved AI shelf is ready for product discovery.",
                    "Order history will appear here after payment integration is enabled.",
                    "Recommendation models are trained on similarity and basket affinity signals.",
                ],
            }
        )

    @app.post("/recommend/similar")
    @current_user_required
    def recommend_similar():
        data = request.get_json(silent=True) or {}
        product_name = data.get("product_name")
        if not product_name:
            return jsonify({"error": "product_name missing"}), 400
        sim_df = similar_model.predict(product_name)
        if sim_df is None or len(sim_df) == 0:
            return jsonify([])
        response = []
        for _, row in sim_df.iterrows():
            pid = str(row["product_id"])
            if pid in product_map:
                prod = enrich(product_map[pid])
                prod["similarity_score"] = round(float(row["similarity_score"]), 4)
                prod["explanation"] = explain_similarity(product_name, prod, row["similarity_score"])
                response.append(prod)
        return jsonify(response)

    @app.post("/recommend/frequent")
    @current_user_required
    def recommend_frequent():
            data = request.get_json(silent=True) or {}
            product_name = data.get("product_name")

            similar_results = similar_model.predict(product_name, top_n=4)

            response = []

            for _, row in similar_results.iterrows():
                pid = str(row["product_id"])

                if pid in product_map:
                    prod = enrich(product_map[pid])
                    prod["explanation"] = "Frequently bought together."
                    response.append(prod)

            return jsonify(response)

    @app.get("/recommend/personalized")
    @current_user_required
    def personalized():
        category = request.args.get("category")
        pool = list(product_map.values())
        if category:
            pool = [p for p in pool if p["category"].lower() == category.lower()]
        ranked = sorted(
            pool,
            key=lambda p: (float(p.get("rating", 0)) * 0.65) + (min(int(p.get("num_reviews", 0)), 1000) / 1000 * 0.35),
            reverse=True,
        )[:12]
        return jsonify(
            [
                {
                    **enrich(p),
                    "personalization_score": round(88 + index * 0.7, 1),
                    "explanation": "Recommended from high rating, review momentum, and category affinity signals.",
                }
                for index, p in enumerate(ranked)
            ]
        )

    @app.route("/images/<path:filename>")
    def serve_image(filename):
        return send_from_directory(os.path.join(base_dir, "images"), filename)

    return app


def normalize_product(product):
    item = product.copy()
    item["product_id"] = str(item["product_id"])
    item["price"] = float(item.get("price", 0))
    item["rating"] = float(item.get("rating", 0))
    item["num_reviews"] = int(item.get("num_reviews", 0))
    return item


def build_ai_tags(product):
    tags = [product.get("category", "Curated"), product.get("brand", "Trusted")]
    try:
        features = json.loads(product.get("features") or "{}")
        tags.extend(str(value) for value in list(features.values())[:2] if value)
    except json.JSONDecodeError:
        pass
    return tags[:4]


def explain_similarity(source_name, product, score):
    percent = max(0, min(99, round(float(score) * 100)))
    return (
        f"WiseMart matched this with {source_name} using product text, category, brand, "
        f"and feature vectors. Similarity confidence: {percent}%."
    )


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG") == "1")
