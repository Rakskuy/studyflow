import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET single course
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const course = await prisma.course.findFirst({
      where: { id, userId: session.user.id },
      include: { _count: { select: { tasks: true } } },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Mata kuliah tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Gagal memuat mata kuliah" },
      { status: 500 }
    );
  }
}

// PUT update course
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, lecturer, color } = await req.json();

    // Check ownership
    const existing = await prisma.course.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Mata kuliah tidak ditemukan" },
        { status: 404 }
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: { name, lecturer, color },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Gagal mengubah mata kuliah" },
      { status: 500 }
    );
  }
}

// DELETE course
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.course.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Mata kuliah tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ message: "Mata kuliah berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Gagal menghapus mata kuliah" },
      { status: 500 }
    );
  }
}
