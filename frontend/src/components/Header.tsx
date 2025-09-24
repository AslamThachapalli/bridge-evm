import { WalletConnect } from "./WalletConnect";
import { useTokenBalance } from "../hooks/useTokenBalance";

export default function Header() {
    const { balance, tokenSymbol, isLoading, isConnected } = useTokenBalance();

    return (
        <header className="flex justify-between items-center mb-8">
            <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Ethereum - Base Bridge
                </h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Token Balance Display */}
                {isConnected && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4">
                        <div className="flex items-center">
                            <div className="text-sm text-gray-600 mr-2">
                                {tokenSymbol} Balance:
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {isLoading
                                    ? "Loading..."
                                    : `${balance} ${tokenSymbol}`}
                            </div>
                        </div>
                    </div>
                )}
                <WalletConnect />
            </div>
        </header>
    );
}
