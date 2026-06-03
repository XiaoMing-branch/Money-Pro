import type { Bill } from '../types/bill'
import { isOneTime, isRecurring } from '../types/bill'
import { getBillsForDate } from '../utils/calculate'

interface DayCellProps {
  date: string
  isCurrentMonth: boolean
  bills: Bill[]
  onDateClick: (date: string) => void
}

interface BillItem {
  id: string
  name: string
  amount: number
  paid: boolean
}

function DayCell({ date, isCurrentMonth, bills, onDateClick }: DayCellProps) {
  const dayBills = getBillsForDate(bills, date)
  const dayNumber = date.split('-')[2]

  // Build display items for each bill due on this date
  const billItems: BillItem[] = []

  for (const bill of dayBills) {
    if (isOneTime(bill)) {
      billItems.push({
        id: bill.id,
        name: bill.name,
        amount: bill.amount,
        paid: bill.paid,
      })
    } else if (isRecurring(bill)) {
      // Find all installments matching this exact date
      const matchingInsts = bill.installments.filter(
        (inst) => inst.dueDate === date,
      )
      for (const inst of matchingInsts) {
        billItems.push({
          id: `${bill.id}-${inst.month}`,
          name: bill.name,
          amount: inst.amount,
          paid: inst.paid,
        })
      }
    }
  }

  const hasBills = billItems.length > 0

  const content = (
    <>
      {/* Day number */}
      <div className="text-sm font-medium text-gray-700 mb-1">
        {dayNumber.replace(/^0/, '')}
      </div>

      {/* Bill lines */}
      {hasBills && (
        <div className="space-y-0.5">
          {billItems.map((item) =>
            item.paid ? (
              <div key={item.id} className="text-xs text-gray-400 line-through">
                {item.name} 已还 ¥{item.amount.toFixed(2)}
              </div>
            ) : (
              <div key={item.id} className="text-xs text-blue-600 font-semibold">
                {item.name} ¥{item.amount.toFixed(2)}
              </div>
            ),
          )}
        </div>
      )}
    </>
  )

  if (!isCurrentMonth) {
    return (
      <div className="relative min-h-[80px] p-1.5 border border-gray-100 rounded-md bg-gray-50 text-gray-300">
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onDateClick(date)}
      className="relative min-h-[80px] p-1.5 border border-gray-100 rounded-md bg-white hover:bg-blue-50 cursor-pointer w-full text-left"
    >
      {content}
    </button>
  )
}

export default DayCell
