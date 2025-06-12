import { Router } from "express";
import prisma from "utils/prisma";

const router = Router();

router.get("/hasLocked/:lockHash", async (req, res) => {
    let { lockHash } = req.params;

    const lock = await prisma.locks.findUnique({
        where: {
            txHash: lockHash,
        },
    });

    if (lock) {
        res.json({
            hasLocked: true,
        });
    } else {
        res.json({
            hasLocked: false,
        });
    }
});

// Return total mintable amount & list of unminted locks
router.get("/pending/:address", async (req, res) => {
    const { address } = req.params;

    const locks = await prisma.locks.findMany({
        where: {
            user: address,
            mintId: null,
        },
        select: {
            amount: true,
            id: true,
            txHash: true,
        },
    });

    const totalAmount = locks.reduce((sum, item) => sum + item.amount, 0);

    res.json({
        mintableAmount: totalAmount,
        unmintedLocks: locks.map((item) => ({
            id: item.id,
            amount: item.amount,
            tx: item.txHash,
        })),
    });
});

// Called after mint; stores mintTxHash and maps to locks
router.post("/mint", async (req, res) => {
    const { mintTxHash, user, lockIds, totalAmount } = req.body;

    const mint = await prisma.mints.create({
        data: {
            user,
            txHash: mintTxHash,
            amount: totalAmount,
        },
        select: {
            id: true,
        },
    });

    for (let id in lockIds) {
        await prisma.locks.update({
            where: {
                id,
            },
            data: {
                mintId: mint.id,
            },
        });
    }

    res.json({
        done: true,
    });
});

// Show lock + mint history for user
router.post("/history/:address", async (req, res) => {
    const { address } = req.params;
    const history = [];

    const unmintedLocks = await prisma.locks.findMany({
        where: {
            user: address,
            mintId: null,
        },
        select: {
            txHash: true,
            amount: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    for (let lock of unmintedLocks) {
        history.push({
            txHash: lock.txHash,
            action: "unminted",
            amount: lock.amount,
        });
    }

    const mints = await prisma.mints.findMany({
        where: {
            user: address,
        },
        include: {
            locks: {
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    amount: true,
                    txHash: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    for (let mint of mints) {
        history.push({
            txHash: mint.txHash,
            action: "mint",
            amount: mint.amount,
        });

        for (let lock of mint.locks) {
            history.push({
                txHash: lock.txHash,
                action: "lock",
                amount: lock.amount,
            });
        }
    }

    res.json({ history });
});

export { router as ethToBaseRouter };
