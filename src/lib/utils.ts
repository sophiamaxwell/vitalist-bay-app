import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDuration(start: Date | string, end: Date | string): string {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 60) {
    return `${diffMins}min`;
  }
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function groupSessionsByDate<T extends { startTime: Date | string }>(
  sessions: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>()

  for (const session of sessions) {
    const date = typeof session.startTime === "string"
      ? new Date(session.startTime)
      : session.startTime
    const key = date.toLocaleDateString("en-CA")
    const existing = grouped.get(key)

    if (existing) {
      existing.push(session)
    } else {
      grouped.set(key, [session])
    }
  }

  return grouped
}

export function getSessionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    KEYNOTE: 'bg-purple-500',
    TALK: 'bg-blue-500',
    PANEL: 'bg-emerald-500',
    WORKSHOP: 'bg-orange-500',
    NETWORKING: 'bg-pink-500',
    BREAK: 'bg-gray-400',
    OTHER: 'bg-slate-500',
  };
  return colors[type] || colors.OTHER;
}
