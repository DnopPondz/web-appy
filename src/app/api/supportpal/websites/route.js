import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
// เปลี่ยนมาใช้ @ (Alias) เพื่อความชัวร์ในการระบุตำแหน่งไฟล์
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function GET() {
  try {
    await checkAuth();
    
    const sites = await prisma.supportPal.findMany({
      include: {
        logs: { orderBy: { checkDate: "desc" }, take: 1 },
      },
      orderBy: [{ server: 'asc' }, { createdAt: 'desc' }]
    });
    
    return NextResponse.json(sites);
  } catch (error) {
    // 🔥 เพิ่ม console.error เพื่อให้เห็นปัญหาจริงใน Terminal
    console.error("❌ API Error (GET /sp/websites):", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await checkAuth();
    const body = await req.json();
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
            checkDate: new Date(0)
          }
        }
      },
    });
    return NextResponse.json(newSite);
  } catch (error) {
    console.error("❌ API Error (POST /sp/websites):", error);
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await checkAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.supportPal.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("❌ API Error (DELETE /sp/websites):", error);
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}