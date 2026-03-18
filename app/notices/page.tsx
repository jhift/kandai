"use client";

import { useEffect, useState } from "react";
import NoticeCard from "@/components/NoticeCard";

interface Notice {
  id: string;
  type: string;
  title: string;
  content: string;
  date?: string | null;
  period?: number | null;
  isRead: boolean;
  createdAt: string;
  course?: {
    id: string;
    name: string;
    dayOfWeek?: number | null;
    period?: number | null;
  } | null;
}

type FilterType = "ALL" | "CANCELLATION" | "MAKEUP" | "ROOM_CHANGE" | "ANNOUNCEMENT";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const fetchNotices = async () => {
    setLoading(true);
    const params = filter !== "ALL" ? `?type=${filter}` : "";
    const res = await fetch(`/api/notices${params}`);
    const data = await res.json();
    setNotices(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, [filter]);

  const markAllRead = async () => {
    await fetch("/api/notices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    fetchNotices();
  };

  const unreadCount = notices.filter((n) => !n.isRead).length;

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "ALL", label: "すべて" },
    { id: "CANCELLATION", label: "休講" },
    { id: "MAKEUP", label: "補講" },
    { id: "ROOM_CHANGE", label: "教室変更" },
    { id: "ANNOUNCEMENT", label: "お知らせ" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          通知
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-600 text-white text-sm rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-red-600 hover:underline"
          >
            すべて既読にする
          </button>
        )}
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === opt.id
                ? "bg-red-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">通知はありません</div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
}
