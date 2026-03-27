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

  if (!body.status || !["confirmed", "cancelled"].includes(body.status)) {
    return NextResponse.json(
      { error: "Status must be 'confirmed' or 'cancelled'" },
      { status: 400 }
    );
  }

  const existing = await prisma.booking.findFirst({
    where: { id, providerId: provider.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: body.status },
    include: { service: true },
  });

  return NextResponse.json(updated);
}
