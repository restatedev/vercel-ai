import { sseStream } from "@/restate/pubsub_client";

export async function GET(request: Request, { params }: any) {
  const topic = (await params).topic;
  const stream = sseStream({
    ingressUrl: process.env.INGRESS_URL || "http://localhost:8080",
    topic,
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
