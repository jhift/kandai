/**
 * デモ用サンプルデータ
 * 実際のLMS連携前にUIを確認するためのダミーデータ
 */

import { prisma } from "./db";

export async function seedDemoData() {
  const count = await prisma.course.count();
  if (count > 0) return; // 既にデータがあれば何もしない

  const courses = [
    {
      courseCode: "CS301-2024",
      name: "データ構造とアルゴリズム",
      nameEn: "Data Structures and Algorithms",
      instructor: "田中 太郎",
      credits: 2,
      department: "総合情報学部",
      year: 3,
      semester: "前期",
      dayOfWeek: 0, // 月
      period: 0,    // 1限
      room: "I棟301",
      description: "基本的なデータ構造（配列、リスト、木、グラフ）とアルゴリズム（ソート、探索）について学ぶ。",
      objectives: "データ構造とアルゴリズムの基礎を理解し、問題解決に応用できるようになる。",
      evaluation: "期末試験(60%) + 課題(40%)",
      textbook: "アルゴリズムとデータ構造（第2版）",
    },
    {
      courseCode: "CS302-2024",
      name: "オペレーティングシステム",
      nameEn: "Operating Systems",
      instructor: "山田 花子",
      credits: 2,
      department: "総合情報学部",
      year: 3,
      semester: "前期",
      dayOfWeek: 1, // 火
      period: 1,    // 2限
      room: "I棟201",
      description: "OSの基本概念、プロセス管理、メモリ管理、ファイルシステムについて学ぶ。",
      objectives: "現代のOSの仕組みを理解し、システムプログラミングの基礎を習得する。",
      evaluation: "期末試験(70%) + レポート(30%)",
    },
    {
      courseCode: "CS303-2024",
      name: "コンピュータネットワーク",
      nameEn: "Computer Networks",
      instructor: "佐藤 次郎",
      credits: 2,
      department: "総合情報学部",
      year: 3,
      semester: "前期",
      dayOfWeek: 2, // 水
      period: 2,    // 3限
      room: "I棟401",
      description: "TCP/IP、HTTP、DNS等のプロトコルとネットワークアーキテクチャを学ぶ。",
      objectives: "インターネットの仕組みを理解し、ネットワークアプリケーションの設計ができるようになる。",
      evaluation: "期末試験(50%) + 実験レポート(50%)",
    },
    {
      courseCode: "CS304-2024",
      name: "ソフトウェア工学",
      nameEn: "Software Engineering",
      instructor: "鈴木 三郎",
      credits: 2,
      department: "総合情報学部",
      year: 3,
      semester: "前期",
      dayOfWeek: 3, // 木
      period: 3,    // 4限
      room: "I棟102",
      description: "ソフトウェア開発プロセス、設計手法、テスト、保守について学ぶ。",
      objectives: "チームでの大規模ソフトウェア開発に必要な知識とスキルを習得する。",
      evaluation: "グループプロジェクト(60%) + 個人課題(40%)",
    },
    {
      courseCode: "MA301-2024",
      name: "線形代数学",
      nameEn: "Linear Algebra",
      instructor: "高橋 四郎",
      credits: 2,
      department: "総合情報学部",
      year: 3,
      semester: "前期",
      dayOfWeek: 4, // 金
      period: 1,    // 2限
      room: "100番教室",
      description: "行列、行列式、固有値・固有ベクトル、線形変換について学ぶ。",
      objectives: "機械学習や画像処理に必要な線形代数の基礎を習得する。",
      evaluation: "期末試験(80%) + 小テスト(20%)",
    },
    {
      courseCode: "CS305-2024",
      name: "機械学習入門",
      nameEn: "Introduction to Machine Learning",
      instructor: "伊藤 五郎",
      credits: 2,
      department: "総合情報学部",
      year: 3,
      semester: "前期",
      dayOfWeek: 0, // 月
      period: 2,    // 3限
      room: "I棟演習室A",
      description: "機械学習の基礎的なアルゴリズム（回帰、分類、クラスタリング）を学ぶ。",
      objectives: "Pythonを使って基本的な機械学習モデルを実装できるようになる。",
      evaluation: "最終プロジェクト(50%) + 課題(50%)",
    },
  ];

  for (const course of courses) {
    await prisma.course.create({ data: course });
  }

  // 全コースを履修中として登録
  const createdCourses = await prisma.course.findMany();
  for (const course of createdCourses) {
    await prisma.enrollment.create({
      data: {
        courseId: course.id,
        academicYear: 2024,
        semester: "前期",
      },
    });
  }

  // サンプルレビュー
  const cs301 = await prisma.course.findUnique({ where: { courseCode: "CS301-2024" } });
  const cs302 = await prisma.course.findUnique({ where: { courseCode: "CS302-2024" } });

  if (cs301) {
    await prisma.review.createMany({
      data: [
        {
          courseId: cs301.id,
          rating: 5,
          difficulty: 4,
          workload: 3,
          comment: "先生の説明がわかりやすく、実際のコーディング課題が多くて実践的でした。アルゴリズムの考え方がしっかり身につきます。",
          academicYear: 2023,
          semester: "前期",
          nickname: "情報3年生",
        },
        {
          courseId: cs301.id,
          rating: 4,
          difficulty: 4,
          workload: 4,
          comment: "難しいけど面白い科目。毎週課題があるのでしんどいけど、力がつく。試験は過去問をやっておくといい。",
          academicYear: 2023,
          semester: "前期",
          nickname: "たろう",
        },
        {
          courseId: cs301.id,
          rating: 3,
          difficulty: 5,
          workload: 4,
          comment: "内容は充実しているが、授業のペースが速い。予習必須。",
          academicYear: 2022,
          semester: "前期",
        },
      ],
    });
  }

  if (cs302) {
    await prisma.review.createMany({
      data: [
        {
          courseId: cs302.id,
          rating: 4,
          difficulty: 3,
          workload: 2,
          comment: "OS入門として良い科目。プロセス管理とメモリ管理の説明が特に丁寧。",
          academicYear: 2023,
          semester: "前期",
          nickname: "CS学生",
        },
      ],
    });
  }

  // サンプル通知
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  if (cs301) {
    await prisma.notice.create({
      data: {
        courseId: cs301.id,
        type: "CANCELLATION",
        title: "【休講】データ構造とアルゴリズム 4/22(月)1限",
        content: "4月22日（月）1限のデータ構造とアルゴリズムは、担当教員の出張のため休講となります。補講については後日連絡します。",
        date: nextWeek,
        period: 1,
        lmsId: "demo-notice-001",
      },
    });
  }

  await prisma.notice.create({
    data: {
      type: "ANNOUNCEMENT",
      title: "【お知らせ】GW期間中の授業について",
      content: "ゴールデンウィーク期間（4/29〜5/6）は授業が休みとなります。詳細は各科目のシラバスをご確認ください。",
      lmsId: "demo-notice-002",
    },
  });

  console.log("デモデータを挿入しました");
}
