import { useState, createContext, useContext } from "react";
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
    // Added to track related transactions
    relatedTxId?: string;
}

interface TransactionContextType {
    transactions: Transaction[];
    addTransaction: (
        transaction: Omit<Transaction, "id" | "timestamp">
    ) => Transaction;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    pendingTransaction: Transaction | null;
    setPendingTransaction: (tx: Transaction | null) => void;
    getPendingLocks: () => Transaction[];
    getPendingBurns: () => Transaction[];
    batchMint: (txIds: string[]) => void;
    batchUnlock: (txIds: string[]) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
    undefined
);

export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: "tx1",
            type: "lock",
            fromChain: "ethereum",
            toChain: "base",
            amount: "0.5",
            status: "confirmed",
            hash: "0x1234...5678",
            timestamp: Date.now() - 3600000,
        },
        {
            id: "tx2",
            type: "mint",
            fromChain: "ethereum",
            toChain: "base",
            amount: "0.5",
            status: "confirmed",
            hash: "0xabcd...efgh",
            timestamp: Date.now() - 3500000,
            relatedTxId: "tx1",
        },
        {
            id: "tx3",
            type: "burn",
            fromChain: "base",
            toChain: "ethereum",
            amount: "0.25",
            status: "confirmed",
            hash: "0x8765...4321",
            timestamp: Date.now() - 1800000,
        },
        {
            id: "tx4",
            type: "lock",
            fromChain: "ethereum",
            toChain: "base",
            amount: "0.75",
            status: "confirmed",
            hash: "0xdef0...1234",
            timestamp: Date.now() - 1200000,
        },
    ]);
    const [pendingTransaction, setPendingTransaction] =
        useState<Transaction | null>(null);
    const addTransaction = (
        transaction: Omit<Transaction, "id" | "timestamp">
    ) => {
        const newTx = {
            ...transaction,
            id: `tx${transactions.length + 1}-${Date.now()}`,
            timestamp: Date.now(),
        };
        setTransactions((prev) => [newTx, ...prev]);
        return newTx;
    };
    const updateTransaction = (id: string, updates: Partial<Transaction>) => {
        setTransactions((prev) =>
            prev.map((tx) =>
                tx.id === id
                    ? {
                          ...tx,
                          ...updates,
                      }
                    : tx
            )
        );
    };
    // Get pending locks (confirmed locks without related mint transactions)
    const getPendingLocks = () => {
        const confirmedLocks = transactions.filter(
            (tx) => tx.type === "lock" && tx.status === "confirmed"
        );
        return confirmedLocks.filter((lock) => {
            const hasMint = transactions.some(
                (tx) => tx.type === "mint" && tx.relatedTxId === lock.id
            );
            return !hasMint;
        });
    };
    // Get pending burns (confirmed burns without related unlock transactions)
    const getPendingBurns = () => {
        const confirmedBurns = transactions.filter(
            (tx) => tx.type === "burn" && tx.status === "confirmed"
        );
        return confirmedBurns.filter((burn) => {
            const hasUnlock = transactions.some(
                (tx) => tx.type === "unlock" && tx.relatedTxId === burn.id
            );
            return !hasUnlock;
        });
    };
    // Batch mint for multiple locks
    const batchMint = (txIds: string[]) => {
        const locksToMint = transactions.filter((tx) => txIds.includes(tx.id));
        // Create a single mint transaction for all the locks
        const totalAmount = locksToMint.reduce((sum, tx) => {
            return parseFloat(sum) + parseFloat(tx.amount) + "";
        }, "0");
        const mintTx = addTransaction({
            type: "mint",
            fromChain: "ethereum",
            toChain: "base",
            amount: totalAmount,
            status: "pending",
            hash: `0x${Math.random().toString(16).substr(2, 40)}`,
            // We could store all relatedTxIds, but for simplicity we'll just store the first one
            relatedTxId: txIds[0],
        });
        setPendingTransaction(mintTx);
        // Simulate transaction confirmation after delay
        setTimeout(() => {
            updateTransaction(mintTx.id, {
                status: "confirmed",
            });
            setPendingTransaction(null);
        }, 5000);
    };
    // Batch unlock for multiple burns
    const batchUnlock = (txIds: string[]) => {
        const burnsToUnlock = transactions.filter((tx) =>
            txIds.includes(tx.id)
        );
        // Create a single unlock transaction for all the burns
        const totalAmount = burnsToUnlock.reduce((sum, tx) => {
            return parseFloat(sum) + parseFloat(tx.amount) + "";
        }, "0");
        const unlockTx = addTransaction({
            type: "unlock",
            fromChain: "base",
            toChain: "ethereum",
            amount: totalAmount,
            status: "pending",
            hash: `0x${Math.random().toString(16).substr(2, 40)}`,
            // We could store all relatedTxIds, but for simplicity we'll just store the first one
            relatedTxId: txIds[0],
        });
        setPendingTransaction(unlockTx);
        // Simulate transaction confirmation after delay
        setTimeout(() => {
            updateTransaction(unlockTx.id, {
                status: "confirmed",
            });
            setPendingTransaction(null);
        }, 5000);
    };
    return (
        <TransactionContext.Provider
            value={{
                transactions,
                addTransaction,
                updateTransaction,
                pendingTransaction,
                setPendingTransaction,
                getPendingLocks,
                getPendingBurns,
                batchMint,
                batchUnlock,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};
export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (context === undefined) {
        throw new Error(
            "useTransactions must be used within a TransactionProvider"
        );
    }
    return context;
};
