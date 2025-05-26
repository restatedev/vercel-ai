import * as restate from "@restatedev/restate-sdk-clients";
import type { Counter } from "./services/agent";
import { AGENT_OBJECT } from "./services/constants";

const rs = restate.connect({ url: "http://localhost:8080" });

export const counterClient = rs.objectClient<Counter>(
  AGENT_OBJECT,
  "bob"
);
