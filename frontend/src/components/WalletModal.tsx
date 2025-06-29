import React from "react";
import { XIcon } from "lucide-react";

interface WalletOption {
    id: string;
    name: string;
    icon: string;
    description?: string;
}

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (walletId: string) => void;
}

const wallets: WalletOption[] = [
    {
        id: "metamask",
        name: "MetaMask",
        icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
        description: "Connect to your MetaMask Wallet",
    },
    {
        id: "coinbase",
        name: "Coinbase Wallet",
        icon: "https://storage.googleapis.com/coinbase-images/wallet-logo.png",
        description: "Connect using Coinbase Wallet",
    },
    {
        id: "walletconnect",
        name: "WalletConnect",
        icon: "https://1000logos.net/wp-content/uploads/2022/05/WalletConnect-Logo.jpg",
        description: "Connect with WalletConnect protocol",
    },
    {
        id: "trust",
        name: "Trust Wallet",
        icon: "https://trustwallet.com/assets/images/media/assets/trust_platform.png",
        description: "Connect using Trust Wallet",
    },
    {
        id: "ledger",
        name: "Ledger",
        icon: "https://cryptologos.cc/logos/ledger-token-logo.png",
        description: "Connect to your hardware wallet",
    },
];

export const WalletModal: React.FC<WalletModalProps> = ({
    isOpen,
    onClose,
    onConnect,
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Connect Wallet
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-4">
                    <p className="text-sm text-gray-500 mb-4">
                        Connect with one of our available wallet providers or
                        create a new one
                    </p>
                    <div className="space-y-2">
                        {wallets.map((wallet) => (
                            <button
                                key={wallet.id}
                                onClick={() => onConnect(wallet.id)}
                                className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center mr-3 bg-white">
                                    <img
                                        src={wallet.icon}
                                        alt={`${wallet.name} logo`}
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-800">
                                        {wallet.name}
                                    </div>
                                    {wallet.description && (
                                        <div className="text-xs text-gray-500">
                                            {wallet.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
                    By connecting a wallet, you agree to our Terms of Service
                    and Privacy Policy
                </div>
            </div>
        </div>
    );
};

// Add a fade-in animation
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
`;
document.head.appendChild(style);
