import React, { useState } from "react";
import { ArrowRightIcon, ArrowUpDown } from "lucide-react";
import { ChainSelector } from "./ChainSelector";
import { TransactionStatus } from "./TransactionStatus";
import { PendingTransactions } from "./PendingTransactions";
import {
    useTransactions,
    type ChainType,
    type TransactionType,
} from "./TransactionContext";

export const BridgeInterface = () => {
    const [fromChain, setFromChain] = useState<ChainType>("ethereum");
    const [toChain, setToChain] = useState<ChainType>("base");
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<"bridge" | "pending">("bridge");
    const {
        addTransaction,
        pendingTransaction,
        setPendingTransaction,
        getPendingLocks,
        getPendingBurns,
    } = useTransactions();
    const pendingLocks = getPendingLocks();
    const pendingBurns = getPendingBurns();
    const hasPending = pendingLocks.length > 0 || pendingBurns.length > 0;

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
        setFromChain(toChain);
        setToChain(fromChain);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate transaction processing
        const newTx = addTransaction({
            type: getTransactionType(),
            fromChain,
            toChain,
            amount,
            status: "pending",
            hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        });
        setPendingTransaction(newTx);
        // Simulate transaction confirmation after delay
        setTimeout(() => {
            setPendingTransaction(null);
            setIsProcessing(false);
            setAmount("");
        }, 5000);
    };

    if (pendingTransaction) {
        return <TransactionStatus transaction={pendingTransaction} />;
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
                            Pending ({pendingLocks.length + pendingBurns.length}
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
                                placeholder="0.0"
                                className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <div className="absolute right-3 top-3 text-gray-400">
                                ETH
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={isProcessing || !amount}
                            className={`w-full py-3 rounded-lg font-medium transition-all ${
                                isProcessing || !amount
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                            }`}
                        >
                            {isProcessing
                                ? "Processing..."
                                : getActionButtonText()}
                        </button>
                    </div>
                </form>
            ) : (
                <PendingTransactions
                    pendingLocks={pendingLocks}
                    pendingBurns={pendingBurns}
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
