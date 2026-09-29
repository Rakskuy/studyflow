import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET dashboard stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Count tasks by status
    const [todoCount, inProgressCount, doneCount] = await Promise.all([
      prisma.task.count({ where: { userId, status: "todo" } }),
      prisma.task.count({ where: { userId, status: "in_progress" } }),
      prisma.task.count({ where: { userId, status: "done" } }),
    ]);

    // Overdue tasks (past deadline, not done)
    const overdueTasks = await prisma.task.findMany({
      where: {
        userId,
        deadline: { lt: now },
        status: { not: "done" },
      },
      include: {
        course: { select: { id: true, name: true, color: true } },
      },
      orderBy: { deadline: "asc" },
    });

    // Upcoming tasks (within 7 days, not done)
    const upcomingTasks = await prisma.task.findMany({
      where: {
        userId,
        deadline: { gte: now, lte: sevenDaysFromNow },
        status: { not: "done" },
      },
      include: {
        course: { select: { id: true, name: true, color: true } },
      },
      orderBy: { deadline: "asc" },
    });

    // Recent completed tasks
    const recentDone = await prisma.task.findMany({
      where: {
        userId,
        status: "done",
      },
      include: {
        course: { select: { id: true, name: true, color: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // Course summary
    const courses = await prisma.course.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: { status: true },
        },
      },
    });

    const courseSummary = courses.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      total: c._count.tasks,
      done: c.tasks.filter((t) => t.status === "done").length,
      inProgress: c.tasks.filter((t) => t.status === "in_progress").length,
      todo: c.tasks.filter((t) => t.status === "todo").length,
    }));

    return NextResponse.json({
      stats: {
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
        overdue: overdueTasks.length,
        total: todoCount + inProgressCount + doneCount,
      },
      overdueTasks,
      upcomingTasks,
      recentDone,
      courseSummary,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Gagal memuat dashboard" },
      { status: 500 }
    );
  }
}
