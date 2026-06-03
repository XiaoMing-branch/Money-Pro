import { useState, useEffect } from 'react'
import type React from 'react'
import type { Bill, BillFormData } from '../types/bill'
import { isOneTime, isRecurring } from '../types/bill'

interface BillFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: BillFormData) => void
  editBill?: Bill | null
}

const BillForm: React.FC<BillFormProps> = ({ open, onClose, onSubmit, editBill }) => {
  const isEditing = editBill != null

  const [billType, setBillType] = useState<'one-time' | 'recurring'>('one-time')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [installmentCount, setInstallmentCount] = useState('')
  const [paymentDay, setPaymentDay] = useState('')
  const [startMonth, setStartMonth] = useState('')
  const [error, setError] = useState('')

  // Pre-fill fields when editing
  useEffect(() => {
    if (editBill) {
      setName(editBill.name)
      if (isOneTime(editBill)) {
        setBillType('one-time')
        setAmount(String(editBill.amount))
        setDueDate(editBill.dueDate)
        setTotalAmount('')
        setInstallmentCount('')
        setPaymentDay('')
        setStartMonth('')
      } else if (isRecurring(editBill)) {
        setBillType('recurring')
        setTotalAmount(String(editBill.totalAmount))
        setInstallmentCount(String(editBill.installmentCount))
        setPaymentDay(String(editBill.paymentDay))
        setStartMonth(editBill.startMonth)
        setAmount('')
        setDueDate('')
      }
    } else {
      setBillType('one-time')
      setName('')
      setAmount('')
      setDueDate('')
      setTotalAmount('')
      setInstallmentCount('')
      setPaymentDay('')
      setStartMonth('')
      setError('')
    }
  }, [editBill])

  // Reset form when modal opens for adding
  useEffect(() => {
    if (open && !editBill) {
      setBillType('one-time')
      setName('')
      setAmount('')
      setDueDate('')
      setTotalAmount('')
      setInstallmentCount('')
      setPaymentDay('')
      setStartMonth('')
      setError('')
    }
  }, [open, editBill])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('账单名称不能为空')
      return
    }

    if (billType === 'one-time') {
      const amountNum = parseFloat(amount)
      if (Number.isNaN(amountNum) || amountNum <= 0) {
        setError('金额必须大于 0')
        return
      }
      if (!dueDate) {
        setError('请选择还款日期')
        return
      }
      const data: BillFormData = {
        type: 'one-time',
        name: trimmedName,
        amount: amountNum,
        dueDate,
      }
      onSubmit(data)
    } else {
      const totalAmountNum = parseFloat(totalAmount)
      const installmentCountNum = parseInt(installmentCount, 10)
      const paymentDayNum = parseInt(paymentDay, 10)

      if (Number.isNaN(totalAmountNum) || totalAmountNum <= 0) {
        setError('总金额必须大于 0')
        return
      }
      if (Number.isNaN(installmentCountNum) || installmentCountNum < 1 || installmentCountNum > 60) {
        setError('分期月数必须在 1-60 之间')
        return
      }
      if (Number.isNaN(paymentDayNum) || paymentDayNum < 1 || paymentDayNum > 28) {
        setError('每月还款日必须在 1-28 之间')
        return
      }
      if (!startMonth) {
        setError('请选择起始月份')
        return
      }
      const data: BillFormData = {
        type: 'recurring',
        name: trimmedName,
        totalAmount: totalAmountNum,
        installmentCount: installmentCountNum,
        paymentDay: paymentDayNum,
        startMonth,
      }
      onSubmit(data)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="document"
        tabIndex={-1}
      >
        <h2 className="text-lg font-bold mb-4">
          {isEditing ? '编辑账单' : '新建账单'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Bill type selector — disabled when editing */}
          {!isEditing && (
            <div className="flex mb-4">
              <button
                type="button"
                className={`flex-1 py-2 text-sm rounded-l-lg cursor-pointer transition-colors ${
                  billType === 'one-time'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => {
                  setBillType('one-time')
                  setError('')
                }}
              >
                单次账单
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm rounded-r-lg cursor-pointer transition-colors ${
                  billType === 'recurring'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => {
                  setBillType('recurring')
                  setError('')
                }}
              >
                分期账单
              </button>
            </div>
          )}

          {/* Editing indicator — show current type when editing */}
          {isEditing && (
            <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500">
              {billType === 'one-time' ? '单次账单' : '分期账单'}
            </div>
          )}

          {/* Common field: 账单名称 */}
          <div className="mb-4">
            <label htmlFor="bill-name" className="block text-sm font-medium text-gray-700 mb-1">
              账单名称 <span className="text-red-500">*</span>
            </label>
            <input
              id="bill-name"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              required
            />
          </div>

          {/* One-time fields */}
          {billType === 'one-time' && (
            <>
              <div className="mb-4">
                <label htmlFor="bill-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  金额 <span className="text-red-500">*</span>
                </label>
                <input
                  id="bill-amount"
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="请输入金额"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setError('')
                  }}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="bill-due-date" className="block text-sm font-medium text-gray-700 mb-1">
                  还款日期 <span className="text-red-500">*</span>
                </label>
                <input
                  id="bill-due-date"
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value)
                    setError('')
                  }}
                />
              </div>
            </>
          )}

          {/* Recurring fields */}
          {billType === 'recurring' && (
            <>
              <div className="mb-4">
                <label htmlFor="bill-total-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  总金额 <span className="text-red-500">*</span>
                </label>
                <input
                  id="bill-total-amount"
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={totalAmount}
                  onChange={(e) => {
                    setTotalAmount(e.target.value)
                    setError('')
                  }}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="bill-installment-count" className="block text-sm font-medium text-gray-700 mb-1">
                  分期月数 <span className="text-red-500">*</span>
                </label>
                <input
                  id="bill-installment-count"
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={installmentCount}
                  onChange={(e) => {
                    setInstallmentCount(e.target.value)
                    setError('')
                  }}
                  min="1"
                  max="60"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="bill-payment-day" className="block text-sm font-medium text-gray-700 mb-1">
                  每月还款日 <span className="text-red-500">*</span>
                </label>
                <input
                  id="bill-payment-day"
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={paymentDay}
                  onChange={(e) => {
                    setPaymentDay(e.target.value)
                    setError('')
                  }}
                  min="1"
                  max="28"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="bill-start-month" className="block text-sm font-medium text-gray-700 mb-1">
                  起始月份 <span className="text-red-500">*</span>
                </label>
                <input
                  id="bill-start-month"
                  type="month"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={startMonth}
                  onChange={(e) => {
                    setStartMonth(e.target.value)
                    setError('')
                  }}
                />
              </div>
            </>
          )}

          {/* Validation error */}
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm cursor-pointer bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={name.trim() === ''}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BillForm
