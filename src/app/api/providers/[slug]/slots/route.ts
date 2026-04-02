import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("service");

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: "date and service query params are required" },
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

  // Get the day of week for the requested date
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const schedule = provider.availability.find(
    (a) => a.dayOfWeek === dayOfWeek
  );

  if (!schedule) {
    return NextResponse.json({ slots: [] });
  }

  // Get existing bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      providerId: provider.id,
      date,
      status: { not: "cancelled" },
    },
    include: { service: true },
  });

  // Generate available time slots
  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const slots: { time: string; booked: boolean }[] = [];

  for (let m = startMinutes; m + service.duration <= endMinutes; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

    const isBooked = existingBookings.some((booking) => {
      const [bH, bM] = booking.time.split(":").map(Number);
      const bookingStart = bH * 60 + bM;
      const bookingEnd = bookingStart + booking.service.duration;
      const slotStart = m;
      const slotEnd = m + service.duration;
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });

    slots.push({ time: timeStr, booked: isBooked });
  }

  return NextResponse.json({ slots });
}
