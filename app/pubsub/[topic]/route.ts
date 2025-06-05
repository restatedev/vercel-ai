import { sse, publishMessage } from "@/restate/pubsub_client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: any) {
  const topic = (await params).topic;
  const searchParams = request.nextUrl.searchParams;
  const offsetQuery = Number(searchParams.get("offset") || 0);
  const offset = isNaN(offsetQuery) ? 0 : offsetQuery;
  const stream = sse({
    ingressUrl: process.env.INGRESS_URL || "http://localhost:8080",
    topic,
    offset,
    pullInterval: 1000,
    signal: request.signal,
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ topic: string }> }
) {
  const { topic } = await params;
  const { message } = await request.json();

  await publishMessage(
    { role: "user", content: message },
    {
      ingressUrl: process.env.INGRESS_URL || "http://localhost:8080",
      topic,
    }
  );
  return Response.json({ ok: true });
}
