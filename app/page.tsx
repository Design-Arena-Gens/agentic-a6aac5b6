"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

type Priority = "low" | "medium" | "high";

type TodoItem = {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;
  priority: Priority;
  completed: boolean;
  createdAt: number;
};

type FilterState = {
  status: "all" | "active" | "completed";
  priority: "all" | Priority;
  search: string;
};

const STORAGE_KEY = "agentic-a6aac5b6::todos";

const initialFilter: FilterState = {
  status: "all",
  priority: "all",
  search: ""
};

export default function Page() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<FilterState>(initialFilter);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TodoItem[];
        setTodos(parsed);
      } catch (error) {
        console.error("Failed to parse stored todos", error);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const resetForm = () => {
    setTitle("");
    setNotes("");
    setDueDate("");
    setPriority("medium");
    setEditingId(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      setTodos((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: title.trim(),
                notes: notes.trim(),
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                priority
              }
            : item
        )
      );
      resetForm();
      return;
    }

    const newTodo: TodoItem = {
      id: uuid(),
      title: title.trim(),
      notes: notes.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      completed: false,
      createdAt: Date.now()
    };
    setTodos((current) => [newTodo, ...current]);
    resetForm();
  };

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed
            }
          : item
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const beginEdit = (item: TodoItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setNotes(item.notes);
    setPriority(item.priority);
    setDueDate(item.dueDate ? item.dueDate.slice(0, 10) : "");
  };

  const clearCompleted = () => {
    setTodos((current) => current.filter((item) => !item.completed));
  };

  const filteredTodos = useMemo(() => {
    return todos
      .filter((item) => {
        if (filter.status === "active" && item.completed) return false;
        if (filter.status === "completed" && !item.completed) return false;
        if (filter.priority !== "all" && item.priority !== filter.priority) return false;
        if (!filter.search.trim()) return true;
        const needle = filter.search.trim().toLowerCase();
        return (
          item.title.toLowerCase().includes(needle) ||
          item.notes.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        if (dueA !== dueB) return dueA - dueB;
        return b.createdAt - a.createdAt;
      });
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((item) => item.completed).length;
    const overdue = todos.filter((item) => {
      if (!item.dueDate) return false;
      return !item.completed && new Date(item.dueDate) < new Date();
    }).length;
    return { total, completed, overdue, active: total - completed };
  }, [todos]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-500/10 via-slate-100 to-slate-100 px-6 py-10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 sm:px-10">
      <div className="w-full max-w-5xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white/80 p-8 shadow-2xl shadow-indigo-500/5 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/80 dark:ring-slate-700">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">FocusFlow Tasks</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Organize your day, capture ideas, and stay in control of your priorities.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-xs sm:grid-cols-4 sm:text-sm">
              <div className="rounded-2xl bg-indigo-500/10 px-4 py-3 font-semibold text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                Total
                <div className="text-2xl">{stats.total}</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                Active
                <div className="text-2xl">{stats.active}</div>
              </div>
              <div className="rounded-2xl bg-slate-500/10 px-4 py-3 font-semibold text-slate-600 dark:bg-slate-400/10 dark:text-slate-300">
                Completed
                <div className="text-2xl">{stats.completed}</div>
              </div>
              <div className="rounded-2xl bg-rose-500/10 px-4 py-3 font-semibold text-rose-600 dark:bg-rose-400/10 dark:text-rose-300">
                Overdue
                <div className="text-2xl">{stats.overdue}</div>
              </div>
            </div>
          </div>

          <form className="grid gap-6 md:grid-cols-[2fr,1fr]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Task title
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What needs to get done?"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Notes
                </label>
                <textarea
                  className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add context or steps to accomplish this task"
                />
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/90 p-5 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Due date
                  <input
                    type="date"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-indigo-400"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Priority
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as Priority[]).map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setPriority(value)}
                        className={[
                          "rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition",
                          priority === value
                            ? "border-indigo-500 bg-indigo-500 text-white shadow"
                            : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-400"
                        ].join(" ")}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
              <div className="flex gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  {editingId ? "Save changes" : "Add task"}
                </button>
              </div>
            </div>
          </form>
        </header>

        <section className="mt-8 grid gap-4 rounded-3xl bg-white/80 p-6 shadow-2xl shadow-indigo-500/5 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/80 dark:ring-slate-700">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "completed"] as const).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setFilter((current) => ({ ...current, status }))}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold capitalize transition",
                    filter.status === status
                      ? "bg-indigo-500 text-white shadow"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  ].join(" ")}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filter.priority}
                onChange={(event) =>
                  setFilter((current) => ({
                    ...current,
                    priority: event.target.value as FilterState["priority"]
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400"
              >
                <option value="all">All priorities</option>
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
              <div className="relative">
                <input
                  value={filter.search}
                  onChange={(event) =>
                    setFilter((current) => ({ ...current, search: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
                  placeholder="Search tasks"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  🔍
                </span>
              </div>
              <button
                type="button"
                onClick={clearCompleted}
                className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-rose-800/60 dark:bg-slate-900 dark:text-rose-300 dark:hover:border-rose-600"
              >
                Clear completed
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            {filteredTodos.length === 0 ? (
              <div className="grid place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                <div className="text-4xl">✨</div>
                <p className="mt-3 text-lg font-semibold">
                  No tasks match your filters right now.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create a task above or adjust your filters to see more.
                </p>
              </div>
            ) : (
              filteredTodos.map((item) => {
                const dueLabel = item.dueDate
                  ? new Intl.DateTimeFormat(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    }).format(new Date(item.dueDate))
                  : "No due date";
                const isOverdue =
                  !!item.dueDate && !item.completed && new Date(item.dueDate) < new Date();

                return (
                  <article
                    key={item.id}
                    className={[
                      "group flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900",
                      item.completed ? "opacity-70" : ""
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTodo(item.id)}
                          className={[
                            "mt-1 grid h-6 w-6 place-items-center rounded-full border transition",
                            item.completed
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300 bg-white text-transparent hover:border-emerald-500 dark:border-slate-600"
                          ].join(" ")}
                          aria-label="Toggle todo"
                        >
                          ✓
                        </button>
                        <div>
                          <h2
                            className={[
                              "text-lg font-semibold text-slate-900 dark:text-slate-100",
                              item.completed ? "line-through decoration-slate-400" : ""
                            ].join(" ")}
                          >
                            {item.title}
                          </h2>
                          {item.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                            item.priority === "high"
                              ? "bg-rose-500/15 text-rose-600"
                              : item.priority === "medium"
                              ? "bg-amber-500/15 text-amber-600"
                              : "bg-emerald-500/15 text-emerald-600",
                            "dark:bg-slate-800 dark:text-slate-100"
                          ].join(" ")}
                        >
                          {item.priority} priority
                        </span>
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            isOverdue
                              ? "bg-rose-500/15 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          ].join(" ")}
                        >
                          {dueLabel}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => beginEdit(item)}
                        className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTodo(item.id)}
                        className="rounded-2xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:border-rose-400 hover:text-rose-600 dark:border-rose-800/60 dark:text-rose-300 dark:hover:border-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-3 rounded-3xl bg-white/80 px-6 py-4 text-sm text-slate-500 shadow-2xl shadow-indigo-500/5 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/80 dark:text-slate-400 dark:ring-slate-700 sm:flex-row">
          <p>FocusFlow keeps all data local to your device for instant privacy.</p>
          <p className="text-xs">
            Pro tip: press `Ctrl/Cmd + F` to search through your tasks even faster!
          </p>
        </footer>
      </div>
    </main>
  );
}
