import { Chain } from "@prisma/client";
import { BRIDGE_BASE_ABI } from "../contracts/bridgeBase";
import { BRIDGE_ETH_ABI } from "../contracts/bridgeEth";
import { Contract, formatEther, JsonRpcProvider, Wallet } from "ethers";
import prisma from "./prisma";
import {
    privateKey,
    ethBridgeAddress,
    ethSepoliaRpc,
    baseBridgeAddress,
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
            provider = new JsonRpcProvider(baseSepoliaRpc);
            wallet = new Wallet(privateKey, provider);
            contract = new Contract(baseBridgeAddress, BRIDGE_BASE_ABI, wallet);
            const baseTx = await contract.lockedOnOppositeChain(
                user,
                amount,
                nonce
            );
            await baseTx.wait();
            await prisma.locks.create({
                data: {
                    user,
                    amount: parseFloat(formatEther(amount)),
                    txHash,
                },
            });
            break;
        case "BASE":
            provider = new JsonRpcProvider(ethSepoliaRpc);
            wallet = new Wallet(privateKey, provider);
            contract = new Contract(ethBridgeAddress, BRIDGE_ETH_ABI, wallet);
            const ethTx = await contract.burnedOnOppositeChain(
                user,
                amount,
                nonce
            );
            await ethTx.wait();
            await prisma.burns.create({
                data: {
                    user,
                    amount: parseFloat(formatEther(amount)),
                    txHash,
                },
            });
            break;
    }
};
