import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const trimmedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Nama lengkap tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Check existing user case-insensitively
    let existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser) {
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan langsung masuk." },
        { status: 409 }
      );
    }

    // Create user
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan server",
        details: error?.message || String(error),
        code: error?.code 
      },
      { status: 500 }
    );
  }
}
