import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";
import { middleware, superJson,  } from "../ai_infra";

import { z } from "zod";

import { openai } from "@ai-sdk/openai";
import { generateText, tool, wrapLanguageModel } from "ai";
import { publishMessage } from "./pubsub";

import * as mathjs from 'mathjs';

export default restate.service({
  name: "tools",
  handlers: {
    message: restate.handlers.handler(
      {
        input: serde.zod(
          z.object({
            prompt: z.string(),
          })
        ),
        output: serde.zod(z.string()),
        description: "Use tools to solve math problems",
      },
      async (ctx: restate.Context, { prompt }) => {
        return await useToolsExample(ctx, prompt);
      }
    ),
  },
});

// https://ai-sdk.dev/docs/foundations/agents#using-maxsteps 
async function useToolsExample(ctx: restate.Context, prompt: string) {
 
  const model = wrapLanguageModel({
    model: openai("gpt-4o-2024-08-06", { structuredOutputs: true }),
    middleware: middleware(ctx, { maxRetryAttempts: 3 }),
  });

  const { text: answer } = await generateText({
    model,
    tools: {
      calculate: tool({
        description:
          "A tool for evaluating mathematical expressions. " +
          "Example expressions: " +
          "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
        parameters: z.object({ expression: z.string() }),
        execute: async ({ expression }) => {
          //
          // use the restate API over here to store function calls into
          // the durable log
          //
          return await ctx.run(
            `evaluating ${expression}`,
            async () => mathjs.evaluate(expression),
            { serde: superJson }
          );
        },
      }),
    },
    maxSteps: 10,
    maxRetries: 0,
    onStepFinish: async (step) => {
      publishMessage(ctx, "channel", {
        role: "system",
        content: step.text,
      });
    },
    system:
      "You are solving math problems. " +
      "Reason step by step. " +
      "Use the calculator when necessary. " +
      "When you give the final answer, " +
      "provide an explanation for how you arrived at it.",
    prompt,
  });

  return `Answer: ${answer}`;
}