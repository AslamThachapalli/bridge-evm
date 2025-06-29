import { http, createConfig } from "wagmi";
import { sepolia, baseSepolia } from "wagmi/chains";
import { metaMask, injected, safe } from "wagmi/connectors";

export const config = createConfig({
    chains: [sepolia, baseSepolia],
    connectors: [injected(), metaMask(), safe()],
    transports: {
        [sepolia.id]: http(import.meta.env.VITE_ETH_SEPOLIA_RPC),
        [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC),
    },
});
