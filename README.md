# WiseMart

**Shop Smarter with AI**

WiseMart is a production-quality AI-powered e-commerce platform built from the original minor project foundation. It preserves the existing product dataset, images, similarity recommender, and frequently-bought-together model while adding a modern startup-grade interface, authentication, cart, checkout, and deployment readiness.

## Features

- Premium React UI with glassmorphism, gradients, animations, responsive layouts, and AI-inspired product discovery.
- Flask API with SQLAlchemy, SQLite, secure password hashing, and JWT authentication.
- Protected recommendation features for authenticated users.
- AI Recommendation Dashboard with personalized picks, similar products, frequently bought together products, and recommendation explanations.
- Product catalog with category browsing, search, sorting, details, ratings, images, related products, and model-powered recommendations.
- Cart with quantity controls, product images, remove actions, subtotal, GST estimate, shipping, and grand total.
- Checkout to payment to confirmation flow.
- Realistic UPI, card, and net banking payment interface with disabled-payment confirmation. No real payments are processed.
- Profile page with user details, order history placeholder, saved recommendations, and logout.

## Project Structure

```text
WiseMart/
  backend/
    app.py
    model_classes.py
    products.json
    images/
    models/
    requirements.txt
    .env.example
  frontend/
    src/
    package.json
    .env.example
    vite.config.js
  README.md
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

The API runs on `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173`.

## Demo Flow

1. Open the homepage and browse the product catalog.
2. Register or login.
3. Open **AI Picks** to access the protected recommendation dashboard.
4. View a product to see similar products and frequently bought together results.
5. Add items to the cart.
6. Continue through checkout and payment.
7. Click **Pay now** to see the disabled-payment confirmation message.

## Deployment

### Render

Backend:

```bash
cd backend
gunicorn app:app
```

Render settings:

- Runtime: Python
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Environment variables: copy values from `backend/.env.example`

Frontend:

- Deploy as a static site.
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Set `VITE_API_BASE` to the Render backend URL.

### Railway

Backend:

- Root directory: `backend`
- Install command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Set `SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS`, and `PORT`.

Frontend:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run preview -- --port $PORT`
- Set `VITE_API_BASE` to the Railway backend URL.

### Vercel

Frontend:

- Import the repository.
- Set project root to `frontend`.
- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Add `VITE_API_BASE` pointing to the deployed Flask API.

Use Render or Railway for the Flask backend, then connect Vercel to that backend URL.

## Notes

- Payment processing is intentionally disabled.
- SQLite is used for local/demo deployment. For production, replace `DATABASE_URL` with a managed PostgreSQL database.
- The recommendation model pickle files depend on `model_classes.py`; keep that file in the backend.
