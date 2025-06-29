import { WalletConnect } from "./WalletConnect";

export default function Header() {
    return (
        <header className="flex justify-between items-center mb-8">
            <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Ethereum - Base Bridge
                </h1>
            </div>
            <WalletConnect />
        </header>
    );
}
