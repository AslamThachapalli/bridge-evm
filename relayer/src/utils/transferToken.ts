import { BaseBridgeStatus, Chain, ETHBridgeStatus } from "@prisma/client";
import { BRIDGE_BASE_ABI } from "contracts/bridgeBase";
import { BRIDGE_ETH_ABI } from "contracts/bridgeEth";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import prisma from "./prisma";
import {
    privateKey,
    ethBridgeRpc,
    ethSepoliaRpc,
    baseBridgeRpc,
    baseSepoliaRpc,
} from "./constants";

interface Props {
    chain: Chain;
    txHash: string;
    user: string;
    amount: string;
    nonce: number;
}

export const transferToken = async ({
    chain,
    txHash,
    user,
    amount,
    nonce,
}: Props) => {
    let provider: JsonRpcProvider;
    let wallet: Wallet;
    let contract: Contract;

    switch (chain) {
        case "ETH":
            const ethBridgeDb = await prisma.ethToBaseBridge.create({
                data: {
                    depositor: user,
                    amount: parseInt(amount),
                    lockTxHash: txHash,
                    status: ETHBridgeStatus.Initiated,
                },
                select: { id: true },
            });
            provider = new JsonRpcProvider(ethSepoliaRpc);
            wallet = new Wallet(privateKey, provider);
            contract = new Contract(baseBridgeRpc, BRIDGE_ETH_ABI, wallet);
            const baseTx = await contract.lockedOnOppositeChain(
                user,
                amount,
                nonce
            );
            await baseTx.wait();
            await prisma.ethToBaseBridge.update({
                where: { id: ethBridgeDb.id },
                data: { status: ETHBridgeStatus.Locked },
            });
            break;
        case "BASE":
            const baseBridgeDb = await prisma.baseToEthBridge.create({
                data: {
                    burner: user,
                    amount: parseInt(amount),
                    burnTxHash: txHash,
                    status: BaseBridgeStatus.Initiated,
                },
                select: { id: true },
            });
            provider = new JsonRpcProvider(baseSepoliaRpc);
            wallet = new Wallet(privateKey, provider);
            contract = new Contract(ethBridgeRpc, BRIDGE_BASE_ABI, wallet);
            const ethTx = await contract.burnedOnOppositeChain(
                user,
                amount,
                nonce
            );
            await ethTx.wait();
            await prisma.baseToEthBridge.update({
                where: { id: baseBridgeDb.id },
                data: { status: BaseBridgeStatus.Burnt },
            });
            break;
    }
};
