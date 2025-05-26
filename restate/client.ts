import * as restate from "@restatedev/restate-sdk-clients";
import type { Counter } from "./services/counter";
import { COUNTER_OBJECT, COUNTER_STATE_NAME } from "./services/constants";

const rs = restate.connect({ url: "http://localhost:8080" });

export const counterClient = rs.objectClient<Counter>(
  COUNTER_OBJECT,
  COUNTER_STATE_NAME
);
