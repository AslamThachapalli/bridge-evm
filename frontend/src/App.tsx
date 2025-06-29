import { useState } from "react";
import { BridgeInterface } from "./components/BridgeInterface";
import { TransactionHistory } from "./components/TransactionHistory";
import { TransactionProvider } from "./components/TransactionContext";
import { ArrowLeftRightIcon, HistoryIcon } from "lucide-react";
import { useAccount, useConnect } from "wagmi";
import Header from "./components/Header";

export function App() {
    const { connectors, connect } = useConnect();
    const { isConnected } = useAccount();

    const [activeTab, setActiveTab] = useState<"bridge" | "history">("bridge");

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <div className="container mx-auto px-4 py-8">
                <Header />
                <TransactionProvider>
                    {isConnected ? (
                        <div>
                            <div className="flex justify-center mb-8">
                                <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab("bridge")}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                            activeTab === "bridge"
                                                ? "bg-white shadow-md text-blue-600"
                                                : "text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        <ArrowLeftRightIcon className="w-4 h-4 mr-2" />
                                        Bridge
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("history")}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                            activeTab === "history"
                                                ? "bg-white shadow-md text-blue-600"
                                                : "text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        <HistoryIcon className="w-4 h-4 mr-2" />
                                        History
                                    </button>
                                </div>
                            </div>
                            {activeTab === "bridge" ? (
                                <div className="max-w-2xl mx-auto">
                                    <BridgeInterface />
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto">
                                    <TransactionHistory />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                            <div className="w-20 h-20 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <div className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Welcome to Ethereum - Base Bridge
                            </h2>
                            <p className="text-gray-500 mb-6 max-w-lg">
                                Connect your wallet to start transferring assets
                                between Ethereum and Base chains.
                            </p>
                            <button
                                onClick={() =>
                                    connect({ connector: connectors[0] })
                                }
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    )}
                </TransactionProvider>
            </div>
        </div>
    );
}
