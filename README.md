# Phantom Store

Phantom Store is a production-ready MERN boilerplate for a browser-native AR try-on e-commerce platform. It includes a React + Vite storefront, a Node.js + Express API, MongoDB models, JWT authentication, Razorpay payments, Cloudinary uploads, OpenAI-powered product intelligence, and TensorFlow/Three.js AR foundations.

## Tech Stack

- Frontend: React, Vite, React Router, Zustand, Axios, React Hot Toast
- AR: TensorFlow.js, MoveNet pose detection, Three.js, React Three Fiber, Drei
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Payments: Razorpay Orders and server-side signature verification
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
| `backend/.env` | `RAZORPAY_KEY_ID` | Razorpay key ID for creating orders (test or live). |
| `backend/.env` | `RAZORPAY_KEY_SECRET` | Razorpay key secret for signature verification. |
| `backend/.env` | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name. |
| `backend/.env` | `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `backend/.env` | `CLOUDINARY_API_SECRET` | Cloudinary API secret. |
| `backend/.env` | `OPENAI_API_KEY` | Optional OpenAI API key for AI endpoints. Leave empty to avoid OpenAI billing. |
| `backend/.env` | `OPENAI_MODEL` | Optional OpenAI model used by AI services. |
| `backend/.env` | `OPENROUTER_API_KEY` | Optional OpenRouter API key. Takes priority over OpenAI when set. |
| `backend/.env` | `OPENROUTER_MODEL` | OpenRouter model, such as `openrouter/free` for free-model routing. |
| `backend/.env` | `APP_URL` | Optional public app URL sent to OpenRouter request headers. |
| `backend/.env` | `APP_NAME` | Optional app name sent to OpenRouter request headers. |
| `frontend/.env` | `VITE_API_URL` | Browser API base URL. |
| `frontend/.env` | `VITE_RAZORPAY_KEY_ID` | Razorpay key ID used by the frontend checkout modal. |

## API Overview

- `POST /api/auth/register` creates an account.
- `POST /api/auth/login` returns a JWT.
- `GET /api/auth/me` returns the authenticated user.
- `GET /api/products` lists products with filters.
- `GET /api/products/:id` returns one product.
- `GET /api/products/search` searches products by text fields and AI tags.
- `POST /api/products` creates a product for merchants or admins. Supports multipart `images` and `model` uploads to Cloudinary.
- `PUT /api/products/:id` updates a product and can replace/add uploaded assets.
- `DELETE /api/products/:id` deletes a product.
- `GET /api/stores` lists stores with optional filters.
- `GET /api/stores/:id` returns one store with products.
- `GET /api/stores/my` returns the current merchant's stores.
- `POST /api/stores` creates a store for merchants or admins.
- `PUT /api/stores/:id` updates a store owned by the current merchant or any admin.
- `DELETE /api/stores/:id` deletes a store owned by the current merchant or any admin.
- `GET /api/orders/my` returns the current user's orders.
- `PATCH /api/orders/:id/status` updates order status for admins.
- `POST /api/payment/create-order` creates a Razorpay order for the checkout modal.
- `POST /api/payment/verify-payment` verifies payment signature and creates the order in the database.
- `POST /api/ai/style-suggest` generates style suggestions.
- `POST /api/ai/semantic-search` searches products with AI tags.
- `POST /api/ai/outfit-review` reviews an outfit.
