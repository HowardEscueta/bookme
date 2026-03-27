import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { compareSync } from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const provider = await prisma.provider.findUnique({ where: { email } });

  if (!provider || !compareSync(password, provider.passwordHash)) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  await createSession(provider.id);

  return NextResponse.json({ id: provider.id, slug: provider.slug });
}
