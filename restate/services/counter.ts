import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";


import { COUNTER_OBJECT } from "./constants";

import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, type LanguageModelV1 } from "ai";
import { z } from "zod";

const Response = z.object({
  reasoning: z.string(),
  type: z.enum(["general", "refund", "technical"]),
  complexity: z.enum(["simple", "complex"]),
});

export const counter = restate.object({
  ...COUNTER_OBJECT,
  handlers: {
    add: restate.handlers.object.exclusive(
      {
        input: serde.zod(z.string()),
        output: serde.zod(
          z.object({
            response: z.string(),
            classification: Response,
          })
        ),
      },
      async (ctx: restate.ObjectContext, query: string) => {
        return handleCustomerQuery(ctx, query);
      }
    ),
  },
});


function wrap(ctx: restate.Context, model: LanguageModelV1): LanguageModelV1 {
  return {
    ...model,
    async doGenerate(options) {
      return ctx.run(`calling ${model.provider}`, async () => {
        const response = await model.doGenerate(options);
        return {
          ...response,
        };
      });
    },
  };
}

async function handleCustomerQuery(ctx: restate.Context, query: string) {
  const model = wrap(ctx, openai("gpt-4o"));
  // First step: Classify the query type
  const { object: classification } = await generateObject({
    model,
    schema: z.object({
      reasoning: z.string(),
      type: z.enum(["general", "refund", "technical"]),
      complexity: z.enum(["simple", "complex"]),
    }),
    prompt: `Classify this customer query:
  ${query}
  Determine:
  1. Query type (general, refund, or technical)
  2. Complexity (simple or complex)
  3. Brief reasoning for classification`,
  });
  // Route based on classification
  // Set model and system prompt based on query type and complexity
  const { text: response } = await generateText({
    model:
      classification.complexity === "simple"
        ? openai("gpt-4o-mini")
        : openai("o3-mini"),
    system: {
      general:
        "You are an expert customer service agent handling general inquiries.",
      refund:
        "You are a customer service agent specializing in refund requests. Follow company policy and collect necessary information.",
      technical:
        "You are a technical support specialist with deep product knowledge. Focus on clear step-by-step troubleshooting.",
    }[classification.type],
    prompt: query,
  });
  return { response, classification };
}

export type Counter = typeof counter;
