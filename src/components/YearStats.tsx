import { useMemo } from 'react'
import type { Bill } from '../types/bill'
import { getYearStats } from '../utils/calculate'

interface YearStatsProps {
  bills: Bill[]
  year: number
}

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
]

function YearStats({ bills, year }: YearStatsProps) {
  const { stats, yearTotal, yearPaidTotal, monthsWithBills } = useMemo(() => {
    const s = getYearStats(bills, year)
    let totalPending = 0
    let totalPaid = 0
    let activeMonths = 0

    for (const m of s) {
      totalPending += m.pending
      totalPaid += m.paid
      if (m.pending > 0 || m.paid > 0) {
        activeMonths++
      }
    }

    return {
      stats: s,
      yearTotal: totalPending,
      yearPaidTotal: totalPaid,
      monthsWithBills: activeMonths,
    }
  }, [bills, year])

  // Empty state – no bills at all this year
  if (yearTotal === 0 && yearPaidTotal === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">{year} 年度统计</h2>
        <div className="text-center py-12 text-gray-400">
          今年还没有录入任何账单
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Title */}
      <h2 className="text-xl font-bold mb-4">{year} 年度统计</h2>

      {/* Annual summary row */}
      <div className="flex gap-6 p-4 bg-gray-50 rounded-lg mb-4">
        <span>
          年度待还:{' '}
          <span className="text-blue-600 font-bold">
            ¥{yearTotal.toFixed(2)}
          </span>
        </span>
        <span>
          年度已还:{' '}
          <span className="text-green-600 font-bold">
            ¥{yearPaidTotal.toFixed(2)}
          </span>
        </span>
        <span className="text-gray-500">
          有账单月份: {monthsWithBills}/12
        </span>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {stats.map((s, index) => {
          const hasBills = s.pending > 0 || s.paid > 0
          // Thin bar color: blue if more pending, green if more paid, gray if none
          let barColor = 'bg-gray-300'
          if (hasBills) {
            barColor = s.pending > s.paid ? 'bg-blue-500' : 'bg-green-500'
          }

          return (
            <div
              key={s.month}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
              // onClick: could navigate to a detailed month view in the future
            >
              {/* Month name */}
              <div className="text-sm font-bold text-gray-700 mb-2">
                {monthNames[index]}
              </div>

              {hasBills ? (
                <>
                  <div className="text-blue-600 text-sm font-semibold">
                    待还: ¥{s.pending.toFixed(2)}
                  </div>
                  <div className="text-green-600 text-sm">
                    已还: ¥{s.paid.toFixed(2)}
                  </div>
                  {/* Visual indicator bar */}
                  <div className={`mt-2 h-1 rounded ${barColor}`} />
                </>
              ) : (
                <div className="text-xs text-gray-400 italic">无账单</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default YearStats
