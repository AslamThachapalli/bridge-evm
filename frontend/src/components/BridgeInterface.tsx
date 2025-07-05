import React, { useState, useEffect } from "react";
import { ArrowUpDown, CheckCircle, AlertCircle } from "lucide-react";
import { ChainSelector } from "./ChainSelector";
import { PendingTransactions } from "./PendingTransactions";
import { useQuery } from "@tanstack/react-query";
import {
    useAccount,
    useWriteContract,
    useChainId,
    useSwitchChain,
    // useWaitForTransactionReceipt,
} from "wagmi";
import { useTokenApproval } from "../hooks/useTokenApproval";
import { getBridgeAddress } from "@/config/contracts";
import { BRIDGE_ETH_ABI } from "@/lib/EthBridgeAbi";
import { parseEther } from "viem";
import { BRIDGE_BASE_ABI } from "@/lib/BaseBridgeAbi";
import {
    type ChainType,
    type TransactionType,
    type PendingMintsResponse,
    type PendingUnlocksResponse,
} from "@/types/bridge";
import { baseSepolia, sepolia } from "wagmi/chains";
import { TransactionStatus } from "./TransactionStatus";

export const BridgeInterface = () => {
    const [fromChain, setFromChain] = useState<ChainType>("ethereum");
    const [toChain, setToChain] = useState<ChainType>("base");
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState<{
        status: boolean;
        currentStep: number;
        type: TransactionType;
        steps: string[];
    } | null>(null);
    const [activeTab, setActiveTab] = useState<"bridge" | "pending">("bridge");
    const [needsApproval, setNeedsApproval] = useState(false);
    const { address } = useAccount();
    const {
        data: writeData,
        writeContract,
        isPending: isWritePending,
    } = useWriteContract();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    useEffect(() => {
        if (chainId !== sepolia.id) {
            switchChain({ chainId: sepolia.id });
        }
    }, []);

    // Token approval hook for the source chain
    const tokenApproval = useTokenApproval(fromChain);

    const { data: pendingMints, refetch: refetchPendingMints } =
        useQuery<PendingMintsResponse>({
            queryKey: ["pendingMints", address],
            queryFn: async () => {
                const res = await fetch(
                    `http://localhost:5000/eth-to-base/pending/${address}`
                );
                const data = await res.json();

                if (isProcessing && isProcessing.type === "lock") {
                    setIsProcessing((prev) => {
                        if (prev) {
                            return {
                                ...prev,
                                currentStep: 2,
                            };
                        }
                        return null;
                    });

                    setTimeout(() => {
                        setIsProcessing(null);
                    }, 2000);
                }

                return data;
            },
            enabled: !!address,
        });

    const { data: pendingUnlocks, refetch: refetchPendingUnlocks } =
        useQuery<PendingUnlocksResponse>({
            queryKey: ["pendingUnlocks", address],
            queryFn: async () => {
                const res = await fetch(
                    `http://localhost:5000/base-to-eth/pending/${address}`
                );
                const data = await res.json();

                if (isProcessing && isProcessing.type === "burn") {
                    setIsProcessing((prev) => {
                        if (prev) {
                            return {
                                ...prev,
                                currentStep: 2,
                            };
                        }
                        return null;
                    });

                    setTimeout(() => {
                        setIsProcessing(null);
                    }, 2000);
                }
                return data;
            },
            enabled: !!address,
        });

    const hasPending =
        (pendingMints?.pendingLocks.length || 0) > 0 ||
        (pendingUnlocks?.pendingBurns.length || 0) > 0;

    // Check if approval is needed when amount changes
    useEffect(() => {
        if (amount && fromChain === "ethereum" && toChain === "base") {
            const hasEnoughAllowance = tokenApproval.checkAllowance(amount);
            setNeedsApproval(!hasEnoughAllowance);
        } else {
            setNeedsApproval(false);
        }

        if (amount && fromChain === "base" && toChain === "ethereum") {
            const canBurn = tokenApproval.checkCanBurn(amount);
            setNeedsApproval(!canBurn);
        }
    }, [amount, fromChain, toChain, tokenApproval]);

    const getTransactionType = (): TransactionType => {
        if (fromChain === "ethereum" && toChain === "base") {
            return "lock";
        } else if (fromChain === "base" && toChain === "ethereum") {
            return "burn";
        } else if (fromChain === "ethereum" && toChain === "ethereum") {
            return "unlock";
        } else {
            return "mint";
        }
    };

    const handleSwapChains = () => {
        if (fromChain === "ethereum" && toChain === "base") {
            switchChain({ chainId: baseSepolia.id });
        } else if (fromChain === "base" && toChain === "ethereum") {
            switchChain({ chainId: sepolia.id });
        }
        setFromChain(toChain);
        setToChain(fromChain);
    };

    const handleApprove = async () => {
        if (!amount) return;
        await tokenApproval.approveToken(amount);
    };

    const [lockedHash, setLockedHash] = useState<string | null>(null);
    const [burntHash, setBurntHash] = useState<string | null>(null);

    const { refetch: refetchHasLocked } = useQuery({
        queryKey: ["hasLocked", lockedHash],
        queryFn: async () => {
            const response = await fetch(
                `http://localhost:5000/eth-to-base/hasLocked/${lockedHash}`
            );
            const { hasLocked } = await response.json();
            if (hasLocked) {
                refetchPendingMints();
                setIsProcessing((prev) => {
                    if (prev) {
                        return {
                            ...prev,
                            currentStep: 2,
                        };
                    }
                    return null;
                });
                setTimeout(() => setLockedHash(null), 500);
            }
            return hasLocked as boolean;
        },
        refetchInterval: 1000,
        enabled: lockedHash !== null,
    });

    const { refetch: refetchHasBurnt } = useQuery({
        queryKey: ["hasBurnt", burntHash],
        queryFn: async () => {
            const response = await fetch(
                `http://localhost:5000/base-to-eth/hasBurnt/${burntHash}`
            );
            const { hasBurnt } = await response.json();
            if (hasBurnt) {
                refetchPendingUnlocks();
                setTimeout(() => setBurntHash(null), 500);
            }
            return hasBurnt as boolean;
        },
        refetchInterval: 1000,
        enabled: burntHash !== null,
    });

    useEffect(() => {
        if (writeData) {
            setIsProcessing((prev) => {
                if (prev) {
                    return {
                        ...prev,
                        currentStep: 1,
                    };
                }
                return null;
            });
            if (getTransactionType() === "lock") {
                setLockedHash(writeData);
                refetchHasLocked();
            } else if (getTransactionType() === "burn") {
                setBurntHash(writeData);
                tokenApproval.refetchBalance();
                refetchHasBurnt();
            }
        }
    }, [writeData, getTransactionType()]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if approval is needed for lock or burn transactions
        if (needsApproval) {
            return; // Don't proceed if approval is needed
        }

        const steps =
            getTransactionType() === "lock"
                ? [
                      "Intiating lock process",
                      "Confirming on Blockchain",
                      "Finalizing",
                  ]
                : [
                      "Initiating burn process",
                      "Confirming on Blockchain",
                      "Finalizing",
                  ];

        setIsProcessing({
            status: true,
            currentStep: 0,
            type: getTransactionType(),
            steps: steps,
        });

        switch (getTransactionType()) {
            case "lock":
                if (chainId !== sepolia.id) {
                    switchChain({ chainId: sepolia.id });
                }
                writeContract({
                    address: getBridgeAddress(fromChain) as `0x${string}`,
                    abi: BRIDGE_ETH_ABI,
                    functionName: "lock",
                    args: [parseEther(amount)],
                });
                break;
            case "burn":
                if (chainId !== baseSepolia.id) {
                    switchChain({ chainId: baseSepolia.id });
                }
                writeContract({
                    chainId: baseSepolia.id,
                    address: getBridgeAddress(fromChain) as `0x${string}`,
                    abi: BRIDGE_BASE_ABI,
                    functionName: "burn",
                    args: [parseEther(amount)],
                });
                break;
        }
        setAmount("");
    };

    if (isProcessing && isProcessing.status) {
        return (
            <TransactionStatus
                amount={amount}
                currentStep={isProcessing.currentStep}
                steps={isProcessing.steps}
                type={isProcessing.type}
                hash={writeData || ""}
            />
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bridge Assets
                </h2>
                {hasPending && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab("bridge")}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activeTab === "bridge"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Bridge
                        </button>
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activeTab === "pending"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Pending (
                            {(pendingMints?.pendingLocks.length || 0) +
                                (pendingUnlocks?.pendingBurns.length || 0)}
                            )
                        </button>
                    </div>
                )}
            </div>
            {activeTab === "bridge" ? (
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            From
                        </label>
                        <ChainSelector
                            selectedChain={fromChain}
                            onChainChange={setFromChain}
                            disabledChain={toChain}
                        />
                    </div>
                    <div className="flex justify-center my-4">
                        <button
                            type="button"
                            onClick={handleSwapChains}
                            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                        >
                            <ArrowUpDown />
                        </button>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            To
                        </label>
                        <ChainSelector
                            selectedChain={toChain}
                            onChainChange={setToChain}
                            disabledChain={fromChain}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={0}
                                placeholder="0.0"
                                className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <div className="absolute right-3 top-3 text-gray-400">
                                {fromChain === "ethereum" ? "ASLC" : "BASLC"}
                            </div>
                        </div>
                        {/* Token balance and allowance info */}
                        {fromChain === "ethereum" &&
                            toChain === "base" &&
                            amount && (
                                <div className="mt-2 text-sm text-gray-500">
                                    <div>
                                        Balance:{" "}
                                        {tokenApproval.getBalanceFormatted()}{" "}
                                        ASLC
                                    </div>
                                    <div>
                                        Allowance:{" "}
                                        {tokenApproval.getAllowanceFormatted()}{" "}
                                        ASLC
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Approval section for lock transactions */}
                    {getTransactionType() === "lock" &&
                        needsApproval &&
                        amount && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Token Approval Required
                                        </h3>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Before locking tokens, you need to
                                            approve the bridge contract to spend
                                            your tokens.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleApprove}
                                            disabled={tokenApproval.isApproving}
                                            className={`mt-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                tokenApproval.isApproving
                                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                                            }`}
                                        >
                                            {tokenApproval.isApproving
                                                ? "Approving..."
                                                : "Approve Tokens"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Success message when approval is complete */}
                    {getTransactionType() === "lock" &&
                        !needsApproval &&
                        amount &&
                        tokenApproval.isApprovalSuccess && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <h3 className="text-sm font-medium text-green-800">
                                            Approval Complete
                                        </h3>
                                        <p className="text-sm text-green-700">
                                            You can now proceed with the bridge
                                            transaction.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    {getTransactionType() === "burn" &&
                        needsApproval &&
                        amount && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Insufficient Balance
                                        </h3>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            You do not have enough tokens to
                                            burn.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={
                                isProcessing?.status ||
                                !amount ||
                                (getTransactionType() === "lock" &&
                                    needsApproval) ||
                                isWritePending
                            }
                            className={`w-full py-3 rounded-lg font-medium transition-all ${
                                isProcessing ||
                                !amount ||
                                (getTransactionType() === "lock" &&
                                    needsApproval) ||
                                isWritePending
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                            }`}
                        >
                            {isProcessing || isWritePending
                                ? "Processing..."
                                : getActionButtonText()}
                        </button>
                    </div>
                </form>
            ) : (
                <PendingTransactions
                    pendingLocks={pendingMints?.pendingLocks || []}
                    pendingBurns={pendingUnlocks?.pendingBurns || []}
                />
            )}
        </div>
    );

    function getActionButtonText() {
        switch (getTransactionType()) {
            case "lock":
                return "Lock on Ethereum";
            case "mint":
                return "Mint on Base";
            case "burn":
                return "Burn on Base";
            case "unlock":
                return "Unlock on Ethereum";
            default:
                return "Transfer";
        }
    }
};
