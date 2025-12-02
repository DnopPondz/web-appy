import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) return NextResponse.json({ status: "error" });

  try {
    // ตั้งเวลา Timeout เป็น 10 วินาที (เผื่อเว็บโหลดช้า)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, { 
        method: "GET", // ✅ ข้อ 1: เปลี่ยนจาก HEAD เป็น GET (ยอมโหลดหน้าเว็บจริง เพื่อให้ผ่าน Firewall บางตัว)
        signal: controller.signal,
        headers: {
            // ปลอมตัวเป็น Browser เพื่อไม่ให้โดนบล็อกว่าเป็น Bot
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
    });
    clearTimeout(timeoutId);

    // ✅ ข้อ 3: ยอมรับ Status 403 (Forbidden) และ 503 (Service Unavailable)
    // เพราะแปลว่า Server ปลายทางยังตอบสนองอยู่ (แค่ไม่ให้เราเข้า) ถือว่าเว็บยังไม่ล่ม (UP)
    if (res.ok || res.status === 403 || res.status === 503) {
      return NextResponse.json({ status: "up", code: res.status });
    } else {
      console.log(`❌ [DOWN] ${url} - Status: ${res.status}`);
      return NextResponse.json({ status: "down", code: res.status });
    }
  } catch (error) {
    console.error(`❌ [ERROR] ${url} - Reason: ${error.message}`);
    return NextResponse.json({ status: "down", error: error.message });
  }
}