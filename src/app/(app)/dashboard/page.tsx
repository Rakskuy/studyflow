"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: string;
  status: string;
  course: Course;
}

interface CourseSummary {
  id: string;
  name: string;
  color: string;
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}

interface DashboardData {
  stats: {
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
    total: number;
  };
  overdueTasks: Task[];
  upcomingTasks: Task[];
  recentDone: Task[];
  courseSummary: CourseSummary[];
}

function formatDeadline(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} hari yang lalu`;
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  return `${days} hari lagi`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-priority-high/15 text-priority-high border-priority-high/20";
    case "medium":
      return "bg-priority-medium/15 text-priority-medium border-priority-medium/20";
    case "low":
      return "bg-priority-low/15 text-priority-low border-priority-low/20";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/20";
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case "high":
      return "Tinggi";
    case "medium":
      return "Sedang";
    case "low":
      return "Rendah";
    default:
      return priority;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-400">
        Gagal memuat dashboard
      </div>
    );
  }

  const { stats, overdueTasks, upcomingTasks, recentDone, courseSummary } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ringkasan tugas dan aktivitas kuliahmu
          </p>
        </div>
        <Link href="/tasks" className="btn-primary w-full sm:w-auto justify-center shadow-lg shadow-brand-500/20">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          Tugas Baru
        </Link>
      </div>

      {/* Stats Cards - 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div className="glass-card p-4 sm:p-6 stagger-item">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">
              Total
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">Semua tugas</p>
        </div>

        {/* Todo */}
        <div className="glass-card p-4 sm:p-6 stagger-item">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent-amber/15 flex items-center justify-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-accent-amber"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">
              Belum
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.todo}</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">Belum selesai</p>
        </div>

        {/* In Progress */}
        <div className="glass-card p-4 sm:p-6 stagger-item">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent-sky/15 flex items-center justify-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-accent-sky"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">
              Proses
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.inProgress}</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">Dikerjakan</p>
        </div>

        {/* Done */}
        <div className="glass-card p-4 sm:p-6 stagger-item">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent-emerald/15 flex items-center justify-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-accent-emerald"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">
              Selesai
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.done}</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">Telah selesai</p>
        </div>
      </div>

      {/* Overdue Warning Banner */}
      {stats.overdue > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-red-300 font-semibold">
              {stats.overdue} tugas melewati deadline!
            </p>
            <p className="text-red-400/70 text-sm">
              Segera selesaikan tugas yang terlambat
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">
                Tugas Terlambat
              </h2>
              <span className="badge bg-red-500/15 text-red-400 border border-red-500/20 ml-auto">
                {overdueTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition-all stagger-item"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className="badge text-xs border"
                          style={{
                            backgroundColor: task.course.color + "15",
                            color: task.course.color,
                            borderColor: task.course.color + "30",
                          }}
                        >
                          {task.course.name}
                        </span>
                        <span className="text-xs text-red-400 font-medium">
                          {formatDeadline(task.deadline)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge text-xs border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Tasks */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-accent-amber/15 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-accent-amber"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">
              Deadline 7 Hari
            </h2>
            <span className="badge bg-accent-amber/15 text-accent-amber border border-accent-amber/20 ml-auto">
              {upcomingTasks.length}
            </span>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              Tidak ada tugas mendekat 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-brand-500/20 transition-all stagger-item"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className="badge text-xs border"
                          style={{
                            backgroundColor: task.course.color + "15",
                            color: task.course.color,
                            borderColor: task.course.color + "30",
                          }}
                        >
                          {task.course.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(task.deadline)} ({formatDeadline(task.deadline)})
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge text-xs border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Summary */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-brand-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">
              Per Mata Kuliah
            </h2>
          </div>
          {courseSummary.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm mb-3">
                Belum ada mata kuliah
              </p>
              <Link href="/courses" className="btn-secondary text-sm">
                Tambah Mata Kuliah
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courseSummary.map((course) => {
                const progress =
                  course.total > 0
                    ? Math.round((course.done / course.total) * 100)
                    : 0;
                return (
                  <div
                    key={course.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-brand-500/20 transition-all stagger-item"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        <span className="text-white font-medium text-sm">
                          {course.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {course.done}/{course.total}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: course.color,
                          boxShadow: `0 0 10px ${course.color}40`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Completed */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/15 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-accent-emerald"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">
              Baru Diselesaikan
            </h2>
          </div>
          {recentDone.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              Belum ada tugas selesai
            </p>
          ) : (
            <div className="space-y-3">
              {recentDone.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/10 stagger-item"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-accent-emerald flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 font-medium text-sm truncate line-through decoration-accent-emerald/50">
                        {task.title}
                      </p>
                      <span
                        className="text-xs mt-1 inline-block"
                        style={{ color: task.course.color }}
                      >
                        {task.course.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
