# Hope INC. Product Management System (HopePMS)
### By Zendata

[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

**HopePMS** is a robust, modern **Product Management System** designed for scalability and ease of use. Developed by the **Zendata** group (3BSCS-1) as part of the Software Engineering 2 curriculum, this application provides a comprehensive suite of tools for inventory tracking, user management, and detailed reporting.

---

## ✨ Key Features

- 📦 **Advanced Inventory Management**: Full CRUD operations for products, including category tracking and supplier details.
- 🔐 **Role-Based Access Control (RBAC)**: Secure multi-level access (Admin, Superadmin, User) powered by Supabase Auth.
- 📜 **Audit Trails**: Detailed "Stamp History" for tracking every mutation (Add, Edit, Delete, Recover) with actor and timestamp details.
- 📊 **Dynamic Reporting**: 
  - **Full Product Listing**: Exportable PDF reports of all active inventory.
  - **Top Selling Products**: Analytical views of sales performance.
- ♻️ **Soft Delete & Recovery**: Safety-first approach with a dedicated Deleted Items interface for data restoration.
- 🛠️ **Developer Tools**: Built-in API Debugger for real-time testing of database functions.
- 📱 **Responsive & Modern UI**: High-performance interface built with Tailwind CSS 4 and Framer Motion.

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19**: Modern component-based UI with the latest concurrency features.
- **Vite 8**: Ultra-fast build tool and development server.
- **Tailwind CSS 4**: Utility-first styling with a focus on performance and customization.
- **Framer Motion**: Smooth, premium micro-animations and transitions.
- **React Router 7**: Robust client-side navigation and deep linking.
- **Recharts**: Interactive data visualization for dashboard analytics.

### **Backend & Infrastructure**
- **Supabase**: Real-time PostgreSQL database, Authentication, and Row-Level Security (RLS).
- **TypeScript**: Static typing for end-to-end type safety and better developer experience.
- **Vercel**: Optimized deployment and routing configuration.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/fausturnacht/SE2-Zendata-HopePMS.git
    cd SE2-Zendata-HopePMS
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Launch Development Server:**
    ```bash
    npm run dev
    ```

---

## 📂 Project Structure

```text
src/
├── api/          # Supabase service layers and data fetching
├── components/   # Reusable UI components (products, admin, shared)
├── contexts/     # React Contexts for global state (Auth, etc.)
├── hooks/        # Custom React hooks for business logic
├── layouts/      # Main application layouts and navigation wrappers
├── lib/          # External library initializations (Supabase client)
├── pages/        # Route-level components and views
├── types/        # Global TypeScript interfaces and definitions
└── utils/        # Helper functions and formatting utilities
```

---

## 🧪 Testing

We use **Vitest** for unit and integration testing.

```bash
# Run all tests
npm run test

# Run tests with UI reporter
npm run test:ui
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our branching strategy and coding standards.

---

## 👥 The Zendata Team (3BSCS-1)

- M1: **Faustino, Felix Luis** - Project Lead
- M2: **Nerecina, John Lian** - Frontend Developer
- M3: **Tolentino, Angel Lyn** - Database Engineer
- M4: **Ola, Carl Geneson** - Rights & Authentication Specialist
- M5: **Ortiz, Julius Albert**- QA/Documentation Specialist

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

