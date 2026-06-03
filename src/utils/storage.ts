import type { Bill } from "../types/bill"

/** localStorage key under which all bills are persisted. */
const STORAGE_KEY = "bill-calendar-v1"

/**
 * Checks whether localStorage is available and writable.
 *
 * Some browsers disable localStorage in private / incognito mode or when
 * third-party cookies are blocked. This function performs a quick probe to
 * detect that scenario so callers can degrade gracefully.
 *
 * @returns `true` if localStorage can be used, `false` otherwise.
 */
export function isStorageAvailable(): boolean {
  try {
    const key = "__storage_probe__"
    localStorage.setItem(key, "1")
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Loads all bills from localStorage.
 *
 * Expected storage shape is a JSON-serialised `Bill[]`. When the key is
 * missing, data is corrupted, or localStorage is unavailable an empty array
 * is returned so consumers never need to check for `null` / `undefined`.
 *
 * @returns The deserialised array of bills, or an empty array on failure.
 */
export function loadBills(): Bill[] {
  if (!isStorageAvailable()) {
    return []
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    // Key does not exist yet → first launch.
    if (raw === null) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      console.warn(
        "[storage] Stored value is not an array – resetting to empty.",
      )
      return []
    }

    return parsed as Bill[]
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn("[storage] Corrupted bills data – resetting to empty.")
    } else {
      console.error("[storage] Unexpected error while loading bills:", error)
    }
    return []
  }
}

/**
 * Persists all bills to localStorage.
 *
 * The entire bill array is serialised as JSON and written under
 * {@link STORAGE_KEY}. If the browser throws a `QuotaExceededError` the
 * operation is aborted and a Chinese-language warning is emitted so users
 * know to free up space.
 *
 * @param bills - The array of bills to persist.
 */
export function saveBills(bills: Bill[]): void {
  if (!isStorageAvailable()) {
    console.error("[storage] localStorage不可用，无法保存数据")
    return
  }

  try {
    const data = JSON.stringify(bills)
    localStorage.setItem(STORAGE_KEY, data)
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("存储空间已满，请删除一些旧账单")
    } else {
      console.error("[storage] 保存账单时发生错误:", error)
    }
  }
}
