import { Router } from "express";

const router = Router();

// Return total unlockable amount & list of not unlocked burns
router.get("/pending/:address", async (req, res) => {});

// Called after unlock; stores unlockTxHash and maps to burns
router.post("/unlock", async (req, res) => {});

// Show burn + unlock history for user
router.post("/history/:address", async (req, res) => {});

export { router as baseToEthRouter };
