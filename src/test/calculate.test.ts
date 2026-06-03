import { describe, it, expect } from "vitest"
import {
  calculateInstallments,
  getMonthlyTotal,
  getYearStats,
  getDailyAverage,
  getBillsForDate,
} from "../utils/calculate"
import type { Bill, OneTimeBill, RecurringBill, Installment } from "../types/bill"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function oneTime(overrides: Partial<OneTimeBill> & { id: string; name: string; amount: number; dueDate: string }): OneTimeBill {
  return {
    type: "one-time",
    paid: false,
    ...overrides,
  }
}

function recurring(
  overrides: Partial<RecurringBill> & { id: string; name: string; totalAmount: number; installmentCount: number; paymentDay: number; startMonth: string },
): RecurringBill {
  return {
    type: "recurring",
    installments: calculateInstallments(
      overrides.totalAmount,
      overrides.installmentCount,
      overrides.paymentDay,
      overrides.startMonth,
    ),
    ...overrides,
  }
}

function installment(overrides: Partial<Installment> & { month: string; dueDate: string; amount: number }): Installment {
  return {
    paid: false,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// calculateInstallments
// ---------------------------------------------------------------------------

describe("calculateInstallments", () => {
  it("splits even amount into equal installments", () => {
    const result = calculateInstallments(100, 2, 15, "2026-01")
    expect(result).toHaveLength(2)
    expect(result[0].amount).toBe(50)
    expect(result[1].amount).toBe(50)
  })

  it("handles uneven division – last installment absorbs remainder", () => {
    const result = calculateInstallments(100, 3, 15, "2026-01")
    expect(result).toHaveLength(3)
    expect(result[0].amount).toBe(33.33)
    expect(result[1].amount).toBe(33.33)
    expect(result[2].amount).toBe(33.34)
    const sum = result.reduce((s, i) => s + i.amount, 0)
    expect(sum).toBe(100)
  })

  it("returns a single installment for count = 1", () => {
    const result = calculateInstallments(50, 1, 10, "2026-05")
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(50)
  })

  it("handles zero amount", () => {
    const result = calculateInstallments(0, 3, 15, "2026-01")
    expect(result).toHaveLength(3)
    expect(result[0].amount).toBe(0)
    expect(result[1].amount).toBe(0)
    expect(result[2].amount).toBe(0)
  })

  it("handles amounts smaller than a cent", () => {
    const result = calculateInstallments(0.01, 2, 15, "2026-01")
    expect(result).toHaveLength(2)
    expect(result[0].amount).toBe(0)
    expect(result[1].amount).toBe(0.01)
  })

  it("clamps payment day to month length (Feb 28 for non-leap year)", () => {
    const result = calculateInstallments(200, 2, 31, "2026-01")
    // January 31 is fine, February max is 28 in 2026
    expect(result[0].dueDate).toBe("2026-01-31")
    expect(result[1].dueDate).toBe("2026-02-28")
  })

  it("rolls over into the next year when months exceed December", () => {
    const result = calculateInstallments(400, 4, 15, "2026-11")
    expect(result).toHaveLength(4)
    expect(result[0].month).toBe("2026-11")
    expect(result[1].month).toBe("2026-12")
    expect(result[2].month).toBe("2027-01")
    expect(result[3].month).toBe("2027-02")
  })
})

// ---------------------------------------------------------------------------
// getMonthlyTotal
// ---------------------------------------------------------------------------

describe("getMonthlyTotal", () => {
  it("returns zero totals for an empty list", () => {
    expect(getMonthlyTotal([], "2026-06")).toEqual({ pending: 0, paid: 0 })
  })

  it("counts unpaid one-time bill in target month as pending", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Rent", amount: 1000, dueDate: "2026-06-15" }),
    ]
    expect(getMonthlyTotal(bills, "2026-06")).toEqual({ pending: 1000, paid: 0 })
  })

  it("counts paid one-time bill in target month as paid", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Rent", amount: 1000, dueDate: "2026-06-15", paid: true }),
    ]
    expect(getMonthlyTotal(bills, "2026-06")).toEqual({ pending: 0, paid: 1000 })
  })

  it("ignores one-time bill in a different month", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Rent", amount: 1000, dueDate: "2026-07-01" }),
    ]
    expect(getMonthlyTotal(bills, "2026-06")).toEqual({ pending: 0, paid: 0 })
  })

  it("counts unpaid recurring installment as pending", () => {
    const bills: Bill[] = [
      recurring({ id: "2", name: "Sub", totalAmount: 60, installmentCount: 3, paymentDay: 10, startMonth: "2026-06" }),
    ]
    // First installment is in June 2026, unpaid
    expect(getMonthlyTotal(bills, "2026-06")).toEqual({ pending: 20, paid: 0 })
  })

  it("counts paid recurring installment as paid", () => {
    const inst = installment({ month: "2026-06", dueDate: "2026-06-10", amount: 30, paid: true })
    const bills: Bill[] = [
      recurring({ id: "3", name: "Gym", totalAmount: 60, installmentCount: 2, paymentDay: 10, startMonth: "2026-06", installments: [inst, installment({ month: "2026-07", dueDate: "2026-07-10", amount: 30 })] }),
    ]
    expect(getMonthlyTotal(bills, "2026-06")).toEqual({ pending: 0, paid: 30 })
  })

  it("aggregates multiple bills with mixed paid status", () => {
    const bills: Bill[] = [
      oneTime({ id: "a", name: "Rent", amount: 500, dueDate: "2026-06-01", paid: true }),
      oneTime({ id: "b", name: "Electric", amount: 80, dueDate: "2026-06-15" }),
      recurring({ id: "c", name: "Netflix", totalAmount: 30, installmentCount: 1, paymentDay: 20, startMonth: "2026-06" }),
    ]
    // Paid: rent 500 + nothing else  → 500
    // Pending: electric 80 + netflix 30 = 110
    expect(getMonthlyTotal(bills, "2026-06")).toEqual({ pending: 110, paid: 500 })
  })
})

// ---------------------------------------------------------------------------
// getYearStats
// ---------------------------------------------------------------------------

describe("getYearStats", () => {
  it("returns all 12 months with zero totals for empty bills", () => {
    const stats = getYearStats([], 2026)
    expect(stats).toHaveLength(12)
    for (const s of stats) {
      expect(s.pending).toBe(0)
      expect(s.paid).toBe(0)
    }
  })

  it("shows correct values for a single bill in June", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Bonus", amount: 200, dueDate: "2026-06-01", paid: true }),
    ]
    const stats = getYearStats(bills, 2026)
    expect(stats[5].month).toBe("2026-06")
    expect(stats[5].pending).toBe(0)
    expect(stats[5].paid).toBe(200)
    // All other months should be zero
    for (let i = 0; i < 12; i++) {
      if (i !== 5) {
        expect(stats[i].pending).toBe(0)
        expect(stats[i].paid).toBe(0)
      }
    }
  })

  it("aggregates bills across multiple months", () => {
    const bills: Bill[] = [
      oneTime({ id: "a", name: "Jan rent", amount: 500, dueDate: "2026-01-01" }),
      oneTime({ id: "b", name: "Mar rent", amount: 600, dueDate: "2026-03-15", paid: true }),
    ]
    const stats = getYearStats(bills, 2026)
    expect(stats[0].month).toBe("2026-01")
    expect(stats[0].pending).toBe(500)
    expect(stats[0].paid).toBe(0)
    expect(stats[2].month).toBe("2026-03")
    expect(stats[2].pending).toBe(0)
    expect(stats[2].paid).toBe(600)
  })
})

// ---------------------------------------------------------------------------
// getDailyAverage
// ---------------------------------------------------------------------------

describe("getDailyAverage", () => {
  it("returns 0 when there is no pending amount", () => {
    expect(getDailyAverage([], "2026-06")).toBe(0)
  })

  it("divides pending by days in a 31-day month", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Rent", amount: 310, dueDate: "2026-01-15" }),
    ]
    // 310 / 31 = 10
    expect(getDailyAverage(bills, "2026-01")).toBe(10)
  })

  it("handles leap year February (29 days)", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Rent", amount: 290, dueDate: "2024-02-15" }),
    ]
    // 290 / 29 = 10 (2024 is a leap year)
    expect(getDailyAverage(bills, "2024-02")).toBe(10)
  })

  it("rounds to 2 decimal places", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Bill", amount: 100, dueDate: "2026-01-15" }),
    ]
    // 100 / 31 ≈ 3.225... → 3.23
    expect(getDailyAverage(bills, "2026-01")).toBe(3.23)
  })
})

// ---------------------------------------------------------------------------
// getBillsForDate
// ---------------------------------------------------------------------------

describe("getBillsForDate", () => {
  it("returns empty array for empty bills", () => {
    expect(getBillsForDate([], "2026-06-15")).toEqual([])
  })

  it("returns one-time bill whose dueDate matches", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Rent", amount: 500, dueDate: "2026-06-15" }),
    ]
    expect(getBillsForDate(bills, "2026-06-15")).toEqual(bills)
  })

  it("excludes one-time bill with different dueDate", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Rent", amount: 500, dueDate: "2026-06-16" }),
    ]
    expect(getBillsForDate(bills, "2026-06-15")).toEqual([])
  })

  it("includes recurring bill when an installment dueDate matches", () => {
    const bills: Bill[] = [
      recurring({ id: "2", name: "Sub", totalAmount: 30, installmentCount: 1, paymentDay: 15, startMonth: "2026-06" }),
    ]
    const result = getBillsForDate(bills, "2026-06-15")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("2")
  })

  it("returns empty when no bill matches the date", () => {
    const bills: Bill[] = [
      oneTime({ id: "1", name: "Rent", amount: 500, dueDate: "2026-06-15" }),
    ]
    expect(getBillsForDate(bills, "2026-07-01")).toEqual([])
  })
})
