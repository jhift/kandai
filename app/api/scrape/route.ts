import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeEnrolledCourses, scrapeNotices, syncToDatabase } from "@/lib/lms-scraper";

export async function POST(request: NextRequest) {
  try {
    const credential = await prisma.lmsCredential.findUnique({
      where: { id: "default" },
    });

    if (!credential) {
      return NextResponse.json(
        { error: "LMS認証情報が設定されていません。設定ページでIDとパスワードを入力してください。" },
        { status: 400 }
      );
    }

    // 並行してコースと通知を取得
    const [coursesResult, noticesResult] = await Promise.all([
      scrapeEnrolledCourses(credential.username, credential.password),
      scrapeNotices(credential.username, credential.password),
    ]);

    const errors: string[] = [];

    if (!coursesResult.success) {
      errors.push(`履修情報: ${coursesResult.error}`);
    }
    if (!noticesResult.success) {
      errors.push(`通知: ${noticesResult.error}`);
    }

    if (errors.length === 2) {
      return NextResponse.json({ error: errors.join("\n") }, { status: 500 });
    }

    const syncResult = await syncToDatabase(
      coursesResult.data ?? [],
      noticesResult.data ?? []
    );

    return NextResponse.json({
      success: true,
      synced: syncResult.synced,
      errors: [...errors, ...syncResult.errors],
      message: `${syncResult.synced}件のデータを同期しました`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `同期エラー: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
