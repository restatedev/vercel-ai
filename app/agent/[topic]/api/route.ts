import { NextRequest } from "next/server";
import * as clients from "@restatedev/restate-sdk-clients";
import { Tool } from "@/restate/services/multi_tool";

const INGRESS_URL = process.env.INGRESS_URL || "http://localhost:8080";
const RESTATE_API_KEY = process.env.RESTATE_API_KEY;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ topic: string }> }
) {
  const { topic } = await params;
  const { message } = await request.json();

  const headers = RESTATE_API_KEY
  ? { "Authorization": `Bearer ${RESTATE_API_KEY}` } : undefined;

  const ingress = clients.connect({
    url: INGRESS_URL,
    headers
  });

  await ingress
    .serviceSendClient<Tool>({ name: "tools" })
    .message({ prompt: message, topic });

  return Response.json({ ok: true });
}
