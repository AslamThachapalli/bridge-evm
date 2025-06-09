import { Chain } from "@prisma/client";
import { BRIDGE_BASE_ABI } from "contracts/bridgeBase";
import { BRIDGE_ETH_ABI } from "contracts/bridgeEth";
import { Contract, JsonRpcProvider, Interface, ContractEvent } from "ethers";
import prisma from "utils/prisma";
import { transferToken } from "utils/transferToken";
import {
    ethBridgeRpc,
    ethSepoliaRpc,
    baseBridgeRpc,
    baseSepoliaRpc,
} from "utils/constants";

export const listenToBridgeEvent = async (chain: Chain) => {
    let provider: JsonRpcProvider;
    let contract: Contract;
    let bridgeInterface: Interface;
    let filter: ContractEvent;

    switch (chain) {
        case "ETH":
            provider = new JsonRpcProvider(ethSepoliaRpc);
            contract = new Contract(ethBridgeRpc, BRIDGE_ETH_ABI, provider);
            bridgeInterface = new Interface(BRIDGE_ETH_ABI);
            filter = contract.filters.Deposit;

        case "BASE":
            provider = new JsonRpcProvider(baseSepoliaRpc);
            contract = new Contract(baseBridgeRpc, BRIDGE_BASE_ABI, provider);
            bridgeInterface = new Interface(BRIDGE_BASE_ABI);
            filter = contract.filters.Burn;
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
                lastProcessedBlock: 0,
            },
            select: { lastProcessedBlock: true },
        });
    }

    if (blockStatus.lastProcessedBlock >= latestBlock) return;

    const logs = await provider.getLogs({
        ...filter,
        fromBlock: blockStatus.lastProcessedBlock + 1,
        toBlock: latestBlock,
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
