import type { Bill, Installment } from "../types/bill"
import { isOneTime, isRecurring } from "../types/bill"

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of days in the given month (handles leap-year February).
 *
 * Not exported – used internally by `getDailyAverage` and `calculateInstallments`.
 */
function getDaysInMonth(yearMonth: string): number {
  const [yearStr, monthStr] = yearMonth.split("-")
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) // 1-indexed
  // new Date(year, month, 0) gives the last day of the *previous* month,
  // which is exactly the number of days in month-1.  Since we pass the
  // 1-indexed month directly, this yields days-in-month.
  return new Date(year, month, 0).getDate()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculates installment breakdown for a recurring bill.
 *
 * Each installment (except the last) uses `Math.floor(total / count * 100) / 100`.
 * The **last** installment absorbs any remainder so the total sums exactly.
 *
 * @param totalAmount – Full amount to split across installments.
 * @param count       – How many installments to create.
 * @param paymentDay  – Day of month the payment is due (1‑31).
 * @param startMonth  – First-installment month in `"YYYY-MM"` format.
 * @returns An array of `Installment` objects.
 */
export function calculateInstallments(
  totalAmount: number,
  count: number,
  paymentDay: number,
  startMonth: string,
): Installment[] {
  const [startYearStr, startMonthStr] = startMonth.split("-")
  const startYear = parseInt(startYearStr, 10)
  const startMonthIdx = parseInt(startMonthStr, 10) - 1 // 0-indexed

  // Work in cents to avoid floating-point drift across installments.
  const totalCents = Math.round(totalAmount * 100)
  const baseCents = Math.floor(totalCents / count)

  const installments: Installment[] = []
  let usedCents = 0

  for (let i = 0; i < count; i++) {
    // --- Year / month for this installment --------------------------------
    const totalOffset = startMonthIdx + i
    const year = startYear + Math.floor(totalOffset / 12)
    const monthIdx = totalOffset % 12
    const monthStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}`

    // --- Due date (handle short months) -----------------------------------
    const daysInMonth = getDaysInMonth(monthStr)
    const dueDay = Math.min(paymentDay, daysInMonth)
    const dueDate = `${monthStr}-${String(dueDay).padStart(2, "0")}`

    // --- Amount -----------------------------------------------------------
    // Non-last installments get `baseCents` (floor). The last one absorbs
    // whatever cents remain so the sum matches totalCents exactly.
    const amountCents = i === count - 1 ? totalCents - usedCents : baseCents
    usedCents += amountCents

    installments.push({
      month: monthStr,
      dueDate,
      amount: amountCents / 100,
      paid: false,
    })
  }

  return installments
}

/**
 * Aggregates the pending (unpaid) and paid totals for a given month.
 *
 * - `OneTimeBill`: included when `dueDate` falls within `yearMonth`.
 * - `RecurringBill`: included when any `installment.month` matches `yearMonth`.
 *
 * @param bills     – The full list of bills.
 * @param yearMonth – Target month in `"YYYY-MM"` format.
 * @returns `{ pending, paid }` – totals aggregated from matching bills.
 */
export function getMonthlyTotal(
  bills: Bill[],
  yearMonth: string,
): { pending: number; paid: number } {
  let pending = 0
  let paid = 0

  for (const bill of bills) {
    if (isOneTime(bill)) {
      if (bill.dueDate.startsWith(yearMonth)) {
        if (bill.paid) {
          paid += bill.amount
        } else {
          pending += bill.amount
        }
      }
    } else if (isRecurring(bill)) {
      for (const inst of bill.installments) {
        if (inst.month === yearMonth) {
          if (inst.paid) {
            paid += inst.amount
          } else {
            pending += inst.amount
          }
        }
      }
    }
  }

  return { pending, paid }
}

/**
 * Computes monthly aggregates for every month in the given year.
 *
 * @param bills – The full list of bills.
 * @param year  – Target year (e.g. `2026`).
 * @returns An array of 12 entries (`January` … `December`).
 */
export function getYearStats(
  bills: Bill[],
  year: number,
): Array<{ month: string; pending: number; paid: number }> {
  const stats: Array<{ month: string; pending: number; paid: number }> = []

  for (let m = 1; m <= 12; m++) {
    const yearMonth = `${year}-${String(m).padStart(2, "0")}`
    const { pending, paid } = getMonthlyTotal(bills, yearMonth)
    stats.push({ month: yearMonth, pending, paid })
  }

  return stats
}

/**
 * Calculates the daily average of **pending** bills for a given month.
 *
 * The average is the pending total divided by the number of days in the month,
 * rounded to 2 decimal places.
 *
 * @param bills     – The full list of bills.
 * @param yearMonth – Target month in `"YYYY-MM"` format.
 * @returns Daily average rounded to 2 decimal places.
 */
export function getDailyAverage(bills: Bill[], yearMonth: string): number {
  const { pending } = getMonthlyTotal(bills, yearMonth)
  const days = getDaysInMonth(yearMonth)
  if (days === 0) return 0
  return Math.round((pending / days) * 100) / 100
}

/**
 * Returns all bills that have at least one payment due on the given date.
 *
 * - `OneTimeBill`: matched when `dueDate === date`.
 * - `RecurringBill`: matched when any `installment.dueDate === date`.
 *   The full bill object (not a single installment) is returned.
 *
 * @param bills – The full list of bills.
 * @param date  – Target date in `"YYYY-MM-DD"` format.
 * @returns Filtered array of bills due on that date.
 */
export function getBillsForDate(bills: Bill[], date: string): Bill[] {
  return bills.filter((bill) => {
    if (isOneTime(bill)) {
      return bill.dueDate === date
    }
    if (isRecurring(bill)) {
      return bill.installments.some((inst) => inst.dueDate === date)
    }
    return false
  })
}
