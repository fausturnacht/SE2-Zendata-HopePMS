# SE2-Zendata-HopePMS 🚀

A robust **Product Management System (PMS)** implementation based on the Hope Inc. sample database. Developed by the **Zendata** group (3BSCS-1) for SE2.

---

## 🛠️ Tech Stack Considerations

This project leverages a modern, high-performance tech stack designed for scalability, maintainability, and developer efficiency.

### **Core Frontend**
*   **[React 19](https://react.dev/)**: Used as the primary library for building the user interface.
    *   *Purpose:* To build a component-based, reactive UI that handles complex state management efficiently.
    *   *Why:* React 19 offers the latest advancements in performance, better hook management, and seamless integration with modern web standards.
*   **[TypeScript](https://www.typescriptlang.org/)**: A strongly typed superset of JavaScript.
    *   *Purpose:* To provide static type checking across the codebase.
    *   *Why:* Reduces runtime errors, improves code readability, and provides superior IDE support (intellisense), which is critical for a team-based PMS project.
*   **[Vite 8](https://vitejs.dev/)**: The next-generation frontend tool.
    *   *Purpose:* Serves as the development server and build tool.
    *   *Why:* Offers near-instant hot module replacement (HMR) and extremely fast build times compared to traditional tools like Webpack.

### **Styling & UI**
*   **[TailwindCSS 4](https://tailwindcss.com/)**: A utility-first CSS framework.
    *   *Purpose:* For rapid UI development and maintaining a consistent design system.
    *   *Why:* Version 4 provides enhanced performance, a smaller footprint, and a more intuitive syntax, allowing for highly customized designs without writing complex CSS.

### **Backend & Database**
*   **[Supabase](https://supabase.com/)**: An open-source Firebase alternative.
    *   *Purpose:* Handles the database (PostgreSQL), Authentication, and Real-time data syncing.
    *   *Why:* It provides a powerful PostgreSQL backend with an easy-to-use API, built-in Auth, and real-time capabilities, making it perfect for managing product data and user roles.

### **Navigation**
*   **[React Router 7](https://reactrouter.com/)**: The standard routing library for React.
    *   *Purpose:* Manages client-side routing and navigation between different views (e.g., Dashboard, Product List, Inventory).
    *   *Why:* It allows for a single-page application (SPA) experience with deep linking and nested routes.

---

## ✨ Features

- 📦 **Inventory Management**: Track product levels, categories, and suppliers.
- 🔐 **Secure Authentication**: Managed via Supabase Auth with role-based access.
- 🎨 **Responsive Design**: Fully optimized for desktop and mobile viewports.
- ⚡ **Real-time Updates**: Instant data synchronization across clients.
- 📊 **Dashboard Analytics**: Visual insights into product performance and stock status.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fausturnacht/SE2-Zendata-HopePMS.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
src/
├── components/   # Reusable UI components
├── pages/        # Main application views/pages
├── hooks/        # Custom React hooks
├── lib/          # External library configurations (e.g., supabase.ts)
├── styles/       # Global styles and Tailwind configuration
└── types/        # TypeScript interfaces and types
```

---

## 👥 Meet the Team: Zendata (3BSCS-1)
*Member list can be added here*

---

## 📄 License
This project is for educational purposes as part of the SE2 curriculum.
