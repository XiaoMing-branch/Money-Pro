import { useMemo } from 'react'
import type { Bill } from '../types/bill'
import { getDailyAverage, getMonthlyTotal } from '../utils/calculate'

interface MonthlyStatsProps {
  bills: Bill[]
  year: number
  month: number
}

function MonthlyStats({ bills, year, month }: MonthlyStatsProps) {
  const { pending, paid, dailyAvg } = useMemo(() => {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`
    const { pending, paid } = getMonthlyTotal(bills, yearMonth)
    const dailyAvg = getDailyAverage(bills, yearMonth)
    return { pending, paid, dailyAvg }
  }, [bills, year, month])

  if (pending === 0 && paid === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-500 mb-3">本月统计</h3>
        <p className="text-gray-400 text-sm text-center py-2">本月暂无账单</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="text-sm font-bold text-gray-500 mb-3">本月统计</h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-xs text-gray-400">待还总额</p>
          <p className="text-2xl font-bold text-blue-600">
            ¥{pending.toFixed(2)}
          </p>
        </div>
        <div className="border-r border-gray-200" />
        <div className="flex-1">
          <p className="text-xs text-gray-400">已还总额</p>
          <p className="text-2xl font-bold text-green-600">
            ¥{paid.toFixed(2)}
          </p>
        </div>
        <div className="border-r border-gray-200" />
        <div className="flex-1">
          <p className="text-xs text-gray-400">日均待还</p>
          <p className="text-2xl font-bold text-gray-600">
            ¥{dailyAvg.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MonthlyStats
