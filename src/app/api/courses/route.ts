import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all courses for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Gagal memuat mata kuliah" },
      { status: 500 }
    );
  }
}

// POST create a new course
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, lecturer, color } = await req.json();

    if (!name || !lecturer) {
      return NextResponse.json(
        { error: "Nama dan dosen harus diisi" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        name,
        lecturer,
        color: color || "#6366f1",
        userId: session.user.id,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Gagal membuat mata kuliah" },
      { status: 500 }
    );
  }
}
