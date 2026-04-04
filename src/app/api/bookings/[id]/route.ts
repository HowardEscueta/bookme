import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: { select: { name: true, duration: true, price: true } },
      provider: { select: { businessName: true, slug: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: booking.id,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    clientName: booking.clientName,
    date: booking.date,
    time: booking.time,
    service: booking.service,
    provider: booking.provider,
  });
}

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
