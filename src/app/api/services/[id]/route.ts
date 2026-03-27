import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const provider = await getSession();
  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Verify service belongs to this provider
  const existing = await prisma.service.findFirst({
    where: { id, providerId: provider.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.duration !== undefined && { duration: Number(body.duration) }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const provider = await getSession();
  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.service.findFirst({
    where: { id, providerId: provider.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  await prisma.service.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
