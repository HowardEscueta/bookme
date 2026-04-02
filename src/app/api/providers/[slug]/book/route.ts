import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBookingNotification } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json();
  const { serviceId, date, time, clientName, clientPhone } = body;

  if (!serviceId || !date || !time || !clientName || !clientPhone) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
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

  // Verify the day is available
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const schedule = provider.availability.find(
    (a) => a.dayOfWeek === dayOfWeek
  );

  if (!schedule) {
    return NextResponse.json(
      { error: "Provider is not available on this day" },
      { status: 400 }
    );
  }

  // Verify time slot is within business hours
  const [slotH, slotM] = time.split(":").map(Number);
  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);
  const slotMinutes = slotH * 60 + slotM;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (
    slotMinutes < startMinutes ||
    slotMinutes + service.duration > endMinutes
  ) {
    return NextResponse.json(
      { error: "Time slot is outside business hours" },
      { status: 400 }
    );
  }

  // Check for overlapping bookings
  const existingBookings = await prisma.booking.findMany({
    where: {
      providerId: provider.id,
      date,
      status: { not: "cancelled" },
    },
    include: { service: true },
  });

  const hasConflict = existingBookings.some((booking) => {
    const [bH, bM] = booking.time.split(":").map(Number);
    const bookingStart = bH * 60 + bM;
    const bookingEnd = bookingStart + booking.service.duration;
    const slotEnd = slotMinutes + service.duration;
    return slotMinutes < bookingEnd && slotEnd > bookingStart;
  });

  if (hasConflict) {
    return NextResponse.json(
      { error: "This time slot is no longer available" },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      providerId: provider.id,
      serviceId,
      date,
      time,
      clientName,
      clientPhone,
      status: "confirmed",
    },
    include: { service: true },
  });

  // Notify provider — fire and forget, don't block the response
  sendBookingNotification({
    providerEmail: provider.email,
    providerBusiness: provider.businessName,
    clientName,
    clientPhone,
    serviceName: service.name,
    date,
    time,
  });

  return NextResponse.json(
    {
      id: booking.id,
      service: booking.service.name,
      date: booking.date,
      time: booking.time,
      status: booking.status,
    },
    { status: 201 }
  );
}
