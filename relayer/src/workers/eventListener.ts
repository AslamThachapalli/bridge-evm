import { Chain } from "@prisma/client";
import { BRIDGE_BASE_ABI } from "../contracts/bridgeBase";
import { BRIDGE_ETH_ABI } from "../contracts/bridgeEth";
import { JsonRpcProvider, Interface, id } from "ethers";
import prisma from "../utils/prisma";
import { transferToken } from "../utils/transferToken";
import {
    ethBridgeAddress,
    ethSepoliaRpc,
    baseBridgeAddress,
    baseSepoliaRpc,
} from "../utils/constants";

export const listenToBridgeEvent = async (chain: Chain) => {
    console.log("Listening to bridge event for chain", chain);
    let provider: JsonRpcProvider;
    let bridgeInterface: Interface;
    let filter;

    switch (chain) {
        case "ETH":
            provider = new JsonRpcProvider(ethSepoliaRpc);
            bridgeInterface = new Interface(BRIDGE_ETH_ABI);
            filter = {
                address: ethBridgeAddress,
                topics: [id("Deposit(address,uint256,uint256)")],
            };
            break;
        case "BASE":
            provider = new JsonRpcProvider(baseSepoliaRpc);
            bridgeInterface = new Interface(BRIDGE_BASE_ABI);
            filter = {
                address: baseBridgeAddress,
                topics: [id("Burn(address,uint256,uint256)")],
            };
            break;
    }

    let latestBlock = await provider.getBlockNumber();

    let blockStatus = await prisma.blockStatus.findUnique({
        where: { chain },
        select: { lastProcessedBlock: true },
    });

    if (!blockStatus) {
        blockStatus = await prisma.blockStatus.create({
            data: {
                chain,
                lastProcessedBlock: latestBlock,
            },
            select: { lastProcessedBlock: true },
        });
    }

    if (blockStatus.lastProcessedBlock >= latestBlock) return;

    // Since free tier rpc urls are limited to 10 blocks at a time, we listen to latest 10 blocks if there are more blocks to process.
    // This works here just because this is a demo project.
    // This is not the ideal way to do it in a production system. For that we must process it in chunks.
    let fromBlock =
        latestBlock - blockStatus.lastProcessedBlock >= 10
            ? latestBlock - 9
            : blockStatus.lastProcessedBlock + 1;

    const logs = await provider.getLogs({
        ...filter,
        fromBlock,
        toBlock: "latest",
    });

    for (let log of logs) {
        let parsedLog = bridgeInterface.parseLog(log);

        let txHash = log.transactionHash;
        let user = parsedLog?.args[0].toString();
        let amount = parsedLog?.args[1].toString();
        let nonce = parseInt(parsedLog?.args[2].toString(), 10);

        transferToken({ chain, txHash, user, amount, nonce });
    }

    await prisma.blockStatus.update({
        where: { chain },
        data: { lastProcessedBlock: latestBlock },
    });
};
