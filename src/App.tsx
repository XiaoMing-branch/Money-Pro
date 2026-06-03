import { useState } from 'react'
import type { Bill, BillFormData } from './types/bill'
import { getBillsForDate } from './utils/calculate'
import { useBills } from './hooks/useBills'
import Calendar from './components/Calendar'
import BillForm from './components/BillForm'
import BillList from './components/BillList'
import EmptyState from './components/EmptyState'
import MonthlyStats from './components/MonthlyStats'
import YearStats from './components/YearStats'
import ErrorBoundary from './components/ErrorBoundary'
import DateDetailPanel from './components/DateDetailPanel'

function App() {
  const { bills, addBill, updateBill, deleteBill, togglePaid, toggleInstallment } =
    useBills()

  const [billFormOpen, setBillFormOpen] = useState(false)
  const [editBill, setEditBill] = useState<Bill | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentYear] = useState(new Date().getFullYear())
  const [currentMonth] = useState(new Date().getMonth() + 1)
  const [activeTab, setActiveTab] = useState<'calendar' | 'yearStats'>('calendar')

  const handleDateClick = (date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date))
  }

  const handleEdit = (bill: Bill) => {
    setEditBill(bill)
    setBillFormOpen(true)
  }

  const handleFormSubmit = (data: BillFormData) => {
    if (editBill !== null) {
      updateBill(editBill.id, data)
    } else {
      addBill(data)
    }
    setBillFormOpen(false)
    setEditBill(null)
  }

  const handleFormClose = () => {
    setBillFormOpen(false)
    setEditBill(null)
  }

  // ---- Derived data -------------------------------------------------------

  const selectedDateBills = selectedDate !== null ? getBillsForDate(bills, selectedDate) : []

  // ---- Render -------------------------------------------------------------

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* ── Top Navigation Bar ── */}
        <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">欠款账单日历</h1>

            <div className="flex items-center gap-3">
              {/* Tab switches */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    activeTab === 'calendar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setActiveTab('calendar')}
                >
                  日历视图
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    activeTab === 'yearStats'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setActiveTab('yearStats')}
                >
                  年度统计
                </button>
              </div>

              {/* New bill button */}
              <button
                type="button"
                onClick={() => {
                  setEditBill(null)
                  setBillFormOpen(true)
                }}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 cursor-pointer transition-colors"
              >
                新建账单
              </button>
            </div>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main>
          {activeTab === 'calendar' ? (
            bills.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="flex gap-6 p-6 max-w-7xl mx-auto">
                {/* Left column */}
                <div className="flex-1 space-y-4">
                  <Calendar
                    year={currentYear}
                    month={currentMonth}
                    bills={bills}
                    onDateClick={handleDateClick}
                  />
                  <MonthlyStats
                    bills={bills}
                    year={currentYear}
                    month={currentMonth}
                  />
                </div>

                {/* Right column */}
                <div className="w-80 space-y-4">
                  <BillList
                    bills={bills}
                    onEdit={handleEdit}
                    onDelete={deleteBill}
                    onTogglePaid={togglePaid}
                  />

                  {/* Date detail panel */}
                  {selectedDate !== null && (
                    <DateDetailPanel
                      selectedDate={selectedDate}
                      selectedDateBills={selectedDateBills}
                      onTogglePaid={togglePaid}
                      onToggleInstallment={toggleInstallment}
                    />
                  )}
                </div>
              </div>
            )
          ) : (
            /* Year Stats tab */
            <div className="p-6 max-w-4xl mx-auto">
              <YearStats bills={bills} year={currentYear} />
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer transition-colors"
                >
                  ← 返回日历视图
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── BillForm Modal ── */}
        <BillForm
          open={billFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          editBill={editBill}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
