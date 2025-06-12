import { Router } from "express";

const router= Router();

// Return total mintable amount & list of unminted locks
router.get("/pending/:address", async (req, res) => {});

// Called after mint; stores mintTxHash and maps to locks
router.post("/mint", async (req, res) => {});

// Show lock + mint history for user
router.post("/history/:address", async (req, res) => {});

export { router as ethToBaseRouter }