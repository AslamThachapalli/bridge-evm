/*
  Warnings:

  - You are about to drop the `BaseToEthBridge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EthToBaseBridge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "BaseToEthBridge";

-- DropTable
DROP TABLE "EthToBaseBridge";

-- DropEnum
DROP TYPE "BaseBridgeStatus";

-- DropEnum
DROP TYPE "ETHBridgeStatus";

-- CreateTable
CREATE TABLE "Locks" (
    "id" TEXT NOT NULL,
    "mintId" TEXT,
    "user" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mints" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Burns" (
    "id" TEXT NOT NULL,
    "unlockId" TEXT,
    "user" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Burns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unlocks" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Locks_txHash_key" ON "Locks"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "Mints_txHash_key" ON "Mints"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "Burns_txHash_key" ON "Burns"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "Unlocks_txHash_key" ON "Unlocks"("txHash");

-- AddForeignKey
ALTER TABLE "Locks" ADD CONSTRAINT "Locks_mintId_fkey" FOREIGN KEY ("mintId") REFERENCES "Mints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Burns" ADD CONSTRAINT "Burns_unlockId_fkey" FOREIGN KEY ("unlockId") REFERENCES "Unlocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
