import { type ChainType } from "@/types/bridge";

interface ChainSelectorProps {
    selectedChain: ChainType;
    onChainChange: (chain: ChainType) => void;
    disabledChain?: ChainType;
}

export const ChainSelector = ({
    selectedChain,
    onChainChange,
    disabledChain,
}: ChainSelectorProps) => {
    const chains: { value: ChainType; label: string; icon: string }[] = [
        {
            value: "ethereum",
            label: "Ethereum",
            icon: "images/ethereum.svg",
        },
        {
            value: "base",
            label: "Base",
            icon: "images/base.svg",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {chains.map((chain) => (
                <button
                    key={chain.value}
                    onClick={() => onChainChange(chain.value)}
                    disabled={disabledChain === chain.value}
                    className={`p-4 rounded-lg border-2 transition-all ${
                        selectedChain === chain.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                    } ${
                        disabledChain === chain.value
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                    }`}
                >
                    <div className="flex items-center space-x-3">
                        <img
                            src={chain.icon}
                            alt={chain.label}
                            className="w-6 h-6"
                        />
                        <div className="text-left">
                            <div className="font-medium text-gray-800">
                                {chain.label}
                            </div>
                            <div className="text-sm text-gray-500">
                                {chain.value === "ethereum"
                                    ? "Sepolia"
                                    : "Sepolia"}
                            </div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};
