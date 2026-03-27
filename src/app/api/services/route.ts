import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const provider = await getSession();
  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    where: { providerId: provider.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const provider = await getSession();
  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { name, duration, price } = body;

  if (!name || !duration || price == null) {
    return NextResponse.json(
      { error: "Name, duration, and price are required" },
      { status: 400 }
    );
  }

  // Get the next sort order
  const lastService = await prisma.service.findFirst({
    where: { providerId: provider.id },
    orderBy: { sortOrder: "desc" },
  });

  const service = await prisma.service.create({
    data: {
      providerId: provider.id,
      name,
      duration: Number(duration),
      price: Number(price),
      sortOrder: (lastService?.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
