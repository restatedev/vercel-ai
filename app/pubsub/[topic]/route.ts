import { sse, publishMessage } from "@/restate/pubsub_client";
import { callToolDirectly, callToolViaRestate } from "@/restate/tool_client";
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
  request: NextRequest,
  { params }: { params: Promise<{ topic: string }> }
) {
  const { topic } = await params;
  const { message } = await request.json();
  const searchParams = request.nextUrl.searchParams;
  const shouldStream = searchParams.get("stream") === "true";
  const ingressUrl = process.env.INGRESS_URL || "http://localhost:8080";

  if (shouldStream) {
    // call the calc tool directly
    await callToolDirectly(message, { topic, ingressUrl });
  } else {
    await callToolViaRestate(message, { topic, ingressUrl });
    // call the calc tool in durable execution
  }

  return Response.json({ ok: true });
}
