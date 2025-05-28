import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";
import { superJson } from "../ai_infra";

import { z } from "zod";


interface Subscription {
  offset: number;
  id: string; 
}

interface Notification {
  newOffset: number;
  newMessages: unknown[];
}

interface ChatState {
  messages: unknown[];
  subscription: Subscription[];
}

const handler = restate.handlers.object

export const pubsub = restate.object({
  name: "pubsub",
  handlers: {
    pull: handler.shared(
      {
        input: serde.zod(
          z.object({
            offset: z.number(),
          })
        ),
        output: serde.zod(
          z.object({
            messages: z.any({}).array(),
            nextOffset: z.number(),
          })
        ),
      },
      async (ctx: restate.ObjectSharedContext<ChatState>, { offset }) => {
        const { id, promise } = ctx.awakeable<Notification>();
        ctx.objectSendClient(pubsub, ctx.key).subscribe({ offset, id });
        const { newMessages, newOffset } = await promise;
        return {
          messages: newMessages,
          nextOffset: newOffset,
        };
      }
    ),

    publish: async (
      ctx: restate.ObjectContext<ChatState>,
      message: unknown
    ) => {
      const messages = (await ctx.get("messages", superJson)) ?? [];
      messages.push(message);
      ctx.set("messages", messages, superJson);
      const subscriptions = (await ctx.get("subscription")) ?? [];
      for (const { id, offset } of subscriptions) {
        const notification = {
          newOffset: messages.length,
          newMessages: messages.slice(offset),
        };
        ctx.resolveAwakeable(id, notification);
      }
      ctx.clear("subscription");
    },

    subscribe: async (
      ctx: restate.ObjectContext<ChatState>,
      subscription: Subscription
    ) => {
      const sub = (await ctx.get("subscription")) ?? [];
      sub.push(subscription);
      ctx.set("subscription", sub);
    },
  },
});


export const publishMessage = <T>(
  ctx: restate.Context,
  topic: string,
  message: T
) => {
  ctx.objectSendClient(pubsub, topic).publish(message);
};
