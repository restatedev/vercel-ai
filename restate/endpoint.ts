import * as restate from "@restatedev/restate-sdk/fetch";
import { counter } from "./services/counter";

// Create the Restate endpoint to accept requests
export const endpoint = restate.endpoint().bind(counter);
