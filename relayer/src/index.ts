import { Chain, ETHBridgeStatus } from "@prisma/client";
import { BRIDGE_ETH_ABI } from "contracts/bridgeEth";
import "dotenv/config";
import { Contract, JsonRpcProvider, Interface, Wallet } from "ethers";
import prisma from "utils/prisma";

const provider = new JsonRpcProvider(process.env.ETH_SEPOLIA_RPC);

const contract = new Contract(
    process.env.ETH_BRIDGE_CONTRACT_ADDRESS!,
    BRIDGE_ETH_ABI,
    provider
);

const bridgeInterface = new Interface(BRIDGE_ETH_ABI);

const listenToBridgeEvent = async () => {
    let latestBlock = await provider.getBlockNumber();

    let blockStatus = await prisma.blockStatus.findUnique({
        where: { chain: Chain.ETH },
        select: { lastProcessedBlock: true },
    });

    if (!blockStatus) {
        blockStatus = await prisma.blockStatus.create({
            data: {
                chain: Chain.ETH,
                lastProcessedBlock: 0,
            },
            select: { lastProcessedBlock: true },
        });
    }

    if (blockStatus.lastProcessedBlock >= latestBlock) return;

    const deposits = contract.filters.Deposit;
    const logs = await provider.getLogs({
        ...deposits,
        fromBlock: blockStatus.lastProcessedBlock + 1,
        toBlock: latestBlock,
    });

    for (let log of logs) {
        let parsedLog = bridgeInterface.parseLog(log);

        let txHash = log.transactionHash;
        let depositor = parsedLog?.args[0].toString();
        let amount = parsedLog?.args[1].toString();
        let nonce = parseInt(parsedLog?.args[2].toString(), 10);

        const bridgeDb = await prisma.ethToBaseBridge.create({
            data: {
                depositor,
                amount,
                lockTxHash: txHash,
                status: ETHBridgeStatus.Initiated,
            },
            select: { id: true },
        });

        const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);
        const contractInstance = new Contract(
            process.env.BASE_BRIDGE_CONTRACT_ADDRESS!,
            BRIDGE_ETH_ABI,
            wallet
        );
        const tx = await contractInstance.lockedOnOppositeChain(
            depositor,
            amount,
            nonce
        );
        await tx.wait();

        await prisma.ethToBaseBridge.update({
            where: { id: bridgeDb.id },
            data: { status: ETHBridgeStatus.Locked },
        });
    }

    await prisma.blockStatus.update({
        where: { chain: Chain.ETH },
        data: { lastProcessedBlock: latestBlock },
    });
};
