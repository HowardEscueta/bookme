import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const provider = await getSession();
  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, string> = {};
  if (body.businessName !== undefined) data.businessName = body.businessName;
  if (body.bio !== undefined) data.bio = body.bio;

  const updated = await prisma.provider.update({
    where: { id: provider.id },
    data,
    select: { businessName: true, bio: true },
  });

  return NextResponse.json(updated);
}
