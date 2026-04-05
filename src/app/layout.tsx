import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import { SidebarProvider } from "@/components/SidebarContext";
import { ThemeProvider } from "@/components/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Next.js E-commerce Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className}`} style={{ transition: "background-color 0.3s ease, color 0.3s ease" }}>
        <ThemeProvider>
          <SidebarProvider>
            {/* Render decoupled views conditionally using wrapper */}
            <AppLayoutWrapper>
               {children}
            </AppLayoutWrapper>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
