export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCurrentAcademicYear(): number {
  const now = new Date();
  // 4月始まりの日本の学年度
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

export function getCurrentSemester(): string {
  const month = new Date().getMonth() + 1;
  // 4-9月 → 前期, 10-3月 → 後期
  return month >= 4 && month <= 9 ? "前期" : "後期";
}
