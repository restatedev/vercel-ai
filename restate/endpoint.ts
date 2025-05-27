import * as restate from "@restatedev/restate-sdk/fetch";

import multi_tool from "./services/multi_tool";
import human_approval from "./services/human_approval";
import chat from "./services/chat";

// Create the Restate endpoint to accept requests
export const endpoint = restate.endpoint()
.bind(multi_tool)
.bind(human_approval)
.bind(chat);
