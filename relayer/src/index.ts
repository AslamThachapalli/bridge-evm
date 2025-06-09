import { Chain } from "@prisma/client";
import { listenToBridgeEvent } from "workers/eventListener";
import "dotenv/config";

setInterval(() => listenToBridgeEvent(Chain.ETH), 5000);
setInterval(() => listenToBridgeEvent(Chain.BASE), 5000);
