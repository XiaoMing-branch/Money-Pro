import type { Bill } from '../types/bill'
import { isOneTime, isRecurring } from '../types/bill'
import InstallmentTracker from './InstallmentTracker'

interface DateDetailPanelProps {
  selectedDate: string
  selectedDateBills: Bill[]
  onTogglePaid: (id: string) => void
  onToggleInstallment: (id: string, month: string) => void
}

function DateDetailPanel({
  selectedDate,
  selectedDateBills,
  onTogglePaid,
  onToggleInstallment,
}: DateDetailPanelProps) {
  const dateParts = selectedDate.split('-')

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="text-sm font-bold text-gray-500 mb-3">
        {parseInt(dateParts[1], 10)}月{parseInt(dateParts[2], 10)}日 账单明细
      </h3>

      {selectedDateBills.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">该日无账单</p>
      ) : (
        <div className="space-y-3">
          {selectedDateBills.map((bill) => {
            if (isOneTime(bill)) {
              return (
                <div
                  key={bill.id}
                  className="border border-gray-100 rounded-lg p-3"
                >
                  <p className="font-medium text-gray-900">{bill.name}</p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      bill.paid
                        ? 'text-gray-400 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    ¥{bill.amount.toFixed(2)}
                  </p>
                  <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer mt-2 select-none">
                    <input
                      type="checkbox"
                      checked={bill.paid}
                      onChange={() => onTogglePaid(bill.id)}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                    {bill.paid ? '已还清' : '未还款'}
                  </label>
                </div>
              )
            }

            if (isRecurring(bill)) {
              return (
                <div key={bill.id}>
                  <p className="font-medium text-gray-900 mb-2">{bill.name}</p>
                  <InstallmentTracker
                    installments={bill.installments}
                    onToggleInstallment={(month) =>
                      onToggleInstallment(bill.id, month)
                    }
                    totalAmount={bill.totalAmount}
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      )}
    </div>
  )
}

export default DateDetailPanel
