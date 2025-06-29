import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useConnect } from "wagmi";
import { Button } from "./ui/button";

export default function ConnectWallet() {
    const { connectors, connect } = useConnect();

    return (
        <Dialog>
            <DialogTrigger className="border rounded-lg px-3 py-1 cursor-pointer">Connect Wallet</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Choose a wallet</DialogTitle>
                    <DialogDescription className="flex flex-col gap-2 py-4">
                        {connectors.map((connector) => (
                            <Button
                                key={connector.uid}
                                onClick={() => connect({ connector })}
                            >
                                {connector.name}
                            </Button>
                        ))}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
