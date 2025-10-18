"use client";

import "./globals.css";
import { useEffect } from "react";

type Theme = "light" | "dark";

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const preferred = getPreferredTheme();
    document.documentElement.dataset.theme = preferred;
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
