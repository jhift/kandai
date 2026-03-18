/**
 * 関西大学 LMS (KU-LMS / BlackBoard) スクレイパー
 *
 * LMSのURL: https://lms.kansai-u.ac.jp
 * ログインページ: https://lms.kansai-u.ac.jp/webapps/login/
 *
 * 注意: このスクレイパーはPlaywrightを使用しています。
 * 本番環境では `npx playwright install chromium` が必要です。
 */

import { prisma } from "./db";

// LMSのベースURL（実際のURLに変更してください）
const LMS_BASE_URL = process.env.LMS_BASE_URL || "https://lms.kansai-u.ac.jp";
const LMS_LOGIN_URL = `${LMS_BASE_URL}/webapps/login/`;

export interface ScrapedCourse {
  courseCode: string;
  name: string;
  instructor: string;
  dayOfWeek?: number;
  period?: number;
  room?: string;
  semester?: string;
}

export interface ScrapedNotice {
  lmsId: string;
  type: string;
  title: string;
  content: string;
  date?: Date;
  period?: number;
  courseName?: string;
  courseCode?: string;
}

export interface ScrapeResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * LMSにログインしてセッションを取得する
 * Playwrightが利用できない環境ではモックデータを返す
 */
async function getLmsPage(username: string, password: string) {
  try {
    // Playwrightを動的にインポート（インストールされていない場合はエラー）
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // LMSにログイン
    await page.goto(LMS_LOGIN_URL);
    await page.fill('input[name="user_id"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('input[type="submit"]');

    // ログイン確認
    await page.waitForNavigation({ timeout: 10000 });
    const currentUrl = page.url();

    if (currentUrl.includes("login")) {
      await browser.close();
      throw new Error("ログインに失敗しました。IDとパスワードを確認してください。");
    }

    return { browser, page, context };
  } catch (err) {
    if ((err as Error).message?.includes("Cannot find module")) {
      throw new Error(
        "Playwrightがインストールされていません。`npx playwright install chromium` を実行してください。"
      );
    }
    throw err;
  }
}

/**
 * 履修中の授業一覧をスクレイピング
 */
export async function scrapeEnrolledCourses(
  username: string,
  password: string
): Promise<ScrapeResult<ScrapedCourse[]>> {
  try {
    const { browser, page } = await getLmsPage(username, password);

    const courses: ScrapedCourse[] = [];

    try {
      // BlackBoard のコース一覧ページへ移動
      await page.goto(`${LMS_BASE_URL}/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_2_1`);

      // コース一覧を取得
      const courseElements = await page.$$(".courseListing li a");

      for (const el of courseElements) {
        const text = await el.textContent();
        if (!text) continue;

        // コース名から情報をパース
        // 例: "2024前期 月1 データ構造とアルゴリズム（田中太郎）"
        const parsed = parseCourseTitle(text.trim());
        if (parsed) courses.push(parsed);
      }
    } finally {
      await browser.close();
    }

    return { success: true, data: courses };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * 休講・補講通知をスクレイピング
 */
export async function scrapeNotices(
  username: string,
  password: string
): Promise<ScrapeResult<ScrapedNotice[]>> {
  try {
    const { browser, page } = await getLmsPage(username, password);

    const notices: ScrapedNotice[] = [];

    try {
      // お知らせページへ移動
      await page.goto(`${LMS_BASE_URL}/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1`);

      // お知らせ一覧を取得
      const noticeItems = await page.$$(".announcementInfo");

      for (const item of noticeItems) {
        const titleEl = await item.$("h3 a");
        const contentEl = await item.$(".details");
        const dateEl = await item.$(".announcementDate");

        const title = (await titleEl?.textContent()) ?? "";
        const content = (await contentEl?.textContent()) ?? "";
        const dateText = (await dateEl?.textContent()) ?? "";
        const href = (await titleEl?.getAttribute("href")) ?? "";

        // IDをURLから抽出
        const idMatch = href.match(/announcement_id=([^&]+)/);
        const lmsId = idMatch ? idMatch[1] : `notice-${Date.now()}`;

        const noticeType = detectNoticeType(title + content);
        const date = parseDateText(dateText);

        notices.push({
          lmsId,
          type: noticeType,
          title: title.trim(),
          content: content.trim(),
          date: date ?? undefined,
        });
      }
    } finally {
      await browser.close();
    }

    return { success: true, data: notices };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * スクレイピング結果をDBに同期する
 */
export async function syncToDatabase(
  courses: ScrapedCourse[],
  notices: ScrapedNotice[]
): Promise<{ synced: number; errors: string[] }> {
  let synced = 0;
  const errors: string[] = [];

  // コースを同期
  for (const course of courses) {
    try {
      await prisma.course.upsert({
        where: { courseCode: course.courseCode },
        update: {
          name: course.name,
          instructor: course.instructor,
          dayOfWeek: course.dayOfWeek,
          period: course.period,
          room: course.room,
        },
        create: {
          courseCode: course.courseCode,
          name: course.name,
          instructor: course.instructor,
          credits: 2,
          dayOfWeek: course.dayOfWeek,
          period: course.period,
          room: course.room,
          semester: course.semester,
        },
      });

      const currentYear = new Date().getFullYear();
      const semester = course.semester?.includes("後") ? "後期" : "前期";

      await prisma.enrollment.upsert({
        where: {
          courseId_academicYear_semester: {
            courseId: (
              await prisma.course.findUnique({ where: { courseCode: course.courseCode } })
            )!.id,
            academicYear: currentYear,
            semester,
          },
        },
        update: {},
        create: {
          course: { connect: { courseCode: course.courseCode } },
          academicYear: currentYear,
          semester,
        },
      });

      synced++;
    } catch (e) {
      errors.push(`コース「${course.name}」の同期エラー: ${(e as Error).message}`);
    }
  }

  // 通知を同期
  for (const notice of notices) {
    try {
      // 対応するコースを検索
      let courseId: string | undefined;
      if (notice.courseCode) {
        const course = await prisma.course.findUnique({
          where: { courseCode: notice.courseCode },
        });
        courseId = course?.id;
      }

      await prisma.notice.upsert({
        where: { lmsId: notice.lmsId },
        update: {
          title: notice.title,
          content: notice.content,
          date: notice.date,
        },
        create: {
          lmsId: notice.lmsId,
          type: notice.type,
          title: notice.title,
          content: notice.content,
          date: notice.date,
          period: notice.period,
          courseId: courseId,
        },
      });
      synced++;
    } catch (e) {
      errors.push(`通知「${notice.title}」の同期エラー: ${(e as Error).message}`);
    }
  }

  // 最終同期時刻を更新
  await prisma.lmsCredential.updateMany({
    data: { lastSync: new Date() },
  });

  return { synced, errors };
}

// ========== ヘルパー関数 ==========

function parseCourseTitle(title: string): ScrapedCourse | null {
  // 例: "2024前期 月1 データ構造とアルゴリズム 田中太郎"
  // 例: "データ構造とアルゴリズム_田中太郎_24前期月1"
  const dayMap: Record<string, number> = {
    月: 0, 火: 1, 水: 2, 木: 3, 金: 4,
  };

  // パターン1: "YYYY前後期 曜日限 科目名 教員名"
  const match = title.match(/(\d{4})(前期|後期|前後期|通年)?\s*([月火水木金])?(\d)?限?\s+(.+?)\s+(.+)/);
  if (match) {
    const [, yearStr, semester, dayChar, periodStr, name, instructor] = match;
    return {
      courseCode: `${yearStr}-${name.slice(0, 10)}-${instructor.slice(0, 5)}`.replace(/\s/g, ""),
      name: name.trim(),
      instructor: instructor.trim(),
      semester: semester || "前期",
      dayOfWeek: dayChar ? dayMap[dayChar] : undefined,
      period: periodStr ? parseInt(periodStr) - 1 : undefined,
    };
  }

  // パターン2: シンプルな科目名のみ
  return {
    courseCode: `UNKNOWN-${title.slice(0, 20).replace(/\s/g, "")}`,
    name: title.trim(),
    instructor: "不明",
  };
}

function detectNoticeType(text: string): string {
  if (text.includes("休講") || text.includes("休み")) return "CANCELLATION";
  if (text.includes("補講")) return "MAKEUP";
  if (text.includes("教室変更") || text.includes("部屋変更")) return "ROOM_CHANGE";
  return "ANNOUNCEMENT";
}

function parseDateText(text: string): Date | null {
  // 例: "2024/04/15" or "2024年4月15日"
  const match = text.match(/(\d{4})[\/年](\d{1,2})[\/月](\d{1,2})/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }
  return null;
}
