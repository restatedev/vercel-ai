import * as clients from "@restatedev/restate-sdk-clients";
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as mathjs from "mathjs";
import { publishMessage } from "./pubsub_client";
import { Tool } from "./services/multi_tool";

export async function callToolViaRestate(
  message: string,
  opts: {
    ingressUrl: string;
    topic: string;
    headers?: Record<string, string>;
  }
) {
  const ingress = clients.connect({
    url: opts.ingressUrl,
    headers: opts.headers,
  });

  ingress
    .serviceSendClient<Tool>({ name: "tools" })
    .message({ prompt: message, topic: opts.topic });
}

export async function callToolDirectly(
  message: string,
  opts: {
    ingressUrl: string;
    topic: string;
    headers?: Record<string, string>;
  }
) {
  const result = streamText({
    model: openai("gpt-4o-2024-08-06", { structuredOutputs: true }),
    tools: {
      calculate: tool({
        description:
          "A tool for evaluating mathematical expressions. " +
          "Example expressions: " +
          "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
        parameters: z.object({ expression: z.string() }),
        execute: async ({ expression }) => {
          return mathjs.evaluate(expression);
        },
      }),
    },
    maxSteps: 10,
    maxRetries: 0,
    system:
      "You are solving math problems. " +
      "Reason step by step. " +
      "Use the calculator when necessary. " +
      "When you give the final answer, " +
      "provide an explanation for how you arrived at it.",
    prompt: message,
    onChunk(data) {
      if (data.chunk.type === "text-delta") {
        publishMessage(
          { role: "system", content: data.chunk.textDelta },
          {
            ingressUrl: opts.ingressUrl,
            topic: opts.topic,
            headers: opts.headers,
          }
        );
      }
    },
  });

  const reader = result.fullStream.getReader();

  try {
    while (true) {
      const { done } = await reader.read();
      if (done) {
        break;
      }
    }
  } catch (err) {
    console.error("Error reading stream:", err);
  } finally {
    reader.releaseLock();
  }
}
