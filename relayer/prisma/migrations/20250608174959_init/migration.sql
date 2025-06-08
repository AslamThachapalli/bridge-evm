-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('ETH', 'BASE');

-- CreateTable
CREATE TABLE "BlockStatus" (
    "id" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "lastProcessedBlock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockStatus_chain_key" ON "BlockStatus"("chain");
