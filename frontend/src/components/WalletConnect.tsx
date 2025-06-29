import { WalletIcon } from "lucide-react";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { WalletModal } from "./WalletModal";

export const WalletConnect = () => {
    const { connectors, connect } = useConnect();
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => {
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleConnect = () => {
        connect({ connector: connectors[0] });
    };

    const handleDisconnect = () => {
        disconnect();
    };

    const handleConnectWallet = () => {
        closeModal();
    };

    if (isConnected) {
        return (
            <div className="flex items-center">
                <div className="bg-gray-100 border border-gray-200 rounded-lg py-2 px-4 flex items-center mr-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium">{address}</span>
                </div>
                <button
                    onClick={handleDisconnect}
                    className="text-sm text-gray-500 hover:text-gray-800"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
                <WalletIcon className="w-4 h-4 mr-2" />
                Connect Wallet
            </button>
            <WalletModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConnect={handleConnectWallet}
            />
        </>
    );
};
