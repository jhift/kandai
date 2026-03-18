import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: true,
        notices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
        reviews: {
          select: { rating: true, difficulty: true, workload: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "授業が見つかりません" }, { status: 404 });
    }

    const reviews = course.reviews;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;
    const avgDifficulty =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.difficulty, 0) / reviews.length
        : null;
    const avgWorkload =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.workload, 0) / reviews.length
        : null;

    return NextResponse.json({
      ...course,
      reviews: undefined,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      avgDifficulty: avgDifficulty ? Math.round(avgDifficulty * 10) / 10 : null,
      avgWorkload: avgWorkload ? Math.round(avgWorkload * 10) / 10 : null,
      reviewCount: course._count.reviews,
    });
  } catch (error) {
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}
