import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // แก้เป็น @

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { supportPalId, phpVersion, spVersion, dbVersion, nginxVersion, note } = body;

    // ดึงชื่อคนทำรายการ
    const actionBy = session.user.name || session.user.email || "Unknown";

    const newLog = await prisma.supportPalLog.create({
      data: {
        supportPalId,
        phpVersion,
        spVersion,
        dbVersion,
        nginxVersion,
        note: note || "",
        actionBy,
        checkDate: new Date(),
      },
    });

    return NextResponse.json(newLog);
  } catch (error) {
    console.error("❌ API Error (POST /sp/maintenance):", error); // เพิ่ม Log
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}