import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all tasks for the current user (with filters)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId: session.user.id };

    if (courseId) where.courseId = courseId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        course: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [{ deadline: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Gagal memuat tugas" },
      { status: 500 }
    );
  }
}

// POST create a new task
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, courseId, deadline, priority, status } =
      await req.json();

    if (!title || !courseId || !deadline) {
      return NextResponse.json(
        { error: "Judul, mata kuliah, dan deadline harus diisi" },
        { status: 400 }
      );
    }

    // Verify course ownership
    const course = await prisma.course.findFirst({
      where: { id: courseId, userId: session.user.id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Mata kuliah tidak ditemukan" },
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        courseId,
        deadline: new Date(deadline),
        priority: priority || "medium",
        status: status || "todo",
        userId: session.user.id,
      },
      include: {
        course: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Gagal membuat tugas" },
      { status: 500 }
    );
  }
}
