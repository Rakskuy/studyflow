import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-surface-900 bg-grid relative overflow-hidden">
      {/* Background gradient decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            S
          </div>
          <span className="text-xl font-bold gradient-text">StudyFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm">
            Masuk
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Daftar Gratis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-6 pt-20 pb-32">
        <div className="badge bg-brand-500/10 text-brand-300 border border-brand-500/20 mb-8">
          ✨ Dibuat untuk Mahasiswa Informatika
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          <span className="text-white">Kelola Tugas,</span>
          <br />
          <span className="gradient-text">Raih IPK Tinggi</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          StudyFlow membantu kamu mengelola tugas kuliah, mengatur deadline, dan
          belajar lebih cepat dengan bantuan AI. Semua dalam satu platform yang
          cantik dan intuitif.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="btn-primary text-base px-8 py-4 rounded-2xl animate-pulse-glow"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Mulai Sekarang — Gratis
          </Link>
          <Link
            href="/login"
            className="btn-secondary text-base px-8 py-4 rounded-2xl"
          >
            Sudah Punya Akun? Masuk
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full">
          <div className="glass-card glass-card-hover p-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-accent-emerald"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Manajemen Tugas
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              CRUD tugas lengkap dengan prioritas, status, dan deadline. Filter
              dan cari tugas dengan mudah.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-accent-amber/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-accent-amber"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Peringatan Deadline
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dashboard menampilkan tugas mendekat dan terlambat. Tidak ada
              deadline yang terlewat lagi.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-accent-sky/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-accent-sky"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              AI Assistant
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Bantuan AI dari Google Gemini untuk membantu memahami materi dan
              mengerjakan tugas lebih cepat.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/5">
        <p className="text-slate-500 text-sm">
          © 2024 StudyFlow. Dibuat dengan ❤️ untuk mahasiswa informatika.
        </p>
      </footer>
    </div>
  );
}
