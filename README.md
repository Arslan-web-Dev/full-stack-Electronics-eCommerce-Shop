# 🛒 Arslan Electronics - Full-Stack eCommerce Solution

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://full-stack-electronics-e-commerce-s.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)

**Arslan Electronics** is a premium, high-performance electronics e-commerce platform designed for the Pakistani market. Built with a modern tech stack, it offers a seamless shopping experience, robust admin controls, and cloud-native architecture.

---

## 🚀 Live URL
Check out the production build here:  
**[https://full-stack-electronics-e-commerce-s.vercel.app/](https://full-stack-electronics-e-commerce-s.vercel.app/)**

---

## 🏗️ Modern Serverless Architecture

```mermaid
flowchart LR
  User["Customer Browser"] --> Next["Next.js App Router (Frontend)"]
  Admin["Admin Browser"] --> Next

  Next --> Supabase["Supabase Auth"]
  Next --> APIRoutes["Next.js Serverless API Routes"]
  
  APIRoutes --> Prisma["Prisma ORM"]
  Prisma --> Atlas["MongoDB Atlas (Cloud)"]

  Next --> Zustand["Zustand State Management"]
```

---

## 📋 Core Functionalities

### 🛍️ Customer Experience
- **Smart Catalog**: Real-time product browsing with category-wise segregation.
- **Dynamic Filtering**: Instantly filter by Price, Rating, and Stock availability.
- **Search Engine**: Robust search functionality with mode-insensitive matching.
- **User Dashboard**: Personalized wishlist, order history, and notification center.
- **Checkout Engine**: Secure multi-step checkout process with email validation.

### 🛡️ Admin Powerhouse
- **Real-time Monitoring**: Track sales and order statuses from a protected dashboard.
- **Inventory Management**: Full CRUD for Products, Categories, and Merchants.
- **Bulk Import Service**: Batch process thousands of products via CSV automation.
- **User Control**: Manage user roles and permissions directly from the portal.

---

## 🔄 Application Flows

### Shopping Journey
```mermaid
flowchart TD
  Visit["Visitor opens site"] --> Browse["Browse Shop & Categories"]
  Browse --> Search["Search for Products"]
  Search --> Product["Product Detail Page"]
  Product --> Cart["Add to Cart / Buy Now"]
  Cart --> AuthCheck{"Signed in?"}
  AuthCheck -- No --> Login["Supabase Auth"]
  Login --> Checkout["Secure Checkout"]
  AuthCheck -- Yes --> Checkout
  Checkout --> CreateOrder["Create Cloud Order"]
  CreateOrder --> Notify["Notification Sent"]
```

### Admin Management
```mermaid
flowchart TD
  AdminLogin["Admin Authenticates"] --> RoleCheck{"Is Role Admin?"}
  RoleCheck -- No --> Redirect["Redirect to Home"]
  RoleCheck -- Yes --> Dashboard["Admin Panel"]
  
  Dashboard --> Manage["Manage Inventory"]
  Manage --> Products["Products CRUD"]
  Manage --> Categories["Categories CRUD"]
  Manage --> Bulk["CSV Bulk Upload"]
  
  Products --> CloudDB["MongoDB Atlas"]
  Bulk --> BatchProcess["Serverless Batch Job"]
```

---

## 📊 Data Model (Cloud Schema)

```mermaid
erDiagram
  User ||--o{ Wishlist : manages
  User ||--o{ Notification : receives
  Category ||--o{ Product : classifies
  Merchant ||--o{ Product : supplies
  Product ||--o{ OrderItem : included_in
  Order ||--o{ OrderItem : contains

  Product {
    string id
    string slug
    string title
    float price
    int inStock
  }
  Order {
    string id
    string status
    float total
    datetime dateTime
  }
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, DaisyUI (Premium Themes)
- **Database**: MongoDB Atlas (Cloud)
- **ORM**: Prisma
- **Auth**: Supabase (JWT & Session based)
- **State Management**: Zustand

---

## 👨‍💻 Developed By

**Muhammad Arslan**  
*Lead Full-Stack Developer*

Specializing in building high-performance, scalable web applications for businesses.  
**Contact:** [WhatsApp Support](https://wa.me/923275541708) | [Creator Profile](https://full-stack-electronics-e-commerce-s.vercel.app/creator)

---

## 📜 License

This project is licensed under the MIT License.
