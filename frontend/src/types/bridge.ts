export type ChainType = "ethereum" | "base";
export type TransactionType = "lock" | "mint" | "burn" | "unlock";
export type TransactionStatus = "pending" | "confirmed" | "failed";

export interface Transaction {
    id: string;
    type: TransactionType;
    fromChain: ChainType;
    toChain: ChainType;
    amount: string;
    status: TransactionStatus;
    hash: string;
    timestamp: number;
    relatedTxId?: string;
}

export interface PendingLock {
    id: string;
    amount: number;
    tx: string;
}

export interface PendingBurn {
    id: string;
    amount: number;
    tx: string;
}

export interface PendingMintsResponse {
    mintableAmount: number;
    pendingLocks: PendingLock[];
}

export interface PendingUnlocksResponse {
    unlockableAmount: number;
    pendingBurns: PendingBurn[];
}
