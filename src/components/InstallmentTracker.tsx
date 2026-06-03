import { Fragment } from 'react'
import type { Installment } from '../types/bill'

interface InstallmentTrackerProps {
  installments: Installment[]
  onToggleInstallment: (month: string) => void
  totalAmount: number
}

function InstallmentTracker({ installments, onToggleInstallment, totalAmount }: InstallmentTrackerProps) {
  const paidCount = installments.filter((inst) => inst.paid).length
  const totalCount = installments.length
  const totalPaid = installments
    .filter((inst) => inst.paid)
    .reduce((sum, inst) => sum + inst.amount, 0)
  const progressPercent = totalCount > 0 ? (paidCount / totalCount) * 100 : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* ── Progress bar ── */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-1">
          还款进度 {paidCount}/{totalCount} 期
        </p>
        <div className="bg-gray-200 rounded-full h-2.5 w-full">
          <div
            className="bg-green-500 rounded-full h-2.5"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          已还{' '}
          <span style={{ color: '#16a34a' }}>¥{totalPaid.toFixed(2)}</span>
          {' / 共 '}
          <span style={{ color: '#2563eb' }}>¥{totalAmount.toFixed(2)}</span>
        </p>
      </div>

      {/* ── Installment list ── */}
      <div className="grid grid-cols-4 gap-2 text-sm text-center">
        {/* Header */}
        <div className="text-xs font-semibold text-gray-500 uppercase py-2">
          期数
        </div>
        <div className="text-xs font-semibold text-gray-500 uppercase py-2">
          还款日
        </div>
        <div className="text-xs font-semibold text-gray-500 uppercase py-2">
          金额
        </div>
        <div className="text-xs font-semibold text-gray-500 uppercase py-2">
          状态
        </div>

        {/* Rows */}
        {installments.map((inst, index) => {
          const rowBg = inst.paid ? 'bg-green-50/30' : 'bg-white'
          return (
            <Fragment key={inst.month}>
              <div
                className={`border-t border-gray-100 py-2 ${rowBg} hover:bg-gray-50`}
              >
                第{index + 1}期
              </div>
              <div
                className={`border-t border-gray-100 py-2 ${rowBg} hover:bg-gray-50`}
              >
                {inst.dueDate}
              </div>
              <div
                className={`border-t border-gray-100 py-2 ${rowBg} hover:bg-gray-50`}
              >
                ¥{inst.amount.toFixed(2)}
              </div>
              <div
                className={`border-t border-gray-100 py-2 ${rowBg} hover:bg-gray-50`}
              >
                {inst.paid ? (
                  <span className="inline-block px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">
                    ✓ 已还
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleInstallment(inst.month)}
                    className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer text-xs font-medium"
                  >
                    标记已还
                  </button>
                )}
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default InstallmentTracker
