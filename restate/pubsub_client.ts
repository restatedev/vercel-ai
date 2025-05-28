import * as clients from "@restatedev/restate-sdk-clients";
import type { PubSub } from "./services/pubsub";

export type PullOptions = {
  ingressUrl: string;
  topic: string;
  headers?: Record<string, string>;
  ac?: AbortController;
  offset?: number;
  pullInterval?: number;
}

export function sseStream(opts: PullOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const content = pullMessages(opts);
      for await (const message of content) {
        const chunk = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        if (opts.ac?.signal.aborted) {
          break;
        }
      }
      controller.close();
    },
  });
}

export async function* pullMessages(
  opts: PullOptions
): AsyncGenerator<Uint8Array> {
  const ingress = clients.connect({
    url: opts.ingressUrl,
    headers: opts.headers,
  });
  let lastOffset = opts.offset ?? 0;
  while (true) {
    if (opts.ac?.signal.aborted) {
      return;
    }
    const { messages, nextOffset } = await ingress
      .objectClient<PubSub>({ name: "pubsub" }, opts.topic)
      .pull({ offset: lastOffset });

    for (const message of messages) {
      yield message;
    }
    lastOffset = nextOffset;
    if (opts.pullInterval) {
      await new Promise((resolve) => setTimeout(resolve, opts.pullInterval));
    }
  }
}
