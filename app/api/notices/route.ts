import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const type = searchParams.get("type");

  try {
    const notices = await prisma.notice.findMany({
      where: {
        ...(unreadOnly ? { isRead: false } : {}),
        ...(type ? { type } : {}),
      },
      include: {
        course: {
          select: { id: true, name: true, dayOfWeek: true, period: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notices);
  } catch (error) {
    return NextResponse.json({ error: "通知の取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, isRead } = body;

    if (ids && Array.isArray(ids)) {
      await prisma.notice.updateMany({
        where: { id: { in: ids } },
        data: { isRead },
      });
    } else {
      await prisma.notice.updateMany({ data: { isRead: true } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
