import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AuthModal from "@/components/auth/AuthModal";
import ThemeProvider from "@/components/ThemeProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BudgetU – Budget smarter in college",
  description:
    "Student-first budgeting web app that tracks manual expenses, shows a simple dashboard, and teaches financial basics.",
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
            __html: `(function(){try{if(localStorage.getItem("budgetu-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} antialiased overflow-x-hidden`}>
        <ThemeProvider>
          {children}
          <AuthModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
