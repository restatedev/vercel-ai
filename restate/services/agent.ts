import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";

import { openai } from "@ai-sdk/openai";
import { generateObject, wrapLanguageModel } from "ai";


import { z } from "zod";
import { middleware } from "../ai_infra";

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
        return handleCustomerQuery(ctx, query);
      }
    ),
  },
});


async function handleCustomerQuery(ctx: restate.Context, query: string) {
  const model = wrapLanguageModel({
    model: openai("gpt-4o"),
    middleware: middleware(ctx, { maxRetryAttempts: 1 }),
  });

   // First step: Classify the query type
   const { object: classification } = await generateObject({
    model,
    maxRetries: 0,
    schema: z.object({
      reasoning: z.string(),
      type: z.enum(['general', 'refund', 'technical']),
      complexity: z.enum(['simple', 'complex']),
    }),
    prompt: `Classify this customer query:
    ${query}

    Determine:
    1. Query type (general, refund, or technical)
    2. Complexity (simple or complex)
    3. Brief reasoning for classification`,
  });

  return classification.reasoning;
}
 
