# 🍽️ CanteenX — Intelligent Smart Campus Canteen & AI Ordering Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **CanteenX** is a full-stack campus food ordering, smart queue optimization, and live kitchen management system designed to eliminate long lunchtime queues and food waste across colleges.

---

## 📌 Table of Contents
- [✨ Key Features](#-key-features)
  - [👨‍🎓 Student Experience](#-student-experience)
  - [👨‍🍳 Kitchen Staff & Admin System](#-kitchen-staff--admin-system)
  - [⚡ Smart Campus Engine](#-smart-campus-engine)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Database Setup (Prisma & PostgreSQL)](#database-setup-prisma--postgresql)
  - [Running the Application](#running-the-application)
- [📡 API Documentation](#-api-documentation)
- [🗄️ Database Schema](#️-database-schema)
- [💡 Demo & Presentation Mode](#-demo--presentation-mode)
- [📄 License](#-license)

---

## ✨ Key Features

### 👨‍🎓 Student Experience
* **🤖 AI Food Assistant**: Smart AI conversational recommendation engine that builds custom meal combos according to budget constraints, break duration, dietary preferences (Veg, Non-Veg, Egg, Vegan), and real-time kitchen queue loads.
* **⏱️ Real-Time Queue & Wait Time Estimator**: Live counter rush indicators (Low / Moderate / High) with smart queue delay calculations to help students order before break bell.
* **📱 Interactive Digital Menu**: Categorized menu (Breakfast, Snacks, Meals, Beverages, Desserts) with live stock counters, chef specials, preparation time estimations, and dietary filter tags.
* **💳 Multi-Payment & Campus Wallet**: Integrated campus wallet system, UPI / GPay quick pay, and counter cash settlement with instant balance tracking.
* **🎟️ Cryptographic QR Pickup Pass**: Tamper-proof, dynamic QR codes and 4-digit pickup pins for zero-friction contactless order handoffs.
* **📊 Live Order Tracking**: Real-time status pipeline (`Order Received` ➔ `Confirmed` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Completed`).

### 👨‍🍳 Kitchen Staff & Admin System
* **🖥️ Kitchen Display System (KDS)**: High-visibility order management board organized by status with color-coded preparation priority and itemized order breakdowns.
* **📷 Integrated QR Code Scanner**: Instant camera/token-based verification system preventing duplicate pickups and cross-college order mismatch errors.
* **📦 Live Inventory & Stock Controller**: Real-time stock toggle, low-stock warnings, 86-ing (marking items unavailable), and instant stock replenishment.
* **📈 Rush Analytics & Counter Load**: Live monitoring of busy food categories to distribute kitchen workload evenly.

### ⚡ Smart Campus Engine
* **🏫 Multi-College Multi-Tenant Architecture**: Supports multiple college branches with campus-specific menus, pricing, and independent order queues.
* **🔀 Split-Screen Presentation Mode**: Side-by-side live simulator demonstrating a student placing an order on one side and the kitchen staff receiving and verifying it in real time on the other.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Student Mobile / Web App] -->|REST API / JWT| B[Node.js Express Backend]
    C[Staff Kitchen Dashboard] -->|REST API / QR Verification| B
    B -->|Prisma ORM| D[(PostgreSQL Database)]
    A -->|AI Combo Engine| E[AI Recommendation Algorithm]
    B -->|Order Lifecycle Events| C
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Engine**: [qrcode.react](https://www.npmjs.com/package/qrcode.react) & HTML5 QR Scanner
- **Animations**: Canvas Confetti & Tailwind Transitions

### Backend & Database
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma ORM v5](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Security**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) (password hashing), [jsonwebtoken (JWT)](https://jwt.io/)

---

## 📂 Project Structure

```text
CanteenX/
├── index.html              # Frontend entry point
├── package.json            # Root frontend dependencies and scripts
├── vite.config.ts          # Vite build & proxy configuration
├── tailwind.config.js      # Tailwind CSS theming
├── src/                    # Frontend source code
│   ├── components/
│   │   ├── auth/           # Login / Register screens
│   │   ├── common/         # Header, Bottom Navigation, Modals
│   │   ├── demo/           # Split-screen presentation & control bar
│   │   ├── staff/          # Staff dashboard, QR Scanner, Inventory manager
│   │   └── student/        # Home, Menu, AI Chat, Order Tracker, Profile, Cart
│   ├── context/            # Global AppContext state management
│   ├── data/               # Mock data & fallback configurations
│   ├── services/           # Backend API integration services
│   ├── types/              # TypeScript interfaces and data models
│   └── utils/              # QR verification & queue calculation algorithms
└── server/                 # Backend REST API Server
    ├── package.json        # Backend dependencies and scripts
    ├── prisma/
    │   ├── schema.prisma   # PostgreSQL Prisma schema definition
    │   └── seed.ts         # Database seeder with sample college data
    └── src/
        ├── config/         # Environment & database client configuration
        ├── controllers/    # Request controllers (Auth, Menu, Order, Kitchen, etc.)
        ├── middleware/     # Auth JWT verification & role validation
        ├── routes/         # Express API route declarations
        ├── services/       # Core business logic services
        └── server.ts       # Backend entry point
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (or a cloud instance such as Supabase / Neon / Railway)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vishnud2006/CanteenX.git
   cd CanteenX
   ```

2. **Install Frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

---

### Database Setup (Prisma & PostgreSQL)

1. Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/canteenx?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_here"
   JWT_EXPIRES_IN="7d"
   ```

2. Generate Prisma Client & Run Database Migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. Seed Initial Campus & Menu Data:
   ```bash
   npm run prisma:seed
   ```

---

### Running the Application

You can run both the frontend client and backend API server simultaneously:

#### Run Frontend Client:
```bash
npm run dev
```
> The frontend will be available at: `http://localhost:5173`

#### Run Backend Server:
```bash
npm run server
```
> The API server will run on: `http://localhost:5000`

---

## 📡 API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register student or kitchen staff | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | ❌ |
| `GET` | `/api/colleges` | Fetch all available registered colleges | ❌ |
| `GET` | `/api/menu` | List menu items (filterable by category/college) | ❌ |
| `GET` | `/api/student/profile` | Retrieve student profile, balance & preferences | ✅ |
| `POST` | `/api/orders` | Place a new food order & generate pickup token | ✅ |
| `GET` | `/api/orders/:orderId` | Get live order status and details | ✅ |
| `GET` | `/api/kitchen/orders` | Fetch active kitchen orders for staff KDS | ✅ (Staff) |
| `POST` | `/api/kitchen/verify-pickup` | Verify QR Code / Token and mark collected | ✅ (Staff) |
| `PATCH`| `/api/kitchen/inventory/:id` | Update food item stock and availability | ✅ (Staff) |

---

## 🗄️ Database Schema

Key entities in the PostgreSQL database:

* **College**: Supports multi-tenant campus isolation (`collegeId`, `collegeName`, `location`, `logo`).
* **User**: Unified user table with role-based attributes (`STUDENT`, `KITCHEN_STAFF`, `SUPER_ADMIN`), wallet balance, dietary preferences, and student/staff IDs.
* **FoodItem**: Item metadata including prep time, category, stock quantities, dietary type (`veg`, `non-veg`, `egg`, `vegan`), ratings, and popularity score.
* **Order & OrderItem**: Complete transactional state machine with immutable price/name snapshots, estimated pickup times, cryptographic pickup tokens, and 4-digit verification pins.

---

## 💡 Demo & Presentation Mode

CanteenX includes a built-in **Demo Control Bar** located at the top of the interface:
- **Switch Roles**: Effortlessly toggle between **Student View**, **Kitchen Staff View**, and **Split Screen View**.
- **Simulate Orders**: Place orders as a student and observe them instantly appear in the Kitchen Staff Kanban board.
- **Test QR Code Scanner**: Open the QR scanner on the Staff view to verify and complete orders in real time.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).