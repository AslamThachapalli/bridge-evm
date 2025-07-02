import {
    useAccount,
    useWriteContract,
    useReadContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import {  parseUnits, formatUnits } from "viem";
import { getTokenAddress, getBridgeAddress } from "../config/contracts";
import { baseSepolia, sepolia } from "wagmi/chains";

export const useTokenApproval = (chain: "ethereum" | "base") => {
    const { address } = useAccount();

    const tokenAddress = getTokenAddress(chain);
    const bridgeAddress = getBridgeAddress(chain);

    // Read current allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: [
            {
                inputs: [
                    { internalType: "address", name: "owner", type: "address" },
                    {
                        internalType: "address",
                        name: "spender",
                        type: "address",
                    },
                ],
                name: "allowance",
                outputs: [
                    { internalType: "uint256", name: "", type: "uint256" },
                ],
                stateMutability: "view",
                type: "function",
            },
        ],
        functionName: "allowance",
        args: [address as `0x${string}`, bridgeAddress as `0x${string}`],
    });

    // Read token balance
    const { data: balance, refetch: refetchBalance } = useReadContract({
        chainId: chain === "ethereum" ? sepolia.id : baseSepolia.id,
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
        args: [address as `0x${string}`],
    });

    // Write approval transaction
    const {
        data: approveData,
        writeContract,
        isPending: isApproving,
        error: approveError,
    } = useWriteContract();

    // Wait for approval transaction
    const { isLoading: isApprovalPending, isSuccess: isApprovalSuccess } =
        useWaitForTransactionReceipt({
            hash: approveData,
        });

    if (isApprovalSuccess) {
        refetchAllowance();
        refetchBalance();
    }

    const approveToken = async (approvalAmount: string) => {
        if (!approvalAmount) return;

        try {
            const amountInWei = parseUnits(approvalAmount, 18);
            writeContract({
                address: tokenAddress as `0x${string}`,
                abi: [
                    {
                        inputs: [
                            {
                                internalType: "address",
                                name: "spender",
                                type: "address",
                            },
                            {
                                internalType: "uint256",
                                name: "value",
                                type: "uint256",
                            },
                        ],
                        name: "approve",
                        outputs: [
                            { internalType: "bool", name: "", type: "bool" },
                        ],
                        stateMutability: "nonpayable",
                        type: "function",
                    },
                ],
                functionName: "approve",
                args: [bridgeAddress as `0x${string}`, amountInWei],
            });
        } catch (error) {
            console.error("Approval failed:", error);
        }
    };

    const checkAllowance = (requiredAmount: string): boolean => {
        if (!allowance || !requiredAmount) return false;
        const requiredWei = parseUnits(requiredAmount, 18);
        return allowance >= requiredWei;
    };

    const getAllowanceFormatted = (): string => {
        return allowance ? formatUnits(allowance, 18) : "0";
    };

    const getBalanceFormatted = (): string => {
        return balance ? formatUnits(balance, 18) : "0";
    };

    const checkCanBurn = (amount: string): boolean => {
        if (!amount) return false;
        const amountInWei = parseUnits(amount, 18);

        if (!balance) return false;
        return balance >= amountInWei;
    };

    return {
        approveToken,
        checkAllowance,
        getAllowanceFormatted,
        getBalanceFormatted,
        isApproving: isApproving || isApprovalPending,
        isApprovalSuccess,
        approveError,
        allowance,
        balance,
        refetchAllowance,
        refetchBalance,
        checkCanBurn,
    };
};
