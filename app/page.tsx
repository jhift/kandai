"use client";

import { useEffect, useState } from "react";
import Timetable from "@/components/Timetable";
import Link from "next/link";
import { DAY_LABELS, PERIOD_LABELS } from "@/lib/types";

interface Course {
  id: string;
  name: string;
  instructor: string;
  room?: string | null;
  dayOfWeek?: number | null;
  period?: number | null;
  avgRating?: number | null;
  hasCancellation?: boolean;
  reviewCount?: number;
}

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
  } | null;
}

const PERIOD_TIMES_MIN = [
  { start: 9 * 60, end: 10 * 60 + 30 },
  { start: 10 * 60 + 45, end: 12 * 60 + 15 },
  { start: 13 * 60, end: 14 * 60 + 30 },
  { start: 14 * 60 + 45, end: 16 * 60 + 15 },
  { start: 16 * 60 + 30, end: 18 * 60 },
  { start: 18 * 60 + 15, end: 19 * 60 + 45 },
];

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/courses?enrolled=true").then((r) => r.json()),
      fetch("/api/notices?unread=true").then((r) => r.json()),
    ]).then(([coursesData, noticesData]) => {
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setNotices(Array.isArray(noticesData) ? noticesData : []);
      setLoading(false);
    });
  }, []);

  const today = new Date().getDay();
  const todayIndex = today === 0 ? -1 : today === 6 ? -1 : today - 1;
  const todayCourses = courses
    .filter((c) => c.dayOfWeek === todayIndex)
    .sort((a, b) => (a.period ?? 0) - (b.period ?? 0));

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const currentPeriod = PERIOD_TIMES_MIN.findIndex(
    (t) => currentTime >= t.start && currentTime <= t.end
  );
  const currentCourse = courses.find(
    (c) => c.dayOfWeek === todayIndex && c.period === currentPeriod
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 今日の授業 */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-lg">
              今日の授業
              {todayIndex >= 0 && (
                <span className="ml-2 text-base font-normal text-gray-500">
                  ({DAY_LABELS[todayIndex]}曜日)
                </span>
              )}
            </h2>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}
            </span>
          </div>

          {currentCourse && currentPeriod >= 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <div className="text-xs text-red-600 font-medium mb-1">
                ● 現在の授業 — {PERIOD_LABELS[currentPeriod]}
              </div>
              <Link
                href={`/courses/${currentCourse.id}`}
                className="font-semibold text-gray-900 hover:text-red-600"
              >
                {currentCourse.name}
              </Link>
              <div className="text-sm text-gray-500">
                {currentCourse.instructor}
                {currentCourse.room && ` / ${currentCourse.room}`}
              </div>
            </div>
          )}

          {todayIndex < 0 ? (
            <p className="text-gray-500 text-sm">今日は休日です。ゆっくり休んでください。</p>
          ) : todayCourses.length === 0 ? (
            <p className="text-gray-500 text-sm">今日の授業はありません</p>
          ) : (
            <div className="space-y-1">
              {todayCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    course.period === currentPeriod ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded min-w-10 text-center">
                    {course.period !== null && course.period !== undefined
                      ? PERIOD_LABELS[course.period]
                      : "?限"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{course.name}</div>
                    <div className="text-xs text-gray-500">
                      {course.instructor}
                      {course.room && ` / ${course.room}`}
                    </div>
                  </div>
                  {course.hasCancellation && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full shrink-0">
                      休講
                    </span>
                  )}
                  {course.avgRating && (
                    <span className="text-xs text-amber-600 shrink-0">
                      ★ {course.avgRating}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 未読通知 */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">
              通知
              {notices.length > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {notices.length}
                </span>
              )}
            </h2>
            <Link href="/notices" className="text-xs text-red-600 hover:underline">
              すべて見る
            </Link>
          </div>
          {notices.length === 0 ? (
            <p className="text-sm text-gray-500">新しい通知はありません</p>
          ) : (
            <div className="space-y-3">
              {notices.slice(0, 5).map((notice) => (
                <div key={notice.id} className="border-l-2 border-red-400 pl-2">
                  <div className="text-xs text-red-600 font-medium">
                    {notice.type === "CANCELLATION" ? "休講" :
                     notice.type === "MAKEUP" ? "補講" :
                     notice.type === "ROOM_CHANGE" ? "教室変更" : "お知らせ"}
                  </div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                    {notice.title}
                  </div>
                  {notice.course && (
                    <div className="text-xs text-gray-400">{notice.course.name}</div>
                  )}
                </div>
              ))}
              {notices.length > 5 && (
                <div className="text-xs text-gray-400">他 {notices.length - 5}件</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 時間割 */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">週間時間割</h2>
          <Link href="/courses" className="text-sm text-red-600 hover:underline">
            授業一覧 →
          </Link>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">履修中の授業がありません</p>
            <p className="text-sm">
              <Link href="/settings" className="text-red-600 hover:underline">
                設定ページ
              </Link>
              でLMSと連携するか、
              <Link href="/courses" className="text-red-600 hover:underline ml-1">
                授業一覧
              </Link>
              から授業を追加してください
            </p>
          </div>
        ) : (
          <Timetable courses={courses} />
        )}
      </div>
    </div>
  );
}
