import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDemoData } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  await seedDemoData();

  const { searchParams } = new URL(request.url);
  const enrolled = searchParams.get("enrolled") === "true";
  const search = searchParams.get("search") || "";

  try {
    const courses = await prisma.course.findMany({
      where: {
        ...(enrolled ? { enrollments: { some: {} } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { instructor: { contains: search } },
                { courseCode: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        enrollments: true,
        _count: { select: { reviews: true } },
        reviews: {
          select: { rating: true },
        },
        notices: {
          where: {
            type: "CANCELLATION",
            date: { gte: new Date() },
          },
          take: 1,
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    });

    const coursesWithAvg = courses.map((course) => {
      const avgRating =
        course.reviews.length > 0
          ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
          : null;

      return {
        ...course,
        reviews: undefined,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: course._count.reviews,
        hasCancellation: course.notices.length > 0,
      };
    });

    return NextResponse.json(coursesWithAvg);
  } catch (error) {
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}
