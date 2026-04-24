import { findLeadsForProduct } from "@/lib/find-users-engine";
import { getFallbackLeads } from "@/lib/find-users-fallback";
import { NextResponse } from "next/server";

const MAX_LEN = 2000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { product } = body as { product?: unknown };
  if (typeof product !== "string" || !product.trim()) {
    return NextResponse.json(
      { error: "Describe what you built so we can find matches." },
      { status: 400 },
    );
  }

  const trimmed = product.trim().slice(0, MAX_LEN);

  try {
    const data = await findLeadsForProduct(trimmed);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[find-users]", err);
    return NextResponse.json(getFallbackLeads(trimmed));
  }
}
