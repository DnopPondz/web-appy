import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const websites = await prisma.website.findMany({
      include: {
        logs: {
          orderBy: { checkDate: "desc" },
          take: 1, 
        },
      },
      orderBy: [
        { server: 'asc' }, // เรียงตาม Server ก่อน
        { createdAt: 'desc' }
      ]
    });
    return NextResponse.json(websites);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    // รับค่า server มาด้วย
    const { name, url, server, wordpressVersion, phpVersion, dbVersion, plugins, theme, note } = body;

    const newWebsite = await prisma.website.create({
      data: {
        name,
        url,
        server: server || "Default Server", // 🔥 บันทึก Server
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
    return NextResponse.json({ error: "Failed to create website" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    await prisma.website.delete({ where: { id } });
    return NextResponse.json({ message: "Website deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete website" }, { status: 500 });
  }
}