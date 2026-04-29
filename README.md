# Phantom Store

Phantom Store is a production-ready MERN boilerplate for a browser-native AR try-on e-commerce platform. It includes a React + Vite storefront, a Node.js + Express API, MongoDB models, JWT authentication, Stripe payments, Cloudinary uploads, OpenAI-powered product intelligence, and TensorFlow/Three.js AR foundations.

## Tech Stack

- Frontend: React, Vite, React Router, Zustand, Axios, React Hot Toast
- AR: TensorFlow.js, MoveNet pose detection, Three.js, React Three Fiber, Drei
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Payments: Stripe Payment Intents and webhooks
- Media: Cloudinary
- AI: OpenAI SDK

## Project Structure

```text
phantom-store/
  frontend/   React + Vite frontend
  backend/    Express + MongoDB backend
  package.json
```

## Setup

1. Install dependencies.

```bash
npm run install:all
```

2. Create environment files.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start MongoDB locally or provide a hosted MongoDB connection string in `backend/.env`.

4. Run both apps.

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend API runs at `http://localhost:5000`.

## Environment Variables

| File | Variable | Description |
| --- | --- | --- |
| `backend/.env` | `PORT` | API server port. |
| `backend/.env` | `CLIENT_URL` | Allowed frontend origin for CORS. |
| `backend/.env` | `MONGO_URI` | MongoDB connection string. |
| `backend/.env` | `JWT_SECRET` | Secret used to sign JWT access tokens. |
| `backend/.env` | `JWT_EXPIRES_IN` | JWT lifetime, such as `7d`. |
| `backend/.env` | `STRIPE_SECRET_KEY` | Stripe secret key for Payment Intents. |
| `backend/.env` | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret. |
| `backend/.env` | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name. |
| `backend/.env` | `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `backend/.env` | `CLOUDINARY_API_SECRET` | Cloudinary API secret. |
| `backend/.env` | `OPENAI_API_KEY` | OpenAI API key for AI endpoints. |
| `backend/.env` | `OPENAI_MODEL` | OpenAI model used by AI services. |
| `frontend/.env` | `VITE_API_URL` | Browser API base URL. |
| `frontend/.env` | `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client checkout flows. |

## API Overview

- `POST /api/auth/register` creates an account.
- `POST /api/auth/login` returns a JWT.
- `GET /api/auth/me` returns the authenticated user.
- `GET /api/products` lists products with filters.
- `GET /api/products/:id` returns one product.
- `POST /api/products` creates a product for merchants or admins.
- `PUT /api/products/:id` updates a product.
- `DELETE /api/products/:id` deletes a product.
- `POST /api/orders` creates an order.
- `GET /api/orders/my` returns the current user's orders.
- `PATCH /api/orders/:id/status` updates order status for admins.
- `POST /api/payment/create-payment-intent` creates a Stripe Payment Intent.
- `POST /api/payment/webhook` handles Stripe webhook events.
- `POST /api/ai/style-suggest` generates style suggestions.
- `POST /api/ai/semantic-search` searches products with AI tags.
- `POST /api/ai/outfit-review` reviews an outfit.
