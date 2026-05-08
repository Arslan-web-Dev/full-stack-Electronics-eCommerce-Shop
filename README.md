# Electronics eCommerce Shop

A full-stack electronics store built with Next.js, React, Tailwind CSS, Express, Prisma, MongoDB, and Supabase Auth. The project includes a public storefront for customers and an admin dashboard for managing products, categories, merchants, orders, users, notifications, and CSV product bulk uploads.

Maintained and customized by **Arslan-web-Dev**.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Functional Areas](#functional-areas)
- [Architecture](#architecture)
- [Application Flow](#application-flow)
- [Data Model](#data-model)
- [Bulk Upload Flow](#bulk-upload-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Useful Scripts](#useful-scripts)
- [Documentation](#documentation)
- [Ownership and License](#ownership-and-license)

## Overview

This repository is an end-to-end e-commerce application for selling electronics online. It combines:

- A customer-facing shop with product browsing, search, cart, checkout, wishlist, and notifications.
- A protected admin dashboard with CRUD screens for products, categories, merchants, users, and orders.
- A Node.js API server that handles product data, order operations, wishlist data, notifications, image records, merchant data, and bulk CSV imports.
- Prisma models for MongoDB collections and typed data access.
- Supabase authentication for login, registration, session handling, and route protection.

## Core Features

### Customer Features

- Product catalog with electronic products, pricing, manufacturer details, ratings, stock status, categories, and product images.
- Shop page with filtering, sorting, pagination, and category navigation.
- Search page for finding products by query.
- Product detail pages with image galleries, stock information, dynamic product fields, quantity selection, cart actions, and buy-now behavior.
- Cart management using client-side Zustand state.
- Checkout flow that creates customer orders and order-product records.
- Wishlist support for authenticated users.
- Notification center with read/unread state, notification type, priority, and metadata.
- Authentication pages for register and login.
- Session timeout helpers for safer authenticated browsing.

### Admin Features

- Admin-only dashboard area protected by Supabase user metadata role checks.
- Product management: list, create, edit, delete, update main image, and associate products with categories and merchants.
- Category management: list, create, edit, and delete categories.
- Merchant management: list, create, edit, delete, and attach merchants to products.
- Order management: view orders, inspect order line items, update order status, and delete order data.
- User management: list, create, edit roles, and delete users.
- CSV bulk upload: import products from CSV, validate rows, create products in batches, review upload history, update batch items, and optionally delete batch-created products.

### Platform Features

- Express API with CORS validation.
- Request IDs, request logging, error logging, and security logging.
- Rate limiting for general traffic, authentication-like requests, uploads, search, order operations, and user management.
- Centralized API client configuration in the frontend.
- Shared validation and sanitization helpers.
- Prisma database access for MongoDB.

## Functional Areas

| Area | Main Responsibility | Key Files |
| --- | --- | --- |
| Storefront | Home, shop, product detail, cart, checkout, search | `app/page.tsx`, `app/shop/[[...slug]]/page.tsx`, `app/product/[productSlug]/page.tsx`, `app/cart/page.tsx`, `app/checkout/page.tsx`, `app/search/page.tsx` |
| Authentication | Supabase login/register/session handling | `app/login/page.tsx`, `app/register/page.tsx`, `utils/supabase/*`, `middleware.ts` |
| Admin Dashboard | Protected product, category, merchant, user, order, and bulk upload screens | `app/(dashboard)/admin/*` |
| API Server | REST endpoints, middleware, rate limits, logging | `server/app.js`, `server/routes/*`, `server/controllers/*` |
| Database | MongoDB models through Prisma | `prisma/schema.prisma`, `server/prisma/schema.prisma` |
| State | Cart, wishlist, sorting, pagination, notifications | `app/_zustand/*` |
| Bulk Upload | CSV parsing, validation, batch creation, batch deletion | `server/controllers/bulkUpload.js`, `server/services/bulkUploadService.js` |

## Architecture

```mermaid
flowchart LR
  User["Customer Browser"] --> Next["Next.js App Router Frontend"]
  Admin["Admin Browser"] --> Next

  Next --> Supabase["Supabase Auth"]
  Next --> ApiClient["Frontend API Client"]
  ApiClient --> Express["Express API Server"]

  Express --> Middleware["Logging, CORS, Rate Limits, Auth Middleware"]
  Middleware --> Controllers["Route Controllers"]
  Controllers --> Prisma["Prisma Client"]
  Prisma --> Mongo["MongoDB Database"]

  Next --> Zustand["Zustand Client Stores"]
  Express --> Logs["Server Logs"]
```

The frontend runs as a Next.js application. It uses Supabase for user sessions, Zustand for client-side UI state, and the Express backend for core commerce data. The backend validates requests, applies rate limits, writes logs, and stores data through Prisma in MongoDB.

## Application Flow

```mermaid
flowchart TD
  Visit["Visitor opens site"] --> Browse["Browse home, shop, categories, search"]
  Browse --> Product["Open product detail"]
  Product --> Cart["Add to cart or buy now"]
  Cart --> Checkout["Checkout form"]
  Checkout --> AuthCheck{"Signed in?"}
  AuthCheck -- No --> Login["Login or register"]
  Login --> Checkout
  AuthCheck -- Yes --> CreateOrder["Create customer order"]
  CreateOrder --> OrderItems["Create order product rows"]
  OrderItems --> Notify["Notifications and admin order view"]
```

## Admin Flow

```mermaid
flowchart TD
  Login["Admin logs in"] --> RoleCheck{"Supabase role is admin?"}
  RoleCheck -- No --> Home["Redirect to storefront"]
  RoleCheck -- Yes --> Dashboard["Admin dashboard"]

  Dashboard --> Products["Manage products"]
  Dashboard --> Categories["Manage categories"]
  Dashboard --> Merchants["Manage merchants"]
  Dashboard --> Orders["Manage orders"]
  Dashboard --> Users["Manage users"]
  Dashboard --> Upload["Bulk upload CSV"]

  Products --> Api["Express API"]
  Categories --> Api
  Merchants --> Api
  Orders --> Api
  Users --> Api
  Upload --> Api
  Api --> Database["MongoDB via Prisma"]
```

## Data Model

```mermaid
erDiagram
  User ||--o{ Wishlist : has
  User ||--o{ Notification : receives
  User ||--o{ bulk_upload_batch : uploads

  Category ||--o{ Product : contains
  Merchant ||--o{ Product : sells
  Product ||--o{ Wishlist : saved_in
  Product ||--o{ customer_order_product : ordered_as
  Product ||--o{ bulk_upload_item : created_from

  Customer_order ||--o{ customer_order_product : includes
  bulk_upload_batch ||--o{ bulk_upload_item : contains

  User {
    string id
    string email
    string role
    string supabaseId
  }

  Product {
    string id
    string slug
    string title
    int price
    int rating
    string manufacturer
    int inStock
  }

  Category {
    string id
    string name
  }

  Merchant {
    string id
    string name
    string status
  }

  Customer_order {
    string id
    string email
    string status
    int total
  }

  Notification {
    string id
    string title
    string type
    boolean isRead
    string priority
  }
```

## Bulk Upload Flow

```mermaid
sequenceDiagram
  actor Admin
  participant UI as Admin Bulk Upload Page
  participant API as Express Bulk Upload API
  participant Service as Bulk Upload Service
  participant DB as MongoDB

  Admin->>UI: Select CSV file
  UI->>API: POST /api/bulk-upload
  API->>Service: Parse and validate rows
  Service->>DB: Create upload batch
  Service->>DB: Create products and batch items
  DB-->>Service: Batch results
  Service-->>API: Success and error summary
  API-->>UI: Batch status, counts, validation errors
  UI-->>Admin: Show upload result and history
```

Bulk upload records are stored as batches and batch items. This makes imports auditable: admins can see which products were created, which rows failed validation, and whether a batch is completed, partial, or failed.

## Tech Stack

- Next.js 15 App Router
- React 18
- TypeScript
- Tailwind CSS and DaisyUI
- Zustand
- Express
- Prisma
- MongoDB
- Supabase Auth
- Zod
- Winston and Morgan logging
- Express rate limiting
- CSV parsing with `csv-parse`

## Project Structure

```text
.
|-- app/                    Next.js routes, pages, dashboard, API route handlers
|-- components/             Shared UI components
|-- helpers/                Browser and screen helpers
|-- hooks/                  Custom React hooks
|-- lib/                    API client, config, sanitization, notification helpers
|-- prisma/                 Frontend Prisma schema/client generation
|-- public/                 Static assets
|-- server/                 Express API server
|   |-- controllers/        Request handlers
|   |-- middleware/         Logging, auth, rate limiting
|   |-- routes/             Express route definitions
|   |-- services/           Business logic, including bulk upload
|   |-- prisma/             Server Prisma schema
|   |-- scripts/            Database and migration helpers
|   `-- tests/              API and bulk upload smoke/debug scripts
|-- types/                  Shared TypeScript types
|-- utils/                  Database, auth, validation, Supabase helpers
`-- app/_zustand/           Client-side stores
```

## Environment Variables

Create a root `.env` file. You can start from `.env.example`.

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/ecommerce_db?retryWrites=true&w=majority"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# API
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# Optional frontend URL values used by CORS/session configuration
NEXTAUTH_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"

# Optional Express server port
PORT=3001
```

The Express server loads variables from `server/.env` first and then falls back to the root `.env`. You can either keep one root `.env`, or add a `server/.env` with the backend-specific values.

## Getting Started

### 1. Install Dependencies

Install frontend dependencies from the repository root:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

### 2. Configure Environment

Create the root `.env` file and add MongoDB, Supabase, and API settings shown above.

### 3. Generate Prisma Clients

From the repository root:

```bash
npm run db:generate
```

From the `server` folder:

```bash
npx prisma generate
```

### 4. Sync Database Schema

For MongoDB development, push the Prisma schema:

```bash
npm run db:push
```

If you prefer running this from the backend folder:

```bash
cd server
npx prisma db push
```

### 5. Seed Demo Data

From the repository root:

```bash
node utils/insertDemoData.js
```

Or from the backend folder:

```bash
cd server/utills
node insertDemoData.js
```

### 6. Start the Backend

```bash
cd server
npm start
```

The API runs on `http://localhost:3001` by default.

### 7. Start the Frontend

Open a second terminal at the repository root:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

Root project:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Generate Prisma client and start the Next.js dev server |
| `npm run build` | Generate Prisma client and build the Next.js app |
| `npm run start` | Start the production Next.js server |
| `npm run lint` | Run Next.js linting |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push the Prisma schema to MongoDB |
| `npm run db:studio` | Open Prisma Studio |

Backend project:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Express API server |
| `npm run logs` | View combined backend logs |
| `npm run logs:access` | View access logs |
| `npm run logs:error` | View error logs |
| `npm run logs:security` | View security logs |
| `npm run logs:analyze` | Analyze logs |
| `npm run migrate:validate` | Validate migration safety |
| `npm run db:backup` | Create a database backup |

## Documentation

Additional guides in this repository:

- `BULK-UPLOAD-GUIDE.md`
- `BULK-UPLOAD-EXPLANATION.md`
- `BULK-UPLOAD-QUICK-REFERENCE.md`
- `DELETE-BULK-UPLOAD-GUIDE.md`
- `TROUBLESHOOTING-DELETE-BATCH.md`

## Ownership and License

This repository is maintained as Arslan-web-Dev's customized version of the electronics e-commerce shop. The codebase has been updated with project-specific documentation, MongoDB/Supabase setup notes, and current architecture diagrams.

The project uses the MIT license. If this code was originally received from another MIT-licensed source, keep the original copyright notice in `LICENSE` when publishing, distributing, or sublicensing the project. Add your own copyright notice only for your own changes.

## Notes for Admin Access

Admin access depends on the authenticated Supabase user's metadata:

```json
{
  "role": "admin"
}
```

Users without this role are redirected away from the dashboard.

## License

This project is released under the license included in `LICENSE`.
