import { useEffect, useState } from "react";
import { CheckCircleIcon, ArrowRightIcon } from "lucide-react";
import { type PendingLock, type PendingBurn } from "@/types/bridge";
import {
    useWriteContract,
    useWaitForTransactionReceipt,
    useAccount,
    useChainId,
    useSwitchChain,
} from "wagmi";
import { getBridgeAddress } from "@/config/contracts";
import { BRIDGE_BASE_ABI } from "@/lib/BaseBridgeAbi";
import { BRIDGE_ETH_ABI } from "@/lib/EthBridgeAbi";
import { parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { baseSepolia, sepolia } from "wagmi/chains";

interface PendingTransactionsProps {
    pendingLocks: PendingLock[];
    pendingBurns: PendingBurn[];
}

export const PendingTransactions = ({
    pendingLocks,
    pendingBurns,
}: PendingTransactionsProps) => {
    const { address } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const [selectedLocks, setSelectedLocks] = useState<string[]>([]);
    const [selectedBurns, setSelectedBurns] = useState<string[]>([]);
    const [status, setStatus] = useState<{
        action: "minting" | "unlocking" | "none";
        amount: number | null;
    }>({ action: "none", amount: null });

    const {
        writeContract,
        data: writeData,
        isPending: isWritePending,
    } = useWriteContract();
    const { isLoading: isTransactionPending } = useWaitForTransactionReceipt({
        hash: writeData,
    });
    const queryClient = useQueryClient();

    const handleLockSelection = (txId: string) => {
        setSelectedLocks((prev) =>
            prev.includes(txId)
                ? prev.filter((id) => id !== txId)
                : [...prev, txId]
        );
    };

    const handleBurnSelection = (txId: string) => {
        setSelectedBurns((prev) =>
            prev.includes(txId)
                ? prev.filter((id) => id !== txId)
                : [...prev, txId]
        );
    };

    useEffect(() => {
        if (!isWritePending && writeData && status.action !== "none") {
            if (status.action === "minting") {
                // After successful mint, call backend API to record the transaction
                fetch("http://localhost:5000/eth-to-base/mint", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mintTxHash: writeData,
                        user: address,
                        lockIds: selectedLocks,
                        totalAmount: status.amount,
                    }),
                }).then(() => {
                    // Refetch pending transactions
                    queryClient.invalidateQueries({
                        queryKey: ["pendingMints"],
                    });
                });

                setSelectedLocks([]);
                setStatus({ action: "none", amount: null });
            } else if (status.action === "unlocking") {
                // After successful unlock, call backend API to record the transaction
                fetch("http://localhost:5000/base-to-eth/unlock", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        unlockTxHash: writeData,
                        user: address,
                        burnIds: selectedBurns,
                        totalAmount: status.amount,
                    }),
                }).then(() => {
                    // Refetch pending transactions
                    queryClient.invalidateQueries({
                        queryKey: ["pendingUnlocks"],
                    });
                });

                setSelectedBurns([]);
                setStatus({ action: "none", amount: null });
            }
        }
    }, [writeData, status]);

    const handleMint = async () => {
        if (selectedLocks.length > 0) {
            const selectedLocksData = pendingLocks.filter((lock) =>
                selectedLocks.includes(lock.id)
            );
            const totalAmount = selectedLocksData.reduce(
                (sum, lock) => sum + lock.amount,
                0
            );

            try {
                if (chainId !== baseSepolia.id) {
                    switchChain({ chainId: baseSepolia.id });
                }
                writeContract({
                    address: getBridgeAddress("base") as `0x${string}`,
                    abi: BRIDGE_BASE_ABI,
                    functionName: "mint",
                    args: [parseEther(totalAmount.toString())],
                    chainId: baseSepolia.id,
                });

                setStatus({ action: "minting", amount: totalAmount });
            } catch (error) {
                console.error("Mint failed:", error);
            }
        }
    };

    const handleUnlock = async () => {
        if (selectedBurns.length > 0) {
            const selectedBurnsData = pendingBurns.filter((burn) =>
                selectedBurns.includes(burn.id)
            );
            const totalAmount = selectedBurnsData.reduce(
                (sum, burn) => sum + burn.amount,
                0
            );

            try {
                if (chainId !== sepolia.id) {
                    switchChain({ chainId: sepolia.id });
                }
                writeContract({
                    address: getBridgeAddress("ethereum") as `0x${string}`,
                    abi: BRIDGE_ETH_ABI,
                    functionName: "unlock",
                    args: [parseEther(totalAmount.toString())],
                });

                setStatus({ action: "unlocking", amount: totalAmount });
            } catch (error) {
                console.error("Unlock failed:", error);
            }
        }
    };

    const calculateTotalAmount = (
        transactions: (PendingLock | PendingBurn)[],
        selectedIds: string[]
    ) => {
        return transactions
            .filter((tx) => selectedIds.includes(tx.id))
            .reduce((sum, tx) => sum + tx.amount, 0)
            .toFixed(4);
    };

    const isProcessing = isWritePending || isTransactionPending;

    return (
        <div>
            {pendingLocks.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                            Ready to Mint
                        </h3>
                        <button
                            onClick={handleMint}
                            disabled={
                                selectedLocks.length === 0 || isProcessing
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedLocks.length > 0 && !isProcessing
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm hover:shadow"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {isProcessing
                                ? "Processing..."
                                : `Mint Selected (${selectedLocks.length})`}
                        </button>
                    </div>
                    {selectedLocks.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                            <span className="text-sm text-blue-700">
                                Total to mint:{" "}
                                <span className="font-medium">
                                    {calculateTotalAmount(
                                        pendingLocks,
                                        selectedLocks
                                    )}{" "}
                                    ETH
                                </span>
                            </span>
                            <button
                                onClick={() =>
                                    setSelectedLocks(
                                        pendingLocks.map((lock) => lock.id)
                                    )
                                }
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Select All
                            </button>
                        </div>
                    )}
                    <div className="space-y-3">
                        {pendingLocks.map((lock) => (
                            <div
                                key={lock.id}
                                className={`border rounded-lg p-4 transition-colors ${
                                    selectedLocks.includes(lock.id)
                                        ? "border-blue-300 bg-blue-50"
                                        : "border-gray-200 hover:border-blue-200"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 cursor-pointer ${
                                                selectedLocks.includes(lock.id)
                                                    ? "bg-blue-600 border-blue-600"
                                                    : "border-gray-300"
                                            }`}
                                            onClick={() =>
                                                handleLockSelection(lock.id)
                                            }
                                        >
                                            {selectedLocks.includes(
                                                lock.id
                                            ) && (
                                                <CheckCircleIcon className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {lock.amount} ETH
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Locked
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                                                <span className="text-xs">
                                                    E
                                                </span>
                                            </div>
                                            <ArrowRightIcon className="w-3 h-3 mx-1 text-gray-400" />
                                            <div className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center">
                                                <span className="text-xs">
                                                    B
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {pendingBurns.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                            Ready to Unlock
                        </h3>
                        <button
                            onClick={handleUnlock}
                            disabled={
                                selectedBurns.length === 0 || isProcessing
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedBurns.length > 0 && !isProcessing
                                    ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-sm hover:shadow"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {isProcessing
                                ? "Processing..."
                                : `Unlock Selected (${selectedBurns.length})`}
                        </button>
                    </div>
                    {selectedBurns.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                            <span className="text-sm text-purple-700">
                                Total to unlock:{" "}
                                <span className="font-medium">
                                    {calculateTotalAmount(
                                        pendingBurns,
                                        selectedBurns
                                    )}{" "}
                                    ETH
                                </span>
                            </span>
                            <button
                                onClick={() =>
                                    setSelectedBurns(
                                        pendingBurns.map((burn) => burn.id)
                                    )
                                }
                                className="text-xs text-purple-600 hover:text-purple-800"
                            >
                                Select All
                            </button>
                        </div>
                    )}
                    <div className="space-y-3">
                        {pendingBurns.map((burn) => (
                            <div
                                key={burn.id}
                                className={`border rounded-lg p-4 transition-colors ${
                                    selectedBurns.includes(burn.id)
                                        ? "border-purple-300 bg-purple-50"
                                        : "border-gray-200 hover:border-purple-200"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 cursor-pointer ${
                                                selectedBurns.includes(burn.id)
                                                    ? "bg-purple-600 border-purple-600"
                                                    : "border-gray-300"
                                            }`}
                                            onClick={() =>
                                                handleBurnSelection(burn.id)
                                            }
                                        >
                                            {selectedBurns.includes(
                                                burn.id
                                            ) && (
                                                <CheckCircleIcon className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {burn.amount} ETH
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Burned
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center">
                                                <span className="text-xs">
                                                    B
                                                </span>
                                            </div>
                                            <ArrowRightIcon className="w-3 h-3 mx-1 text-gray-400" />
                                            <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                                                <span className="text-xs">
                                                    E
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
