-- CreateEnum
CREATE TYPE "ETHBridgeStatus" AS ENUM ('Initiated', 'Locked', 'Minted');

-- CreateEnum
CREATE TYPE "BaseBridgeStatus" AS ENUM ('Initiated', 'Burnt', 'Unlocked');

-- CreateTable
CREATE TABLE "EthToBaseBridge" (
    "id" TEXT NOT NULL,
    "depositor" TEXT NOT NULL,
    "lockTxHash" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "mintTxHash" TEXT,
    "status" "ETHBridgeStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EthToBaseBridge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseToEthBridge" (
    "id" TEXT NOT NULL,
    "burner" TEXT NOT NULL,
    "burnTxHash" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "unlockTxHash" TEXT,
    "status" "BaseBridgeStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaseToEthBridge_pkey" PRIMARY KEY ("id")
);
