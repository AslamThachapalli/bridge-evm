import { type ChainType } from "./TransactionContext";
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
    const chains = [
        {
            id: "ethereum",
            name: "Ethereum",
            logo: "public/images/ethereum.svg",
            color: "bg-blue-100",
            textColor: "text-blue-800",
        },
        {
            id: "base",
            name: "Base",
            logo: "public/images/base.svg",
            color: "bg-purple-100",
            textColor: "text-purple-800",
        },
    ];
    return (
        <div className="grid grid-cols-2 gap-4">
            {chains.map((chain) => (
                <button
                    key={chain.id}
                    type="button"
                    disabled={chain.id === disabledChain}
                    onClick={() => onChainChange(chain.id as ChainType)}
                    className={`flex items-center p-3 rounded-lg transition-all ${
                        selectedChain === chain.id
                            ? `border-2 border-${
                                  chain.id === "ethereum" ? "blue" : "purple"
                              }-400 shadow-sm`
                            : "border border-gray-200"
                    } ${
                        chain.id === disabledChain
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-gray-300 hover:shadow-sm"
                    }`}
                >
                    <div
                        className={`w-8 h-8 ${chain.color} rounded-full flex items-center justify-center mr-3`}
                    >
                        <img
                            src={chain.logo}
                            alt={chain.name}
                            className="w-5 h-5"
                        />
                    </div>
                    <span className={`font-medium ${chain.textColor}`}>
                        {chain.name}
                    </span>
                </button>
            ))}
        </div>
    );
};
