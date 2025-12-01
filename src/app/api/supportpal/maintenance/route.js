import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { supportPalId, phpVersion, spVersion, dbVersion, nginxVersion, note } = body;

    const newLog = await prisma.supportPalLog.create({
      data: {
        supportPalId,
        phpVersion,
        spVersion,
        dbVersion,
        nginxVersion,
        note: note || "",
        checkDate: new Date(),
      },
    });

    return NextResponse.json(newLog);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}