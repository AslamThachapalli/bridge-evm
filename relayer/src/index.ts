import "dotenv/config";

import { Chain } from "@prisma/client";
import { listenToBridgeEvent } from "./workers/eventListener";


setInterval(() => listenToBridgeEvent(Chain.ETH), 5000);
setInterval(() => listenToBridgeEvent(Chain.BASE), 5000);
