import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const eventType = body?.data?.attributes?.type;
  if (eventType !== "checkout_session.payment.paid") {
    return NextResponse.json({ ok: true });
  }

  const sessionData = body?.data?.attributes?.data;
  const bookingId = sessionData?.attributes?.metadata?.booking_id;

  if (!bookingId) {
    return NextResponse.json({ ok: true });
  }

  await prisma.booking.updateMany({
    where: { id: bookingId, status: "pending" },
    data: { status: "confirmed", paymentStatus: "paid" },
  });

  return NextResponse.json({ ok: true });
}
