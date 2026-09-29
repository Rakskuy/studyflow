"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const mobileNavItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/tasks",
    label: "Tugas",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: "/courses",
    label: "Kuliah",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/ai",
    label: "AI Chat",
    isAi: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-surface-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            S
          </div>
          <span className="text-lg font-bold gradient-text">StudyFlow</span>
        </Link>

        {/* User Profile Button */}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-2 p-1 pl-2 rounded-full bg-white/5 border border-white/10 hover:border-brand-500/30 transition-all active:scale-95"
          aria-label="Menu profil"
        >
          <span className="text-xs font-medium text-slate-300 max-w-[80px] truncate">
            {session?.user?.name || "Akun"}
          </span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </button>
      </header>

      {/* User Profile Dropdown / Modal Sheet on Mobile */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex flex-col justify-end p-4 animate-fade-in"
          onClick={() => setShowProfileMenu(false)}
        >
          <div
            className="glass-card p-6 w-full max-w-sm mx-auto space-y-4 animate-slide-up border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{session?.user?.name || "Mahasiswa"}</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[180px]">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-1 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-sm"
              >
                <span className="text-brand-400">📊</span> Dashboard Ringkasan
              </Link>
              <Link
                href="/tasks"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-sm"
              >
                <span className="text-accent-amber">📝</span> Daftar Semua Tugas
              </Link>
              <Link
                href="/courses"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-sm"
              >
                <span className="text-accent-sky">📚</span> Mata Kuliah Semester
              </Link>
              <Link
                href="/ai"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-sm"
              >
                <span className="text-purple-400">✨</span> Tanya Asisten AI
              </Link>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 hover:bg-red-500/25 font-medium text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar dari Akun
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Dock) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-900/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? "text-brand-300 font-semibold"
                  : "text-slate-400 hover:text-slate-200 font-normal"
              }`}
            >
              {/* Active glow / background pill */}
              {isActive && (
                <span className="absolute inset-0 bg-brand-500/15 rounded-xl -z-10 animate-fade-in border border-brand-500/25" />
              )}

              <div
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110 -translate-y-0.5 text-brand-400" : ""
                } ${item.isAi && !isActive ? "text-purple-400" : ""}`}
              >
                {item.icon}
              </div>

              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
