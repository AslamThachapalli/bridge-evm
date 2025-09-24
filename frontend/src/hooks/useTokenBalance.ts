import { useAccount, useReadContract, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { getTokenAddress } from "../config/contracts";
import { baseSepolia, sepolia } from "wagmi/chains";

export const useTokenBalance = () => {
    const { address } = useAccount();
    const chainId = useChainId();

    // Determine current chain and token
    const isEthereum = chainId === sepolia.id;
    const isBase = chainId === baseSepolia.id;
    const chain = isEthereum ? "ethereum" : isBase ? "base" : null;

    const tokenAddress = chain ? getTokenAddress(chain) : null;
    const tokenSymbol = isEthereum ? "ASLC" : isBase ? "BASLC" : "";

    // Read token balance
    const {
        data: balance,
        refetch: refetchBalance,
        isLoading,
    } = useReadContract({
        chainId: chainId,
        address: tokenAddress as `0x${string}`,
        abi: [
            {
                inputs: [
                    {
                        internalType: "address",
                        name: "account",
                        type: "address",
                    },
                ],
                name: "balanceOf",
                outputs: [
                    { internalType: "uint256", name: "", type: "uint256" },
                ],
                stateMutability: "view",
                type: "function",
            },
        ],
        functionName: "balanceOf",
        args: address ? [address as `0x${string}`] : undefined,
        query: {
            enabled: !!address && !!tokenAddress,
        },
    });

    const formatBalance = () => {
        if (!balance) return "0.00";
        try {
            return formatUnits(balance, 18); // Assuming 18 decimals for both tokens
        } catch {
            return "0.00";
        }
    };

    return {
        balance: formatBalance(),
        tokenSymbol,
        isLoading,
        refetchBalance,
        isConnected: !!address,
        chain,
    };
};
