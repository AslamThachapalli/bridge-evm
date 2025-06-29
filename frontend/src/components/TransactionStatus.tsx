import { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon, LoaderIcon } from "lucide-react";
import { type Transaction, useTransactions } from "./TransactionContext";

interface TransactionStatusProps {
    transaction: Transaction;
}

export const TransactionStatus = ({ transaction }: TransactionStatusProps) => {
    const { updateTransaction } = useTransactions();
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const steps = [
        {
            name: "Initiating Transaction",
            duration: 1000,
        },
        {
            name: "Confirming on Blockchain",
            duration: 2000,
        },
        {
            name: "Finalizing",
            duration: 2000,
        },
    ];

    useEffect(() => {
        const simulateProgress = async () => {
            let currentProgress = 0;
            for (let i = 0; i < steps.length; i++) {
                setCurrentStep(i);
                const step = steps[i];
                const increment = 1 / (step.duration / 100);
                const startTime = currentProgress;
                const endTime = i < steps.length - 1 ? startTime + 1 / 3 : 1;
                while (currentProgress < endTime) {
                    currentProgress = Math.min(
                        currentProgress + increment,
                        endTime
                    );
                    setProgress(currentProgress * 100);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            }
            // Update transaction status after completion
            updateTransaction(transaction.id, {
                status: "confirmed",
            });
        };
        simulateProgress();
    }, [transaction.id, updateTransaction]);

    const getStatusIcon = () => {
        if (progress < 100) {
            return (
                <LoaderIcon className="w-6 h-6 text-blue-500 animate-spin" />
            );
        } else if (transaction.status === "confirmed") {
            return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
        } else {
            return <XCircleIcon className="w-6 h-6 text-red-500" />;
        }
    };

    const getTransactionTypeText = () => {
        switch (transaction.type) {
            case "lock":
                return "Locking on Ethereum";
            case "mint":
                return "Minting on Base";
            case "burn":
                return "Burning on Base";
            case "unlock":
                return "Unlocking on Ethereum";
            default:
                return "Processing";
        }
    };

    const getGradientClass = () => {
        switch (transaction.type) {
            case "lock":
            case "unlock":
                return "from-blue-500 to-blue-700";
            case "mint":
            case "burn":
                return "from-purple-500 to-purple-700";
            default:
                return "from-blue-500 to-purple-600";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-800">
                    {getTransactionTypeText()}
                </h3>
                {getStatusIcon()}
            </div>
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                        className={`bg-gradient-to-r ${getGradientClass()} h-2 rounded-full transition-all duration-300`}
                        style={{
                            width: `${progress}%`,
                        }}
                    ></div>
                </div>
            </div>
            <div className="space-y-4 mt-6">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                index < currentStep
                                    ? "bg-green-500"
                                    : index === currentStep
                                    ? `bg-gradient-to-r ${getGradientClass()}`
                                    : "bg-gray-200"
                            }`}
                        >
                            {index < currentStep ? (
                                <CheckCircleIcon className="w-4 h-4 text-white" />
                            ) : (
                                <span className="text-xs text-white">
                                    {index + 1}
                                </span>
                            )}
                        </div>
                        <span
                            className={
                                index <= currentStep
                                    ? "text-gray-800"
                                    : "text-gray-400"
                            }
                        >
                            {step.name}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Transaction Hash:</span>
                    <span className="text-blue-600 font-medium">
                        {transaction.hash.substring(0, 6)}...
                        {transaction.hash.substring(
                            transaction.hash.length - 4
                        )}
                    </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Amount:</span>
                    <span className="font-medium">
                        {transaction.amount} ETH
                    </span>
                </div>
            </div>
        </div>
    );
};
