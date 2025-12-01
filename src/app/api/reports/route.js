import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. WP: ดึงมา 2 Logs ล่าสุดเพื่อเทียบเวอร์ชัน
    const wpSites = await prisma.website.findMany({
      include: {
        logs: { orderBy: { checkDate: "desc" }, take: 2 }, // 🔥 แก้เป็น 2
      },
      orderBy: { name: 'asc' }
    });

    // 2. SP: ดึงมา 2 Logs ล่าสุดเช่นกัน
    const spSites = await prisma.supportPal.findMany({
      include: {
        logs: { orderBy: { checkDate: "desc" }, take: 2 }, // 🔥 แก้เป็น 2
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ wpSites, spSites });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
  }
}