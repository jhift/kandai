import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const credential = await prisma.lmsCredential.findUnique({
      where: { id: "default" },
      select: {
        username: true,
        lastSync: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      hasCredential: !!credential,
      username: credential?.username || null,
      lastSync: credential?.lastSync || null,
    });
  } catch (error) {
    return NextResponse.json({ error: "設定の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "IDとパスワードを入力してください" },
        { status: 400 }
      );
    }

    await prisma.lmsCredential.upsert({
      where: { id: "default" },
      update: { username, password, updatedAt: new Date() },
      create: { id: "default", username, password },
    });

    return NextResponse.json({ success: true, message: "認証情報を保存しました" });
  } catch (error) {
    return NextResponse.json({ error: "設定の保存に失敗しました" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.lmsCredential.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
