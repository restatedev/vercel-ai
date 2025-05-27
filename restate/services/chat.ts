import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";
import { middleware, superJson,  } from "../ai_infra";

import { z } from "zod";

import { openai } from "@ai-sdk/openai";
import { CoreMessage, generateText, tool, wrapLanguageModel } from "ai";

interface ChatState {
  // The messages used throughout the chat session
  messages: CoreMessage[];
}

const handler = restate.handlers.object

export default restate.object({
  name: "chat",
  handlers: {
    message: handler.exclusive(
      {
        input: serde.zod(
          z.object({
            message: z.string(),
          })
        ),
        output: serde.zod(
          z.object({
            answer: z.string(),
          })
        ),
      },
      async (ctx: restate.ObjectContext<ChatState>, { message }) => {
        const model = wrapLanguageModel({
          model: openai("gpt-4o", { structuredOutputs: true }),
          middleware: middleware(ctx, { maxRetryAttempts: 3 }),
        });

        const messages = (await ctx.get("messages", superJson)) ?? [];

        messages.push({ role: "user", content: message } as CoreMessage);

        const res = await generateText({
          model,
          maxRetries: 0,
          system: "You are a helpful assistant.",
          messages,
        });

        ctx.set("messages", [...messages, ...res.response.messages], superJson);
        return { answer: res.text };
      }
    ),
  },
});
