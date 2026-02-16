import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const doc = await prisma.document.findUnique({ where: { sharedToken: token } });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: doc.id,
    title: doc.title,
    pages: doc.pages,
    fromLanguage: doc.fromLanguage,
    toLanguage: doc.toLanguage,
  });
}
