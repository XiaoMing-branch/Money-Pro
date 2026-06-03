import { useState, useMemo } from 'react'
import type { Bill } from '../types/bill'
import DayCell from './DayCell'

interface CalendarProps {
  year: number
  month: number
  bills: Bill[]
  onDateClick: (date: string) => void
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

function Calendar({ year: initialYear, month: initialMonth, bills, onDateClick }: CalendarProps) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)

  const { calendarDays } = useMemo(() => {
    // 0=Sun, 1=Mon, ..., 6=Sat (standard JavaScript)
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

    // Convert to Monday-starting offset (Mon=0, Tue=1, ..., Sun=6)
    const mondayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    const days: { date: string; isCurrentMonth: boolean }[] = []

    // Padding from previous month
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      days.push({
        date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isCurrentMonth: true,
      })
    }

    // Padding from next month to complete the last row
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const remaining = days.length % 7
    if (remaining > 0) {
      const padCount = 7 - remaining
      for (let day = 1; day <= padCount; day++) {
        days.push({
          date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          isCurrentMonth: false,
        })
      }
    }

    return { calendarDays: days }
  }, [year, month])

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div className="rounded-xl bg-white shadow-sm p-4">
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="text-gray-400 hover:text-blue-600 text-2xl leading-none cursor-pointer"
          aria-label="上个月"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-center select-none">
          {year}年{month}月
        </h2>
        <button
          type="button"
          onClick={goToNextMonth}
          className="text-gray-400 hover:text-blue-600 text-2xl leading-none cursor-pointer"
          aria-label="下个月"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-sm text-gray-400 text-center py-2 select-none">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map(({ date, isCurrentMonth }) => (
          <DayCell
            key={date}
            date={date}
            isCurrentMonth={isCurrentMonth}
            bills={bills}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  )
}

export default Calendar
