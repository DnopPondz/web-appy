import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: ดึงข้อมูล
export async function GET() {
  try {
    const sites = await prisma.supportPal.findMany({
      include: {
        logs: { orderBy: { checkDate: "desc" }, take: 1 },
      },
      orderBy: [{ server: 'asc' }, { createdAt: 'desc' }]
    });
    return NextResponse.json(sites);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST: สร้างใหม่
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Receiving Payload:", body); // ดู Log ใน Terminal ว่าส่งอะไรมา

    const { name, url, server, phpVersion, spVersion, dbVersion, nginxVersion, note } = body;

    const newSite = await prisma.supportPal.create({
      data: {
        name,
        url,
        server: server || "Default Server",
        logs: {
          create: {
            phpVersion: phpVersion || "-",
            spVersion: spVersion || "-",
            dbVersion: dbVersion || "-",
            nginxVersion: nginxVersion || "-",
            note: note || "",
            checkDate: new Date(0) // วันที่เก่าเพื่อให้ขึ้นสีแดง
          }
        }
      },
    });

    return NextResponse.json(newSite);
  } catch (error) {
    console.error("POST Error:", error); // ถ้า Error จะโชว์ใน Terminal
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// DELETE: ลบ
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.supportPal.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}