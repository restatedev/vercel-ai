import * as clients from "@restatedev/restate-sdk-clients";
import type { PubSub } from "./services/pubsub";

export async function* pullMessages(opts: {
  ingressUrl: string;
  topic: string;
  headers?: Record<string, string>;
  ac?: AbortController;
  offset?: number;
  pullInterval?: number;
}) {
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
