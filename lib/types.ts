export type NoticeType = "CANCELLATION" | "MAKEUP" | "ROOM_CHANGE" | "ANNOUNCEMENT";

export const NoticeTypeLabel: Record<NoticeType, string> = {
  CANCELLATION: "休講",
  MAKEUP: "補講",
  ROOM_CHANGE: "教室変更",
  ANNOUNCEMENT: "お知らせ",
};

export const NoticeTypeColor: Record<NoticeType, string> = {
  CANCELLATION: "bg-red-100 text-red-800",
  MAKEUP: "bg-blue-100 text-blue-800",
  ROOM_CHANGE: "bg-yellow-100 text-yellow-800",
  ANNOUNCEMENT: "bg-gray-100 text-gray-800",
};

export const DAY_LABELS = ["月", "火", "水", "木", "金"];
export const PERIOD_LABELS = ["1限", "2限", "3限", "4限", "5限", "6限"];

// 時限の時間
export const PERIOD_TIMES = [
  { start: "09:00", end: "10:30" },
  { start: "10:45", end: "12:15" },
  { start: "13:00", end: "14:30" },
  { start: "14:45", end: "16:15" },
  { start: "16:30", end: "18:00" },
  { start: "18:15", end: "19:45" },
];

export type ScrapeStatus = "idle" | "running" | "success" | "error";
