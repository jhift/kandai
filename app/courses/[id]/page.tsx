"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import NoticeCard from "@/components/NoticeCard";
import { DAY_LABELS, PERIOD_LABELS, NoticeType, NoticeTypeLabel, NoticeTypeColor } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

interface Course {
  id: string;
  courseCode: string;
  name: string;
  nameEn?: string | null;
  instructor: string;
  credits: number;
  department?: string | null;
  year?: number | null;
  semester?: string | null;
  dayOfWeek?: number | null;
  period?: number | null;
  room?: string | null;
  description?: string | null;
  objectives?: string | null;
  evaluation?: string | null;
  textbook?: string | null;
  notes?: string | null;
  syllabusUrl?: string | null;
  avgRating?: number | null;
  avgDifficulty?: number | null;
  avgWorkload?: number | null;
  reviewCount?: number;
  enrollments: { id: string }[];
  notices: {
    id: string;
    type: string;
    title: string;
    content: string;
    date?: string | null;
    period?: number | null;
    isRead: boolean;
    createdAt: string;
  }[];
}

interface Review {
  id: string;
  rating: number;
  difficulty: number;
  workload: number;
  comment: string;
  academicYear: number;
  semester: string;
  nickname?: string | null;
  isAnonymous: boolean;
  helpful: number;
  createdAt: string;
}

type Tab = "info" | "reviews" | "notices";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("info");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchCourse = async () => {
    const res = await fetch(`/api/courses/${id}`);
    const data = await res.json();
    setCourse(data);
  };

  const fetchReviews = async () => {
    const res = await fetch(`/api/courses/${id}/reviews`);
    const data = await res.json();
    setReviews(data.reviews || []);
  };

  useEffect(() => {
    Promise.all([fetchCourse(), fetchReviews()]).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">授業が見つかりません</p>
        <Link href="/courses" className="text-red-600 hover:underline mt-2 inline-block">
          ← 授業一覧に戻る
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "info", label: "授業情報" },
    { id: "reviews", label: "レビュー", count: course.reviewCount },
    { id: "notices", label: "通知", count: course.notices.length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-red-600">ホーム</Link>
        <span>/</span>
        <Link href="/courses" className="hover:text-red-600">授業一覧</Link>
        <span>/</span>
        <span className="text-gray-900">{course.name}</span>
      </div>

      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {course.enrollments.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                  履修中
                </span>
              )}
              {course.semester && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {course.semester}
                </span>
              )}
              <span className="text-xs text-gray-400">{course.courseCode}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            {course.nameEn && (
              <p className="text-gray-500 mt-0.5">{course.nameEn}</p>
            )}
          </div>
          {course.avgRating && (
            <div className="text-center shrink-0">
              <div className="text-3xl font-bold text-amber-600">{course.avgRating}</div>
              <StarRating value={Math.round(course.avgRating)} readonly size="sm" />
              <div className="text-xs text-gray-400 mt-0.5">{course.reviewCount}件</div>
            </div>
          )}
        </div>

        {/* 基本情報グリッド */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">担当教員</div>
            <div className="font-medium text-gray-900">{course.instructor}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">単位</div>
            <div className="font-medium text-gray-900">{course.credits}単位</div>
          </div>
          {course.dayOfWeek !== null && course.dayOfWeek !== undefined &&
           course.period !== null && course.period !== undefined && (
            <div>
              <div className="text-xs text-gray-500">時限</div>
              <div className="font-medium text-gray-900">
                {DAY_LABELS[course.dayOfWeek]}曜 {PERIOD_LABELS[course.period]}
              </div>
            </div>
          )}
          {course.room && (
            <div>
              <div className="text-xs text-gray-500">教室</div>
              <div className="font-medium text-gray-900">{course.room}</div>
            </div>
          )}
          {course.department && (
            <div>
              <div className="text-xs text-gray-500">学部</div>
              <div className="font-medium text-gray-900">{course.department}</div>
            </div>
          )}
        </div>

        {/* 評価サマリー */}
        {(course.avgDifficulty || course.avgWorkload) && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            {course.avgDifficulty && (
              <div>
                <div className="text-xs text-gray-500 mb-1">難易度</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`w-6 h-2 rounded-full ${
                        n <= Math.round(course.avgDifficulty!) ? "bg-red-400" : "bg-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{course.avgDifficulty}</span>
                </div>
              </div>
            )}
            {course.avgWorkload && (
              <div>
                <div className="text-xs text-gray-500 mb-1">課題量</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`w-6 h-2 rounded-full ${
                        n <= Math.round(course.avgWorkload!) ? "bg-orange-400" : "bg-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{course.avgWorkload}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {course.syllabusUrl && (
          <div className="mt-3">
            <a
              href={course.syllabusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-600 hover:underline"
            >
              公式シラバスを見る →
            </a>
          </div>
        )}
      </div>

      {/* タブ */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="ml-1.5 bg-gray-200 text-gray-700 text-xs rounded-full px-1.5">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* 授業情報タブ */}
          {tab === "info" && (
            <div className="space-y-5">
              {course.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">授業概要</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {course.description}
                  </p>
                </div>
              )}
              {course.objectives && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">到達目標</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {course.objectives}
                  </p>
                </div>
              )}
              {course.evaluation && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">評価方法</h3>
                  <p className="text-sm text-gray-700">{course.evaluation}</p>
                </div>
              )}
              {course.textbook && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">教科書</h3>
                  <p className="text-sm text-gray-700">{course.textbook}</p>
                </div>
              )}
              {course.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">備考</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{course.notes}</p>
                </div>
              )}
              {!course.description && !course.objectives && (
                <p className="text-gray-500 text-sm">シラバス情報がありません</p>
              )}
            </div>
          )}

          {/* レビュータブ */}
          {tab === "reviews" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {reviews.length}件のレビュー
                </h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  {showReviewForm ? "キャンセル" : "レビューを書く"}
                </button>
              </div>

              {showReviewForm && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">レビューを投稿</h4>
                  <ReviewForm
                    courseId={id}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      fetchReviews();
                      fetchCourse();
                    }}
                  />
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  まだレビューがありません。最初のレビューを投稿してください！
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <StarRating value={review.rating} readonly size="sm" />
                          <div className="text-xs text-gray-500 mt-1">
                            {review.academicYear}年度 {review.semester}
                            {review.nickname && ` · ${review.nickname}`}
                            {review.isAnonymous && !review.nickname && " · 匿名"}
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>難易度: {review.difficulty}/5</span>
                          <span>課題量: {review.workload}/5</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                      <div className="text-xs text-gray-400 mt-2">{formatDateTime(review.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 通知タブ */}
          {tab === "notices" && (
            <div className="space-y-3">
              {course.notices.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">通知はありません</p>
              ) : (
                course.notices.map((notice) => (
                  <NoticeCard key={notice.id} notice={{ ...notice, course: null }} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
