import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const provider = await prisma.provider.findUnique({
    where: { slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      availability: {
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  if (!provider) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    slug: provider.slug,
    name: provider.name,
    businessName: provider.businessName,
    bio: provider.bio,
    services: provider.services.map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      price: s.price,
    })),
    availability: provider.availability.map((a) => ({
      day: a.dayOfWeek,
      start: a.startTime,
      end: a.endTime,
    })),
  });
}
