import { describe, it, expect, beforeEach } from "vitest"
import { isStorageAvailable, saveBills, loadBills } from "../utils/storage"
import type { Bill } from "../types/bill"

const STORAGE_KEY = "bill-calendar-v1"

beforeEach(() => {
  localStorage.clear()
})

describe("isStorageAvailable", () => {
  it("returns true in jsdom environment", () => {
    expect(isStorageAvailable()).toBe(true)
  })
})

describe("saveBills / loadBills integration", () => {
  it("returns empty array when no bills saved", () => {
    expect(loadBills()).toEqual([])
  })

  it("saves and loads an empty array", () => {
    saveBills([])
    expect(loadBills()).toEqual([])
  })

  it("saves and loads a single bill", () => {
    const bill: Bill = {
      id: "1",
      type: "one-time",
      name: "Rent",
      amount: 1000,
      dueDate: "2026-06-01",
      paid: false,
    }
    saveBills([bill])
    expect(loadBills()).toEqual([bill])
  })

  it("saves and loads multiple bills", () => {
    const bills: Bill[] = [
      {
        id: "1",
        type: "one-time",
        name: "Rent",
        amount: 1000,
        dueDate: "2026-06-01",
        paid: false,
      },
      {
        id: "2",
        type: "one-time",
        name: "Electric",
        amount: 80,
        dueDate: "2026-06-15",
        paid: true,
      },
    ]
    saveBills(bills)
    expect(loadBills()).toEqual(bills)
  })

  it("returns empty array when localStorage key is missing", () => {
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(loadBills()).toEqual([])
  })

  it("returns empty array for corrupted JSON data", () => {
    localStorage.setItem(STORAGE_KEY, "not valid json{{{")
    expect(loadBills()).toEqual([])
  })

  it("returns empty array when stored value is not an array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: "an array" }))
    expect(loadBills()).toEqual([])
  })
})
