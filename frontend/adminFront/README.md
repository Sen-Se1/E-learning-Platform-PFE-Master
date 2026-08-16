# DevOps Cloud Academy - Next.js 14 Platform

This is a premium e-learning platform dedicated to DevOps and Cloud Computing, built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment:**
   Copy `.env.example` to `.env.local` and fill in your details.

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

- **App Router:** Organized by role groups `(admin)`, `(instructor)`, `(student)`.
- **UI Components:** Powered by `shadcn/ui` with custom design tokens.
- **Theme:** Full dark mode support using `next-themes`.
- **State Management:** `Zustand` for global state and persistence.
- **Validation:** `Zod` + `React Hook Form`.

## 👥 Roles & Dashboards

- **Super Admin:** Infrastructure monitoring, user management, and system health.
- **Instructor:** Course creation, student analytics, and revenue tracking.
- **Student:** Interactive video player, progress tracking, and certifications.

## 🎨 Design System

- **Primary:** `#137fec`
- **Background Light:** `#f6f7f8`
- **Background Dark:** `#101922`
- **Typography:** Lexend (Google Fonts)
- **Icons:** Material Symbols Outlined

## 📂 Directory Structure

```
src/
├── app/               # Routes & Layouts
├── components/        # UI & Layout Components
├── lib/               # Utilities & Stores
├── types/             # TS Interfaces
└── data/              # Mock Data
```

## 🔐 Security

- Next.js Middleware for route protection.
- Secure SSL Encryption ready.
- Input validation with Zod.

---
Built with ❤️ by the DevOps Master's Team.
