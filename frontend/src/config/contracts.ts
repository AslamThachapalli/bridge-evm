// Contract addresses - these should be set via environment variables in production
export const CONTRACT_ADDRESSES = {
    // Ethereum Sepolia
    ETH_BRIDGE:
        import.meta.env.VITE_ETH_BRIDGE_ADDRESS ||
        "0x0000000000000000000000000000000000000000",
    ASLC_TOKEN:
        import.meta.env.VITE_ASLC_TOKEN_ADDRESS ||
        "0x0000000000000000000000000000000000000000",

    // Base Sepolia
    BASE_BRIDGE:
        import.meta.env.VITE_BASE_BRIDGE_ADDRESS ||
        "0x0000000000000000000000000000000000000000",
    BASLC_TOKEN:
        import.meta.env.VITE_BASLC_TOKEN_ADDRESS ||
        "0x0000000000000000000000000000000000000000",
} as const;

// Helper function to get the appropriate token address based on chain
export const getTokenAddress = (chain: "ethereum" | "base") => {
    return chain === "ethereum"
        ? CONTRACT_ADDRESSES.ASLC_TOKEN
        : CONTRACT_ADDRESSES.BASLC_TOKEN;
};

// Helper function to get the appropriate bridge address based on chain
export const getBridgeAddress = (chain: "ethereum" | "base") => {
    return chain === "ethereum"
        ? CONTRACT_ADDRESSES.ETH_BRIDGE
        : CONTRACT_ADDRESSES.BASE_BRIDGE;
};
