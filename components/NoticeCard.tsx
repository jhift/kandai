import { NoticeType, NoticeTypeLabel, NoticeTypeColor, DAY_LABELS, PERIOD_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface NoticeCardProps {
  notice: {
    id: string;
    type: string;
    title: string;
    content: string;
    date?: Date | string | null;
    period?: number | null;
    isRead: boolean;
    createdAt: Date | string;
    course?: {
      id: string;
      name: string;
      dayOfWeek?: number | null;
      period?: number | null;
    } | null;
  };
}

export default function NoticeCard({ notice }: NoticeCardProps) {
  const type = notice.type as NoticeType;
  const colorClass = NoticeTypeColor[type] || NoticeTypeColor.ANNOUNCEMENT;
  const label = NoticeTypeLabel[type] || "お知らせ";

  return (
    <div className={`p-4 rounded-lg border ${notice.isRead ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
            {label}
          </span>
          {!notice.isRead && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" title="未読" />
          )}
          {notice.course && (
            <span className="text-xs text-gray-500">{notice.course.name}</span>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatDate(notice.createdAt)}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mt-2">{notice.title}</h3>
      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{notice.content}</p>
      {notice.date && (
        <div className="mt-2 text-xs text-gray-500">
          対象日: {formatDate(notice.date)}
          {notice.period !== null && notice.period !== undefined && (
            <> {PERIOD_LABELS[notice.period]}</>
          )}
        </div>
      )}
    </div>
  );
}
