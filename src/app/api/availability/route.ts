import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const provider = await getSession();
  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const availability = await prisma.availability.findMany({
    where: { providerId: provider.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json(availability);
}

export async function PUT(req: NextRequest) {
  const provider = await getSession();
  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { schedule } = body;

  if (!Array.isArray(schedule)) {
    return NextResponse.json(
      { error: "Schedule must be an array" },
      { status: 400 }
    );
  }

  // Delete all existing availability for this provider
  await prisma.availability.deleteMany({
    where: { providerId: provider.id },
  });

  // Create new availability entries
  const entries = [];
  for (const slot of schedule) {
    if (slot.startTime && slot.endTime) {
      entries.push(
        prisma.availability.create({
          data: {
            providerId: provider.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        })
      );
    }
  }

  const availability = await Promise.all(entries);

  return NextResponse.json(availability);
}
