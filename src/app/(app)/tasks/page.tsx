"use client";

import { useEffect, useState, useCallback } from "react";

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
  createdAt: string;
  course: Course;
  courseId: string;
}

interface CourseOption {
  id: string;
  name: string;
  color: string;
  lecturer: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDeadline(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} hari terlambat`;
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  return `${days} hari lagi`;
}

function isOverdue(deadline: string, status: string) {
  return new Date(deadline) < new Date() && status !== "done";
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

function getStatusColor(status: string) {
  switch (status) {
    case "done":
      return "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20";
    case "in_progress":
      return "bg-accent-sky/15 text-accent-sky border-accent-sky/20";
    case "todo":
      return "bg-slate-500/15 text-slate-400 border-slate-500/20";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/20";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "done":
      return "Selesai";
    case "in_progress":
      return "Dikerjakan";
    case "todo":
      return "Belum";
    default:
      return status;
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filters
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formStatus, setFormStatus] = useState("todo");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (filterCourse) params.set("courseId", filterCourse);
    if (filterStatus) params.set("status", filterStatus);
    if (filterPriority) params.set("priority", filterPriority);
    if (searchQuery) params.set("search", searchQuery);
    return params.toString();
  }, [filterCourse, filterStatus, filterPriority, searchQuery]);

  const fetchTasks = useCallback(async () => {
    try {
      const query = buildQueryString();
      const res = await fetch(`/api/tasks${query ? `?${query}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormCourseId(courses[0]?.id || "");
    setFormDeadline("");
    setFormPriority("medium");
    setFormStatus("todo");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormCourseId(task.courseId);
    setFormDeadline(new Date(task.deadline).toISOString().slice(0, 16));
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (courses.length === 0) {
      setFormError("Tambahkan mata kuliah terlebih dahulu");
      return;
    }

    setSaving(true);

    try {
      const url = editingTask
        ? `/api/tasks/${editingTask.id}`
        : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          courseId: formCourseId,
          deadline: formDeadline,
          priority: formPriority,
          status: formStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Gagal menyimpan");
        return;
      }

      setShowModal(false);
      fetchTasks();
    } catch {
      setFormError("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus tugas ini?")) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton" />
        <div className="h-14 skeleton" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Tugas Kuliah</h1>
          <p className="text-slate-400 text-sm mt-0.5 sm:mt-1">
            {tasks.length} tugas ditemukan
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary w-full sm:w-auto justify-center shadow-lg shadow-brand-500/20">
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
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
                placeholder="Cari tugas..."
              />
            </div>
          </div>

          {/* Course filter */}
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="select-field"
          >
            <option value="">Semua Mata Kuliah</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-field"
          >
            <option value="">Semua Status</option>
            <option value="todo">Belum Dikerjakan</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="done">Selesai</option>
          </select>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="select-field"
          >
            <option value="">Semua Prioritas</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-brand-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery || filterCourse || filterStatus || filterPriority
              ? "Tidak ada tugas yang cocok"
              : "Belum ada tugas"}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchQuery || filterCourse || filterStatus || filterPriority
              ? "Coba ubah filter pencarian"
              : "Buat tugas pertamamu untuk mulai tracking"}
          </p>
          {!(searchQuery || filterCourse || filterStatus || filterPriority) && (
            <button onClick={openCreateModal} className="btn-primary">
              Buat Tugas Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const overdue = isOverdue(task.deadline, task.status);
            return (
              <div
                key={task.id}
                className={`glass-card p-5 transition-all hover:border-brand-500/20 stagger-item ${
                  overdue ? "!border-red-500/30 bg-red-500/[0.03]" : ""
                } ${task.status === "done" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Status checkbox */}
                  <button
                    onClick={() =>
                      handleStatusChange(
                        task,
                        task.status === "done"
                          ? "todo"
                          : task.status === "todo"
                          ? "in_progress"
                          : "done"
                      )
                    }
                    className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      task.status === "done"
                        ? "bg-accent-emerald border-accent-emerald"
                        : task.status === "in_progress"
                        ? "bg-accent-sky/20 border-accent-sky"
                        : "border-slate-600 hover:border-brand-400"
                    }`}
                    title={
                      task.status === "done"
                        ? "Tandai belum selesai"
                        : task.status === "todo"
                        ? "Mulai kerjakan"
                        : "Tandai selesai"
                    }
                  >
                    {task.status === "done" && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {task.status === "in_progress" && (
                      <div className="w-2 h-2 rounded-full bg-accent-sky" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className={`font-semibold text-white ${
                          task.status === "done" ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEditModal(task)}
                          className="btn-ghost p-1.5"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="btn-ghost p-1.5 hover:!text-red-400"
                          title="Hapus"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {/* Course badge */}
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

                      {/* Priority badge */}
                      <span
                        className={`badge text-xs border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>

                      {/* Status badge */}
                      <span
                        className={`badge text-xs border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusLabel(task.status)}
                      </span>

                      {/* Deadline */}
                      <span
                        className={`text-xs font-medium ${
                          overdue
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      >
                        📅 {formatDate(task.deadline)} ({formatDeadline(task.deadline)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {editingTask ? "Edit Tugas" : "Tugas Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Judul Tugas
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-field"
                  placeholder="Contoh: Tugas Praktikum 3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="textarea-field"
                  placeholder="Opsional: detail tentang tugas ini..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mata Kuliah
                  </label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="select-field"
                    required
                  >
                    <option value="">Pilih Mata Kuliah</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Prioritas
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="select-field"
                  >
                    <option value="low">🟢 Rendah</option>
                    <option value="medium">🟡 Sedang</option>
                    <option value="high">🔴 Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="select-field"
                  >
                    <option value="todo">Belum Dikerjakan</option>
                    <option value="in_progress">Sedang Dikerjakan</option>
                    <option value="done">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingTask
                    ? "Simpan Perubahan"
                    : "Buat Tugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
