import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { hashSync } from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name, businessName, slug } = body;

  if (!email || !password || !name || !businessName || !slug) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  if (slug.length < 3 || !slugRegex.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be at least 3 characters, lowercase letters, numbers, and hyphens only" },
      { status: 400 }
    );
  }

  try {
    // Check if email or slug already taken
    const existing = await prisma.provider.findFirst({
      where: { OR: [{ email }, { slug }] },
    });

    if (existing) {
      const field = existing.email === email ? "Email" : "Slug";
      return NextResponse.json(
        { error: `${field} is already taken` },
        { status: 409 }
      );
    }

    const provider = await prisma.provider.create({
      data: {
        email,
        passwordHash: hashSync(password, 10),
        name,
        businessName,
        slug,
      },
    });

    await createSession(provider.id);

    return NextResponse.json({ id: provider.id, slug: provider.slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
