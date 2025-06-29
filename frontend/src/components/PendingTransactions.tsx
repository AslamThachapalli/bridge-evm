import { useState } from "react";
import { CheckCircleIcon, ArrowRightIcon } from "lucide-react";
import { type Transaction, useTransactions } from "./TransactionContext";

interface PendingTransactionsProps {
    pendingLocks: Transaction[];
    pendingBurns: Transaction[];
}

export const PendingTransactions = ({
    pendingLocks,
    pendingBurns,
}: PendingTransactionsProps) => {
    const [selectedLocks, setSelectedLocks] = useState<string[]>([]);
    const [selectedBurns, setSelectedBurns] = useState<string[]>([]);
    const { batchMint, batchUnlock } = useTransactions();

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

    const handleMint = () => {
        if (selectedLocks.length > 0) {
            batchMint(selectedLocks);
            setSelectedLocks([]);
        }
    };

    const handleUnlock = () => {
        if (selectedBurns.length > 0) {
            batchUnlock(selectedBurns);
            setSelectedBurns([]);
        }
    };

    const calculateTotalAmount = (
        transactions: Transaction[],
        selectedIds: string[]
    ) => {
        return transactions
            .filter((tx) => selectedIds.includes(tx.id))
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
            .toFixed(4);
    };

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
                            disabled={selectedLocks.length === 0}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedLocks.length > 0
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm hover:shadow"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            Mint Selected ({selectedLocks.length})
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
                                                Locked{" "}
                                                {formatTimeAgo(lock.timestamp)}
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
                            disabled={selectedBurns.length === 0}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedBurns.length > 0
                                    ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-sm hover:shadow"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            Unlock Selected ({selectedBurns.length})
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
                                                Burned{" "}
                                                {formatTimeAgo(burn.timestamp)}
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
            {pendingLocks.length === 0 && pendingBurns.length === 0 && (
                <div className="text-center py-10">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        No Pending Transactions
                    </h3>
                    <p className="text-gray-500 text-sm">
                        All your transactions have been processed.
                    </p>
                </div>
            )}
        </div>
    );
};

function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}
