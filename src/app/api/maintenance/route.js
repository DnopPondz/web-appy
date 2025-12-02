import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { websiteId, phpVersion, wordpressVersion, dbVersion, plugins, theme, note } = body;

    // 🔥 บันทึก actionBy จาก session.user.name หรือ email
    const actionBy = session.user.name || session.user.email || "Unknown";

    const newLog = await prisma.maintenanceLog.create({
      data: {
        websiteId,
        phpVersion,
        wordpressVersion,
        dbVersion,
        plugins,
        theme,
        note: note || "",
        actionBy, // ✅ Save User
        checkDate: new Date(),
      },
    });

    return NextResponse.json(newLog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}