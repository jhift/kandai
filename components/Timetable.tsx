"use client";

import Link from "next/link";
import { DAY_LABELS, PERIOD_LABELS, PERIOD_TIMES } from "@/lib/types";

interface CourseCell {
  id: string;
  name: string;
  instructor: string;
  room?: string | null;
  avgRating?: number | null;
  hasCancellation?: boolean;
}

interface TimetableProps {
  courses: Array<CourseCell & { dayOfWeek?: number | null; period?: number | null }>;
}

const BG_COLORS = [
  "bg-blue-50 border-blue-200 hover:bg-blue-100",
  "bg-green-50 border-green-200 hover:bg-green-100",
  "bg-purple-50 border-purple-200 hover:bg-purple-100",
  "bg-orange-50 border-orange-200 hover:bg-orange-100",
  "bg-pink-50 border-pink-200 hover:bg-pink-100",
  "bg-teal-50 border-teal-200 hover:bg-teal-100",
];

export default function Timetable({ courses }: TimetableProps) {
  // 時間割グリッドを構築
  const grid: Record<string, (CourseCell & { dayOfWeek: number; period: number }) | null> = {};

  courses.forEach((course, idx) => {
    if (course.dayOfWeek !== null && course.dayOfWeek !== undefined &&
        course.period !== null && course.period !== undefined) {
      const key = `${course.dayOfWeek}-${course.period}`;
      grid[key] = { ...course, dayOfWeek: course.dayOfWeek, period: course.period };
    }
  });

  // 今日の曜日を取得（0=月,...,4=金）
  const today = new Date().getDay();
  const todayIndex = today === 0 ? -1 : today === 6 ? -1 : today - 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-20 p-2 text-center text-xs text-gray-500 border border-gray-200 bg-gray-50"></th>
            {DAY_LABELS.map((day, dayIdx) => (
              <th
                key={day}
                className={`p-2 text-center font-semibold border border-gray-200 ${
                  dayIdx === todayIndex
                    ? "bg-red-600 text-white"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIOD_LABELS.map((period, periodIdx) => (
            <tr key={period}>
              <td className="p-2 text-center border border-gray-200 bg-gray-50">
                <div className="text-xs font-semibold text-gray-700">{period}</div>
                <div className="text-xs text-gray-400">{PERIOD_TIMES[periodIdx].start}</div>
                <div className="text-xs text-gray-400">{PERIOD_TIMES[periodIdx].end}</div>
              </td>
              {DAY_LABELS.map((_, dayIdx) => {
                const key = `${dayIdx}-${periodIdx}`;
                const course = grid[key];
                const colorClass = BG_COLORS[(dayIdx + periodIdx * 5) % BG_COLORS.length];

                return (
                  <td
                    key={`${dayIdx}-${periodIdx}`}
                    className={`p-1 border border-gray-200 min-w-[120px] h-24 align-top ${
                      dayIdx === todayIndex ? "bg-red-50/30" : ""
                    }`}
                  >
                    {course ? (
                      <Link href={`/courses/${course.id}`}>
                        <div
                          className={`h-full rounded border p-1.5 cursor-pointer transition-colors ${colorClass} relative`}
                        >
                          {course.hasCancellation && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" title="休講あり" />
                          )}
                          <div className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">
                            {course.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            {course.instructor}
                          </div>
                          {course.room && (
                            <div className="text-xs text-gray-400 truncate">{course.room}</div>
                          )}
                          {course.avgRating && (
                            <div className="text-xs text-amber-600 mt-0.5">
                              ★ {course.avgRating}
                            </div>
                          )}
                        </div>
                      </Link>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
