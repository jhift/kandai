"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DAY_LABELS, PERIOD_LABELS } from "@/lib/types";

interface Course {
  id: string;
  courseCode: string;
  name: string;
  instructor: string;
  credits: number;
  department?: string | null;
  semester?: string | null;
  dayOfWeek?: number | null;
  period?: number | null;
  room?: string | null;
  avgRating?: number | null;
  reviewCount?: number;
  hasCancellation?: boolean;
  enrollments: { id: string }[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEnrolled, setFilterEnrolled] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterEnrolled) params.set("enrolled", "true");
    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [search, filterEnrolled]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">授業一覧</h1>
        <div className="text-sm text-gray-500">{courses.length}件</div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="授業名・教員名で検索..."
          className="flex-1 min-w-48 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={filterEnrolled}
            onChange={(e) => setFilterEnrolled(e.target.checked)}
            className="rounded"
          />
          <span>履修中のみ</span>
        </label>
      </div>

      {/* 授業一覧 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">授業が見つかりません</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap gap-1">
                    {course.enrollments.length > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        履修中
                      </span>
                    )}
                    {course.hasCancellation && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        休講
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{course.credits}単位</span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  {course.dayOfWeek !== null && course.dayOfWeek !== undefined &&
                   course.period !== null && course.period !== undefined && (
                    <span>
                      {DAY_LABELS[course.dayOfWeek]}{PERIOD_LABELS[course.period]}
                    </span>
                  )}
                  {course.room && <span>{course.room}</span>}
                  {course.semester && <span>{course.semester}</span>}
                </div>

                {(course.avgRating || course.reviewCount) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-sm">
                    {course.avgRating && (
                      <span className="text-amber-600 font-medium">
                        ★ {course.avgRating}
                      </span>
                    )}
                    {course.reviewCount !== undefined && course.reviewCount > 0 && (
                      <span className="text-gray-400">{course.reviewCount}件のレビュー</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
