"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-surface-900">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Top & Bottom Navigation */}
        <MobileNav />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
