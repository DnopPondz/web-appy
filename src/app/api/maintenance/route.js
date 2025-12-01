import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    // รับค่า note มาด้วย
    const { websiteId, phpVersion, wordpressVersion, dbVersion, plugins, theme, note } = body;

    const newLog = await prisma.maintenanceLog.create({
      data: {
        websiteId,
        phpVersion,
        wordpressVersion,
        dbVersion,
        plugins, // ส่งมาเป็น JSON String แล้ว
        theme,
        note: note || "", // 🔥 บันทึก Note ของการ Maintenance รอบนี้
        checkDate: new Date(),
      },
    });

    return NextResponse.json(newLog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}