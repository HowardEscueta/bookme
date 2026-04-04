import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json();
  const { serviceId, date, time, clientName, clientPhone } = body;

  if (!serviceId || !date || !time || !clientName || !clientPhone) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const provider = await prisma.provider.findUnique({
    where: { slug },
    include: { availability: true },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, providerId: provider.id, isActive: true },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Validate availability
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const schedule = provider.availability.find((a) => a.dayOfWeek === dayOfWeek);
  if (!schedule) {
    return NextResponse.json({ error: "Provider not available on this day" }, { status: 400 });
  }

  const [slotH, slotM] = time.split(":").map(Number);
  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);
  const slotMinutes = slotH * 60 + slotM;
  if (
    slotMinutes < startH * 60 + startM ||
    slotMinutes + service.duration > endH * 60 + endM
  ) {
    return NextResponse.json({ error: "Time slot is outside business hours" }, { status: 400 });
  }

  // Check for conflicts
  const existing = await prisma.booking.findMany({
    where: { providerId: provider.id, date, status: { not: "cancelled" } },
    include: { service: true },
  });

  const hasConflict = existing.some((b) => {
    const [bH, bM] = b.time.split(":").map(Number);
    const bStart = bH * 60 + bM;
    const bEnd = bStart + b.service.duration;
    const sEnd = slotMinutes + service.duration;
    return slotMinutes < bEnd && sEnd > bStart;
  });

  if (hasConflict) {
    return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
  }

  // Create a pending booking
  const booking = await prisma.booking.create({
    data: {
      providerId: provider.id,
      serviceId,
      date,
      time,
      clientName,
      clientPhone,
      status: "pending",
      paymentStatus: "unpaid",
    },
  });

  // If service is free, confirm immediately
  if (service.price === 0) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "confirmed", paymentStatus: "paid" },
    });
    return NextResponse.json({
      free: true,
      id: booking.id,
      service: service.name,
      date,
      time,
    });
  }

  // Create PayMongo checkout session
  if (!PAYMONGO_SECRET) {
    // No PayMongo configured — confirm directly (dev mode)
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "confirmed", paymentStatus: "paid" },
    });
    return NextResponse.json({
      free: true,
      id: booking.id,
      service: service.name,
      date,
      time,
    });
  }

  const successUrl = `${APP_URL}/booking/success?id=${booking.id}`;
  const cancelUrl = `${APP_URL}/${slug}`;

  const pmRes = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET + ":").toString("base64")}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: { name: clientName, phone: clientPhone },
          line_items: [
            {
              amount: service.price * 100, // centavos
              currency: "PHP",
              name: service.name,
              quantity: 1,
            },
          ],
          payment_method_types: ["gcash", "paymaya", "card"],
          success_url: successUrl,
          cancel_url: cancelUrl,
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          metadata: { booking_id: booking.id },
        },
      },
    }),
  });

  if (!pmRes.ok) {
    const err = await pmRes.json().catch(() => ({}));
    // Rollback pending booking on PayMongo failure
    await prisma.booking.delete({ where: { id: booking.id } });
    return NextResponse.json(
      { error: "Payment setup failed. Try again." },
      { status: 502 }
    );
  }

  const pmData = await pmRes.json();
  const checkoutUrl = pmData.data.attributes.checkout_url;
  const sessionId = pmData.data.id;

  // Save PayMongo session ID to booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: { paymentRef: sessionId },
  });

  return NextResponse.json({ checkout_url: checkoutUrl, id: booking.id });
}
