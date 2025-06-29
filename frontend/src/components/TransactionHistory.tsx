import { useState } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  SearchIcon,
} from 'lucide-react'
import { useTransactions, type ChainType, type Transaction } from './TransactionContext'
export const TransactionHistory = () => {
  const { transactions } = useTransactions()
  const [activeFilter, setActiveFilter] = useState<ChainType | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const filteredTransactions = transactions.filter(
    (tx) =>
      (activeFilter === 'all' ||
        tx.fromChain === activeFilter ||
        tx.toChain === activeFilter) &&
      (searchTerm === '' ||
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.includes(searchTerm)),
  )
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Transaction History
      </h2>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex space-x-2">
          <FilterButton
            label="All"
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          />
          <FilterButton
            label="Ethereum"
            active={activeFilter === 'ethereum'}
            onClick={() => setActiveFilter('ethereum')}
          />
          <FilterButton
            label="Base"
            active={activeFilter === 'base'}
            onClick={() => setActiveFilter('base')}
          />
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by hash or amount"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">
              No transactions found
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? 'Try adjusting your search term'
                : activeFilter !== 'all'
                  ? `No transactions for ${activeFilter} chain`
                  : 'Start bridging to see your transactions here'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
interface FilterButtonProps {
  label: string
  active: boolean
  onClick: () => void
}
const FilterButton = ({ label, active, onClick }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-sm rounded-md transition-colors ${active ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
  >
    {label}
  </button>
)
interface TransactionCardProps {
  transaction: Transaction
}
const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }
  const getTransactionTypeLabel = () => {
    switch (transaction.type) {
      case 'lock':
        return 'Lock'
      case 'mint':
        return 'Mint'
      case 'burn':
        return 'Burn'
      case 'unlock':
        return 'Unlock'
      default:
        return 'Transfer'
    }
  }
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  const getChainColor = (chain: ChainType) => {
    return chain === 'ethereum'
      ? {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
        }
      : {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
        }
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 font-medium text-gray-800">
            {getTransactionTypeLabel()}
          </span>
          {transaction.relatedTxId && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              Related
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {formatTime(transaction.timestamp)}
        </span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div
            className={`w-6 h-6 ${getChainColor(transaction.fromChain).bg} rounded-full flex items-center justify-center`}
          >
            <span
              className={`text-xs ${getChainColor(transaction.fromChain).text}`}
            >
              {transaction.fromChain === 'ethereum' ? 'E' : 'B'}
            </span>
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {transaction.fromChain === 'ethereum' ? 'Ethereum' : 'Base'}
          </span>
        </div>
        <ArrowRightIcon className="w-4 h-4 text-gray-400" />
        <div className="flex items-center">
          <div
            className={`w-6 h-6 ${getChainColor(transaction.toChain).bg} rounded-full flex items-center justify-center`}
          >
            <span
              className={`text-xs ${getChainColor(transaction.toChain).text}`}
            >
              {transaction.toChain === 'ethereum' ? 'E' : 'B'}
            </span>
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {transaction.toChain === 'ethereum' ? 'Ethereum' : 'Base'}
          </span>
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Amount</span>
        <span className="font-medium">{transaction.amount} ETH</span>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>
          Hash: {transaction.hash.substring(0, 6)}...
          {transaction.hash.substring(transaction.hash.length - 4)}
        </span>
        <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
