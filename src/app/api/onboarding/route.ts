import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { CATEGORY_PRESETS } from "@/lib/category-presets";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { category } = await req.json();
  const preset = CATEGORY_PRESETS[category];
  if (!preset) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  await prisma.provider.update({
    where: { id: session.id },
    data: { category },
  });

  if (preset.services.length > 0) {
    // Replace any existing services with the preset ones
    await prisma.service.deleteMany({ where: { providerId: session.id } });
    await prisma.service.createMany({
      data: preset.services.map((s, i) => ({
        providerId: session.id,
        name: s.name,
        duration: s.duration,
        price: s.price,
        sortOrder: i,
      })),
    });
  }

  if (preset.hours.length > 0) {
    // Replace availability with preset hours
    await prisma.availability.deleteMany({ where: { providerId: session.id } });
    await prisma.availability.createMany({
      data: preset.hours.map((h) => ({
        providerId: session.id,
        dayOfWeek: h.day,
        startTime: h.start,
        endTime: h.end,
      })),
    });
  }

  return NextResponse.json({ ok: true });
}
