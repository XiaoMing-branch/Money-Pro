import type { Bill, OneTimeBill, RecurringBill } from '../types/bill'
import { isOneTime, isRecurring } from '../types/bill'

interface BillListProps {
  bills: Bill[]
  onEdit: (bill: Bill) => void
  onDelete: (id: string) => void
  onTogglePaid: (id: string) => void
}

function sortOneTime(list: OneTimeBill[]): OneTimeBill[] {
  return [...list].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1
    return a.dueDate.localeCompare(b.dueDate)
  })
}

function sortRecurring(list: RecurringBill[]): RecurringBill[] {
  return [...list].sort((a, b) => {
    const aAllPaid = a.installments.every((i) => i.paid)
    const bAllPaid = b.installments.every((i) => i.paid)
    if (aAllPaid !== bAllPaid) return aAllPaid ? 1 : -1

    const aDue =
      a.installments.find((i) => !i.paid)?.dueDate ??
      a.installments[0]?.dueDate ??
      ''
    const bDue =
      b.installments.find((i) => !i.paid)?.dueDate ??
      b.installments[0]?.dueDate ??
      ''
    return aDue.localeCompare(bDue)
  })
}

function BillList({ bills, onEdit, onDelete, onTogglePaid }: BillListProps) {
  const oneTimeBills = bills.filter(isOneTime)
  const recurringBills = bills.filter(isRecurring)

  const sortedOneTime = sortOneTime(oneTimeBills)
  const sortedRecurring = sortRecurring(recurringBills)

  const handleDelete = (bill: Bill) => {
    if (window.confirm(`确定要删除「${bill.name}」吗？`)) {
      onDelete(bill.id)
    }
  }

  if (bills.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">暂无账单数据</p>
          <p className="text-gray-300 text-sm mt-2">点击「新建账单」开始记录</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* One-time bills */}
      {sortedOneTime.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
            单次账单
          </h3>
          {sortedOneTime.map((bill) => (
            <div
              key={bill.id}
              className="border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{bill.name}</span>
                  <span className="bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 text-xs">
                    单次
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                    onClick={() => onEdit(bill)}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                    onClick={() => handleDelete(bill)}
                  >
                    删除
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="mt-2 space-y-1">
                <p
                  className={`text-lg ${
                    bill.paid
                      ? 'text-gray-400 line-through'
                      : 'font-bold text-gray-900'
                  }`}
                >
                  金额: ¥{bill.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  还款日: {bill.dueDate}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bill.paid}
                      onChange={() => onTogglePaid(bill.id)}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                    {bill.paid ? '已还清' : '未还款'}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recurring bills */}
      {sortedRecurring.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
            分期账单
          </h3>
          {sortedRecurring.map((bill) => {
            const paidCount = bill.installments.filter((i) => i.paid).length
            const totalCount = bill.installmentCount
            const progressPercent =
              totalCount > 0 ? (paidCount / totalCount) * 100 : 0

            return (
              <div
                key={bill.id}
                className="border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {bill.name}
                    </span>
                    <span className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-xs">
                      分期
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                      onClick={() => onEdit(bill)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                      onClick={() => handleDelete(bill)}
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="mt-2 space-y-1">
                  <p className="text-lg font-bold text-gray-900">
                    总金额: ¥{bill.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    分期: {paidCount}/{totalCount}期
                  </p>
                  <p className="text-sm text-gray-500">
                    每月还款日: 每月{bill.paymentDay}日
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      已还 {paidCount}/{totalCount}期
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BillList
