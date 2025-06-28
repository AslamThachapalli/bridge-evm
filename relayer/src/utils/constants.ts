import { shouldBeDefined } from "./helpers";

const privateKey = shouldBeDefined(process.env.PRIVATE_KEY, "PRIVATE_KEY");
const ethSepoliaRpc = shouldBeDefined(
    process.env.ETH_SEPOLIA_RPC,
    "ETH_SEPOLIA_RPC"
);
const baseSepoliaRpc = shouldBeDefined(
    process.env.BASE_SEPOLIA_RPC,
    "BASE_SEPOLIA_RPC"
);
const ethBridgeAddress = shouldBeDefined(
    process.env.ETH_BRIDGE_CONTRACT_ADDRESS,
    "ETH_BRIDGE_CONTRACT_ADDRESS"
);
const baseBridgeAddress = shouldBeDefined(
    process.env.BASE_BRIDGE_CONTRACT_ADDRESS,
    "BASE_BRIDGE_CONTRACT_ADDRESS"
);

export {
    privateKey,
    ethBridgeAddress,
    ethSepoliaRpc,
    baseBridgeAddress,
    baseSepoliaRpc,
};
