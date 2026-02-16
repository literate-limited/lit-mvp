import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const meet = await prisma.meetSession.findUnique({
    where: { code },
    include: { document: { select: { id: true, title: true, sharedToken: true } } },
  });

  if (!meet) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: meet.id,
    code: meet.code,
    docId: meet.docId,
    sharedToken: meet.document?.sharedToken || null,
    expiresAt: meet.expiresAt,
    createdAt: meet.createdAt,
  });
}
