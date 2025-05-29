import * as restate from "@restatedev/restate-sdk/fetch";

import multi_tool from "@/restate/services/multi_tool";
import chat from "@/restate/services/chat";
import human from "@/restate/services/human_approval";
import { pubsub } from "@/restate/services/pubsub";
import { multiAgentLoanWorkflow, riskAssementAgent } from "@/restate/services/multi_agent";

const services = restate
  .endpoint()
  .bind(multi_tool)
  .bind(human)
  .bind(chat)
  .bind(pubsub)
  .bind(multiAgentLoanWorkflow)
  .bind(riskAssementAgent)
  .handler();

export function GET(request: Request) {
  return services.fetch(request);
}

export function POST(request: Request) {
  return services.fetch(request);
}
