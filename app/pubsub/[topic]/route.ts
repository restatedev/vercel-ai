import { sse } from "@/restate/pubsub_client";
import { NextRequest } from "next/server";

const INGRESS_URL = process.env.INGRESS_URL || "http://localhost:8080";
const RESTATE_API_KEY = process.env.RESTATE_API_KEY;

export async function GET(request: NextRequest, { params }: any) {
  const topic = (await params).topic;
  const searchParams = request.nextUrl.searchParams;
  const offsetQuery = Number(searchParams.get("offset") || 0);
  const offset = isNaN(offsetQuery) ? 0 : offsetQuery;

  const headers = RESTATE_API_KEY
    ? { "Authorization": `Bearer ${RESTATE_API_KEY}` } : undefined;

  const stream = sse({
    ingressUrl: INGRESS_URL,
    topic,
    offset,
    pullInterval: 1000,
    signal: request.signal,
    headers
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
