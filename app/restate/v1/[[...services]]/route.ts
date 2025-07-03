import * as restate from "@restatedev/restate-sdk/fetch";

import multi_tool from "@/restate/services/multi_tool";
import multi_tool_reasoning from "@/restate/services/multi_tool_reasoning";
import chat from "@/restate/services/chat";
import human from "@/restate/services/human_approval";
import remote from "@/restate/services/remote_llm";
import { multiAgentLoanWorkflow, riskAssementAgent } from "@/restate/services/multi_agent";
import { infra } from "@/restate/services/remote_llm";
import { pubsub } from "@/restate/services/pubsub";

const RESTATE_REQUEST_SIGNING_KEY = process.env.RESTATE_REQUEST_SIGNING_KEY;

const endoint = RESTATE_REQUEST_SIGNING_KEY
  ? restate.endpoint().withIdentityV1(RESTATE_REQUEST_SIGNING_KEY)
  : restate.endpoint();

const services = endoint
  .bind(chat)
  .bind(human)
  .bind(multi_tool)
  .bind(multi_tool_reasoning)
  .bind(pubsub)
  .bind(multiAgentLoanWorkflow)
  .bind(riskAssementAgent)
  .bind(remote)
  .bind(infra.models)
  .handler();

export function GET(request: Request) {
  return services.fetch(request);
}

export function POST(request: Request) {
  return services.fetch(request);
}
