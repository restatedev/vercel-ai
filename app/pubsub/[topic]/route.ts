import { sseStream } from "@/restate/pubsub_client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: any) {
  const topic = (await params).topic;
  const searchParams = request.nextUrl.searchParams;
  const offsetQuery = Number(searchParams.get("offset") || 0);
  const offset = isNaN(offsetQuery) ? 0 : offsetQuery;
  const stream = sseStream({
    ingressUrl: process.env.INGRESS_URL || "http://localhost:8080",
    topic,
    offset
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
