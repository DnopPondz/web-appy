import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ฟังก์ชันส่ง Line
async function sendLineNotify(message) {
  const token = process.env.LINE_NOTIFY_TOKEN; // ⚠️ อย่าลืมใส่ใน .env
  if (!token) return;

  await fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${token}`,
    },
    body: new URLSearchParams({ message }),
  });
}

export async function GET() {
  try {
    // 1. หา WP ที่ครบกำหนด (Maintenance Due)
    const wpSites = await prisma.website.findMany({
      include: { logs: { orderBy: { checkDate: "desc" }, take: 1 } }
    });

    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const dueWP = wpSites.filter(s => !s.logs[0] || new Date(s.logs[0].checkDate) < monday);

    // 2. ส่งแจ้งเตือนถ้ามีเว็บค้าง
    if (dueWP.length > 0) {
      let msg = `\n🚨 Maintenance Reminder (${new Date().toLocaleDateString('th-TH')})\n`;
      msg += `มี ${dueWP.length} เว็บไซต์ WordPress ที่ต้องดูแล:\n`;
      dueWP.forEach(s => msg += `- ${s.name}\n`);
      msg += `\nกรุณาตรวจสอบที่ Dashboard ด่วน!`;
      
      await sendLineNotify(msg);
      return NextResponse.json({ success: true, message: "Notification sent", count: dueWP.length });
    }

    return NextResponse.json({ success: true, message: "No maintenance due." });

  } catch (error) {
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}