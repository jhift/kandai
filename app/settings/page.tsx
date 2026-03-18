"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";

interface Settings {
  hasCredential: boolean;
  username: string | null;
  lastSync: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      setSettings(data);
      if (data.username) setUsername(data.username);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "認証情報を保存しました" });
        setPassword("");
        setSettings((prev) => prev ? { ...prev, hasCredential: true, username } : prev);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `同期完了: ${data.message}${data.errors?.length > 0 ? `\n注意: ${data.errors.join(", ")}` : ""}`,
        });
        setSettings((prev) =>
          prev ? { ...prev, lastSync: new Date().toISOString() } : prev
        );
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteCredential = async () => {
    if (!confirm("認証情報を削除しますか？")) return;
    await fetch("/api/settings", { method: "DELETE" });
    setSettings((prev) => prev ? { ...prev, hasCredential: false, username: null } : prev);
    setUsername("");
    setPassword("");
    setMessage({ type: "success", text: "認証情報を削除しました" });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">設定</h1>

      {/* LMS連携 */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-gray-900 mb-1">LMS連携</h2>
        <p className="text-sm text-gray-500 mb-4">
          関西大学のLMS（学習管理システム）と連携して、履修情報や休講通知を自動で同期します。
        </p>

        {settings?.hasCredential && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-700">
              <span>✓</span>
              <span className="text-sm font-medium">連携済み: {settings.username}</span>
            </div>
            {settings.lastSync && (
              <div className="text-xs text-green-600 mt-1">
                最終同期: {formatDateTime(settings.lastSync)}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              学籍番号 / ユーザーID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例: k000000000"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
              {settings?.hasCredential && (
                <span className="text-gray-400 font-normal ml-1">（変更する場合のみ入力）</span>
              )}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={settings?.hasCredential ? "変更しない場合は空欄" : "LMSのパスワード"}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required={!settings?.hasCredential}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
            >
              {saving ? "保存中..." : "認証情報を保存"}
            </button>
            {settings?.hasCredential && (
              <button
                type="button"
                onClick={handleDeleteCredential}
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm transition-colors"
              >
                削除
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 同期 */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-gray-900 mb-1">データ同期</h2>
        <p className="text-sm text-gray-500 mb-4">
          LMSから最新の履修情報・休講通知を取得します。
          Playwrightのインストールが必要です（<code className="bg-gray-100 px-1 rounded">npx playwright install chromium</code>）。
        </p>
        <button
          onClick={handleSync}
          disabled={syncing || !settings?.hasCredential}
          className="w-full bg-gray-800 text-white py-2.5 rounded font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {syncing ? "同期中..." : "LMSと同期する"}
        </button>
        {!settings?.hasCredential && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            上の「LMS連携」で認証情報を設定してください
          </p>
        )}
      </div>

      {/* メッセージ */}
      {message && (
        <div
          className={`rounded-lg p-4 text-sm whitespace-pre-wrap ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* デモデータについて */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h2 className="font-semibold text-blue-900 mb-2">デモデータについて</h2>
        <p className="text-sm text-blue-700">
          初回起動時にサンプルデータ（授業・レビュー・通知）が自動で追加されます。
          LMSと同期すると実際のデータに置き換えられます。
        </p>
      </div>

      {/* LMSのURL情報 */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-2">技術情報</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">LMS URL:</span>{" "}
            <span className="font-mono text-xs bg-gray-100 px-1 rounded">
              {process.env.NEXT_PUBLIC_LMS_URL || "https://lms.kansai-u.ac.jp"}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ※ 認証情報はローカルのSQLiteデータベースに保存されます。
            外部サーバーには送信されません。
          </p>
        </div>
      </div>
    </div>
  );
}
