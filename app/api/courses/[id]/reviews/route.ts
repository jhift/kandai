import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { courseId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { courseId: id } }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "レビューの取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { rating, difficulty, workload, comment, academicYear, semester, nickname, isAnonymous } = body;

    // バリデーション
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "評価は1〜5で入力してください" }, { status: 400 });
    }
    if (!difficulty || difficulty < 1 || difficulty > 5) {
      return NextResponse.json({ error: "難易度は1〜5で入力してください" }, { status: 400 });
    }
    if (!workload || workload < 1 || workload > 5) {
      return NextResponse.json({ error: "課題量は1〜5で入力してください" }, { status: 400 });
    }
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: "コメントは10文字以上入力してください" }, { status: 400 });
    }
    if (!academicYear || !semester) {
      return NextResponse.json({ error: "受講年度と学期を入力してください" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ error: "授業が見つかりません" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        courseId: id,
        rating,
        difficulty,
        workload,
        comment: comment.trim(),
        academicYear: parseInt(academicYear),
        semester,
        nickname: isAnonymous ? null : nickname?.trim() || null,
        isAnonymous: isAnonymous ?? true,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "レビューの投稿に失敗しました" }, { status: 500 });
  }
}
