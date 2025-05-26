import * as restate from "@restatedev/restate-sdk/fetch";
import agent from "./services/agent";

// Create the Restate endpoint to accept requests
export const endpoint = restate.endpoint().bind(agent);
