import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthModal from "@/components/auth/AuthModal";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BudgetU – The Smart Student Budgeting App",
  description:
    "Student-first budgeting app. Track expenses, set budgets, and build financial literacy. Budget smarter in college.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("budgetu-theme");if(t!=="light")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden bg-budgetu-bg text-budgetu-heading`}>
        <ThemeProvider>
          {children}
          <AuthModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
