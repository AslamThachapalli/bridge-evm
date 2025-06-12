import { Router } from "express";
import prisma from "utils/prisma";

const router = Router();

router.get("/hasBurnt/:burnHash", async (req, res) => {
    let { burnHash } = req.params;

    const lock = await prisma.burns.findUnique({
        where: {
            txHash: burnHash,
        },
    });

    if (lock) {
        res.json({
            hasBurnt: true,
        });
    } else {
        res.json({
            hasBurnt: false,
        });
    }
});

// Return total unlockable amount & list of not unlocked burns
router.get("/pending/:address", async (req, res) => {
    const { address } = req.params;

    const burns = await prisma.burns.findMany({
        where: {
            user: address,
            unlockId: null,
        },
        select: {
            amount: true,
            id: true,
            txHash: true,
        },
    });

    const totalAmount = burns.reduce((sum, item) => sum + item.amount, 0);

    res.json({
        unlockableAmount: totalAmount,
        pendingBurns: burns.map((item) => ({
            id: item.id,
            amount: item.amount,
            tx: item.txHash,
        })),
    });
});

// Called after unlock; stores unlockTxHash and maps to burns
router.post("/unlock", async (req, res) => {
    const { unlockTxHash, user, burnIds, totalAmount } = req.body;

    const unlock = await prisma.unlocks.create({
        data: {
            user,
            txHash: unlockTxHash,
            amount: totalAmount,
        },
        select: {
            id: true,
        },
    });

    for (let id in burnIds) {
        await prisma.burns.update({
            where: {
                id,
            },
            data: {
                unlockId: unlock.id,
            },
        });
    }

    res.json({
        done: true,
    });
});

// Show burn + unlock history for user
router.post("/history/:address", async (req, res) => {
    const { address } = req.params;
    const history = [];

    const lockedBurns = await prisma.burns.findMany({
        where: {
            user: address,
            unlockId: null,
        },
        select: {
            txHash: true,
            amount: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    for (let burn of lockedBurns) {
        history.push({
            txHash: burn.txHash,
            action: "locked",
            amount: burn.amount,
        });
    }

    const unlocks = await prisma.unlocks.findMany({
        where: {
            user: address,
        },
        include: {
            burns: {
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

    for (let unlock of unlocks) {
        history.push({
            txHash: unlock.txHash,
            action: "unlock",
            amount: unlock.amount,
        });

        for (let burn of unlock.burns) {
            history.push({
                txHash: burn.txHash,
                action: "burn",
                amount: burn.amount,
            });
        }
    }

    res.json({ history });
});

export { router as baseToEthRouter };
