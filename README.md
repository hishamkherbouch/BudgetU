# BudgetU - Smart Student Budgeting App

BudgetU is a modern, high-aesthetic fintech application designed specifically for students to manage their finances effectively. Inspired by industry leaders, it features a sleek Bento-box style dashboard, intuitive expense tracking, and interactive financial education modules.

![BudgetU Dashboard](https://budget-u-ten.vercel.app/dashboard)

## 🚀 Features

- **modern Dashboard**: A responsive "Bento-Box" grid layout providing a comprehensive overview of financial health at a glance.
- **Income & Expense Tracking**: Easily log transactions with specialized categories for students (Food, Housing, Transport, Education, etc.).
- **Visual Analytics**: Interactive bar charts and trend analysis powered by Recharts to visualize spending habits.
- **Financial Education**: Engaging "Quests" and educational content to improve financial literacy directly within the app.
- **Smart Logic**: Real-time calculation of savings rates and available spending limits.
- **Premium UI/UX**: Features glassmorphism effects, smooth animations, and a polished dark mode interface.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://formidad.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend & Database**: [Supabase](https://supabase.com/)
- **AI Integration**: Google Generative AI

## 🏁 Getting Started

Follow these steps to get the project running locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/budgetu.git
    cd budgetu
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your Supabase and other necessary credentials. You can use `.env.local.example` as a reference.

    ```bash
    cp .env.local.example .env.local
    ```

    Update `.env.local` with your keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    # Add other keys as needed
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components (buttons, cards, charts).
- `src/lib`: Utility functions and Supabase client configuration.
- `public`: Static assets.
- `supabase`: Supabase configuration and migrations.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.