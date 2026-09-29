import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET single task
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

    const task = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
      include: {
        course: { select: { id: true, name: true, color: true } },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Gagal memuat tugas" },
      { status: 500 }
    );
  }
}

// PUT update task
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
    const body = await req.json();

    // Check ownership
    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    // If courseId is being changed, verify ownership of new course
    if (body.courseId && body.courseId !== existing.courseId) {
      const course = await prisma.course.findFirst({
        where: { id: body.courseId, userId: session.user.id },
      });
      if (!course) {
        return NextResponse.json(
          { error: "Mata kuliah tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.courseId !== undefined) updateData.courseId = body.courseId;
    if (body.deadline !== undefined) updateData.deadline = new Date(body.deadline);
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.status !== undefined) updateData.status = body.status;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Gagal mengubah tugas" },
      { status: 500 }
    );
  }
}

// DELETE task
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

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: "Tugas berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Gagal menghapus tugas" },
      { status: 500 }
    );
  }
}
