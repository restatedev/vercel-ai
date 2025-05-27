import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";

import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, tool, wrapLanguageModel } from "ai";


import { z } from "zod";
import { middleware, superJson,  } from "../ai_infra";

export default restate.object({
  name: "agent",
  handlers: {
    message: restate.handlers.object.exclusive(
      {
        input: serde.zod(z.string()),
        output: serde.zod(z.string()),
        description: "Add a customer query and get a response",
      },
      async (ctx: restate.ObjectContext, query: string) => {
        await example2(ctx);
        throw new Error("Not implemented yet");
        return "";
      }
    ),
  },
});

 
import * as mathjs from 'mathjs';

async function example2(ctx: restate.Context) {
 
  const model = wrapLanguageModel({
    model: openai("gpt-4o-2024-08-06", { structuredOutputs: true }),
    middleware: middleware(ctx, { maxRetryAttempts: 1 }),
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
    system:
      "You are solving math problems. " +
      "Reason step by step. " +
      "Use the calculator when necessary. " +
      "When you give the final answer, " +
      "provide an explanation for how you arrived at it.",
    prompt:
      "A taxi driver earns $9461 per 1-hour of work. " +
      "If he works 12 hours a day and in 1 hour " +
      "he uses 12 liters of petrol with a price of $134 for 1 liter. " +
      "How much money does he earn in one day?",
  });

  return `Answer: ${answer}`;
}