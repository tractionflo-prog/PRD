import { getPublicOpportunitiesFeedDebug } from "@/lib/opportunities/feed-service";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const debug = await getPublicOpportunitiesFeedDebug();
  return NextResponse.json({
    providers: debug.providers,
    sampleItems: debug.sampleItems,
  });
}
