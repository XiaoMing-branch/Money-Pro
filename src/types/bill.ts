/** A one-time bill — single payment due on a specific date. */
export interface OneTimeBill {
  id: string
  type: "one-time"
  name: string
  amount: number
  dueDate: string // "YYYY-MM-DD"
  paid: boolean
}

/** A single installment within a recurring bill. */
export interface Installment {
  month: string    // "YYYY-MM"
  dueDate: string  // "YYYY-MM-DD"
  amount: number
  paid: boolean
}

/** A recurring bill paid in fixed installments. */
export interface RecurringBill {
  id: string
  type: "recurring"
  name: string
  totalAmount: number
  installmentCount: number
  paymentDay: number // 1-28
  startMonth: string // "YYYY-MM"
  installments: Installment[]
}

/** Union of all bill types. */
export type Bill = OneTimeBill | RecurringBill

/** Persisted bill store shape. */
export interface BillStore {
  bills: Bill[]
}

// ---- Type guards -----------------------------------------------------------

export function isOneTime(bill: Bill): bill is OneTimeBill {
  return bill.type === "one-time"
}

export function isRecurring(bill: Bill): bill is RecurringBill {
  return bill.type === "recurring"
}

// ---- Form data -------------------------------------------------------------

/** Unified create / edit form payload for both bill types.
 *  All fields are optional except `name`. */
export interface BillFormData {
  type: "one-time" | "recurring"
  name: string

  // One-time fields
  amount?: number
  dueDate?: string // "YYYY-MM-DD"

  // Recurring fields
  totalAmount?: number
  installmentCount?: number
  paymentDay?: number // 1-28
  startMonth?: string // "YYYY-MM"
}
