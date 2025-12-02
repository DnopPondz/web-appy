import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
// ✅ แก้ตรงนี้: ใช้ @ เพื่อระบุตำแหน่งที่แน่นอน ไม่ต้องนับจุด
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function GET() {
  try {
    await checkAuth();
    const websites = await prisma.website.findMany({
      include: {
        logs: { orderBy: { checkDate: "desc" }, take: 1 },
      },
      orderBy: [{ server: 'asc' }, { createdAt: 'desc' }]
    });
    return NextResponse.json(websites);
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await checkAuth();
    const body = await req.json();
    const { name, url, server, wordpressVersion, phpVersion, dbVersion, plugins, theme, note } = body;

    const newWebsite = await prisma.website.create({
      data: {
        name,
        url,
        server: server || "Default Server",
        logs: {
          create: {
            wordpressVersion: wordpressVersion || "-",
            phpVersion: phpVersion || "-",
            dbVersion: dbVersion || "-",
            plugins: plugins || "-",
            theme: theme || "-",
            note: note || "",
            checkDate: new Date(0)
          }
        }
      },
    });
    return NextResponse.json(newWebsite);
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to create website" }, { status: 500 });
  }
}

// Method PUT สำหรับแก้ไขข้อมูล
export async function PUT(req) {
  try {
    await checkAuth();
    const body = await req.json();
    const { id, name, url, server } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updatedWebsite = await prisma.website.update({
      where: { id },
      data: {
        name,
        url,
        server: server || "Default Server",
      },
    });

    return NextResponse.json(updatedWebsite);
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to update website" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await checkAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    await prisma.website.delete({ where: { id } });
    return NextResponse.json({ message: "Website deleted" });
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to delete website" }, { status: 500 });
  }
}