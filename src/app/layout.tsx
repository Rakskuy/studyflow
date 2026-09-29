import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StudyFlow - Asisten Tugas Kuliah Informatika",
  description:
    "Kelola tugas kuliah, atur deadline, dan belajar lebih cepat dengan bantuan AI. Dibuat khusus untuk mahasiswa informatika.",
  keywords: ["tugas kuliah", "mahasiswa", "informatika", "deadline", "AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
