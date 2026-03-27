import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const provider = await getSession();

  if (!provider) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    id: provider.id,
    email: provider.email,
    name: provider.name,
    businessName: provider.businessName,
    slug: provider.slug,
    bio: provider.bio,
  });
}
