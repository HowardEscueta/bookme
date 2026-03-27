import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const provider = await getSession();
  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const bookings = await prisma.booking.findMany({
    where: {
      providerId: provider.id,
      ...(status && { status }),
    },
    include: { service: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json(bookings);
}
