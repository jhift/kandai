"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import { getCurrentAcademicYear, getCurrentSemester } from "@/lib/utils";

interface ReviewFormProps {
  courseId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ courseId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [comment, setComment] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [semester, setSemester] = useState(getCurrentSemester());
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          difficulty,
          workload,
          comment,
          academicYear,
          semester,
          isAnonymous,
          nickname: isAnonymous ? null : nickname,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "投稿に失敗しました");
        return;
      }

      // リセット
      setRating(0);
      setDifficulty(0);
      setWorkload(0);
      setComment("");
      setNickname("");
      onSuccess?.();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          総合評価 <span className="text-red-500">*</span>
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">難易度</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDifficulty(n)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  n <= difficulty
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">1=簡単 〜 5=難しい</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">課題量</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setWorkload(n)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  n <= workload
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">1=少ない 〜 5=多い</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">受講年度</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {[0, 1, 2, 3, 4].map((offset) => {
              const year = getCurrentAcademicYear() - offset;
              return (
                <option key={year} value={year}>{year}年度</option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">学期</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="前期">前期</option>
            <option value="後期">後期</option>
            <option value="通年">通年</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          コメント <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="授業の感想、試験情報、おすすめポイントなど（10文字以上）"
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
        />
        <div className="text-xs text-gray-400 text-right">{comment.length}文字</div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">匿名で投稿</span>
        </label>
        {!isAnonymous && (
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ニックネーム（任意）"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting || rating === 0 || comment.length < 10}
        className="w-full bg-red-600 text-white py-2.5 rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "投稿中..." : "レビューを投稿する"}
      </button>
    </form>
  );
}
