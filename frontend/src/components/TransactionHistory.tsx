import { useState } from "react";
import {
    CheckCircleIcon,
    ClockIcon,
    ArrowRightIcon,
    CopyIcon,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
    type ChainType,
    type Transaction,
    type TransactionType,
} from "@/types/bridge";
import { toast } from "sonner";

export const TransactionHistory = () => {
    const { address } = useAccount();
    const [activeFilter, setActiveFilter] = useState<ChainType>("ethereum");

    // Fetch transaction history from backend APIs
    const { data: ethHistory } = useQuery({
        queryKey: ["ethHistory", address],
        queryFn: async () => {
            const response = await fetch(
                `http://localhost:5000/eth-to-base/history/${address}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = await response.json();
            return data.history || [];
        },
        enabled: !!address,
    });

    const { data: baseHistory } = useQuery({
        queryKey: ["baseHistory", address],
        queryFn: async () => {
            const response = await fetch(
                `http://localhost:5000/base-to-eth/history/${address}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = await response.json();
            return data.history || [];
        },
        enabled: !!address,
    });

    const mapToTransaction = (txInfo: {
        txHash: string;
        action: string;
        amount: number;
        timestamp: number;
        fromChain: ChainType;
        toChain: ChainType;
    }): Transaction => {
        return {
            id: txInfo.txHash,
            type: txInfo.action as TransactionType,
            fromChain: txInfo.fromChain,
            toChain: txInfo.toChain,
            amount: txInfo.amount.toString(),
            status: "confirmed",
            hash: txInfo.txHash,
            timestamp: txInfo.timestamp,
        };
    };

    const filteredTransactions =
        activeFilter === "ethereum"
            ? ethHistory?.map((tx: any) =>
                  mapToTransaction({
                      ...tx,
                      fromChain: "ethereum",
                      toChain: "base",
                  })
              )
            : baseHistory?.map((tx: any) =>
                  mapToTransaction({
                      ...tx,
                      fromChain: "base",
                      toChain: "ethereum",
                  })
              );

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Transaction History
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex space-x-2">
                    <FilterButton
                        label="Ethereum"
                        active={activeFilter === "ethereum"}
                        onClick={() => setActiveFilter("ethereum")}
                    />
                    <FilterButton
                        label="Base"
                        active={activeFilter === "base"}
                        onClick={() => setActiveFilter("base")}
                    />
                </div>
            </div>
            <div className="space-y-4">
                {filteredTransactions && filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx: Transaction) => (
                        <TransactionCard key={tx.id} transaction={tx} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <ClockIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-1">
                            No transactions found
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {`No transactions for ${activeFilter} chain`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface FilterButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

const FilterButton = ({ label, active, onClick }: FilterButtonProps) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
            active
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
    >
        {label}
    </button>
);

interface TransactionCardProps {
    transaction: Transaction;
}

const TransactionCard = ({ transaction }: TransactionCardProps) => {
    const getTransactionTypeLabel = () => {
        switch (transaction.type) {
            case "lock":
                return "Lock";
            case "mint":
                return "Mint";
            case "burn":
                return "Burn";
            case "unlock":
                return "Unlock";
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getChainColor = (chain: ChainType) => {
        return chain === "ethereum"
            ? {
                  bg: "bg-blue-100",
                  text: "text-blue-800",
              }
            : {
                  bg: "bg-purple-100",
                  text: "text-purple-800",
              };
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                    {<CheckCircleIcon className="w-4 h-4 text-green-500" />}
                    <span className="ml-2 font-medium text-gray-800">
                        {getTransactionTypeLabel()}
                    </span>
                </div>
                <span className="text-sm text-gray-500">
                    {formatTime(transaction.timestamp)}
                </span>
            </div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div
                        className={`w-6 h-6 ${
                            getChainColor(transaction.fromChain).bg
                        } rounded-full flex items-center justify-center`}
                    >
                        <span
                            className={`text-xs ${
                                getChainColor(transaction.fromChain).text
                            }`}
                        >
                            {transaction.fromChain === "ethereum" ? "E" : "B"}
                        </span>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                        {transaction.fromChain === "ethereum"
                            ? "Ethereum"
                            : "Base"}
                    </span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                <div className="flex items-center">
                    <div
                        className={`w-6 h-6 ${
                            getChainColor(transaction.toChain).bg
                        } rounded-full flex items-center justify-center`}
                    >
                        <span
                            className={`text-xs ${
                                getChainColor(transaction.toChain).text
                            }`}
                        >
                            {transaction.toChain === "ethereum" ? "E" : "B"}
                        </span>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                        {transaction.toChain === "ethereum"
                            ? "Ethereum"
                            : "Base"}
                    </span>
                </div>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">{transaction.amount} ETH</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-2">
                    Hash: {transaction.hash.substring(0, 6)}...
                    {transaction.hash.substring(transaction.hash.length - 4)}
                    <CopyIcon
                        className="w-4 h-4 text-gray-400 cursor-pointer"
                        onClick={() => {
                            navigator.clipboard.writeText(transaction.hash);
                            toast.success("Copied to clipboard");
                        }}
                    />
                </span>
                <span>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
};
