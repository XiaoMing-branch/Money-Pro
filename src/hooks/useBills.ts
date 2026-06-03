import { useCallback, useEffect, useReducer, useRef } from "react";
import type {
	Bill,
	BillFormData,
	Installment,
	OneTimeBill,
	RecurringBill,
} from "../types/bill";
import { isOneTime, isRecurring } from "../types/bill";
import { calculateInstallments } from "../utils/calculate";
import { loadBills, saveBills } from "../utils/storage";

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

type BillsAction =
	| { type: "LOAD_BILLS"; payload: Bill[] }
	| { type: "ADD_BILL"; payload: Bill }
	| { type: "UPDATE_BILL"; payload: { id: string; data: BillFormData } }
	| { type: "DELETE_BILL"; payload: string }
	| { type: "TOGGLE_PAID"; payload: string }
	| { type: "TOGGLE_INSTALLMENT"; payload: { id: string; month: string } };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function billsReducer(state: Bill[], action: BillsAction): Bill[] {
	switch (action.type) {
		case "LOAD_BILLS":
			return action.payload;

		case "ADD_BILL":
			return [...state, action.payload];

		case "UPDATE_BILL": {
			const { id, data } = action.payload;
			return state.map((bill) => {
				if (bill.id !== id) return bill;

				// --- One-time update ------------------------------------------------
				if (data.type === "one-time") {
					const updated: OneTimeBill = {
						id: bill.id,
						type: "one-time",
						name: data.name,
						amount: data.amount ?? (isOneTime(bill) ? bill.amount : 0),
						dueDate: data.dueDate ?? (isOneTime(bill) ? bill.dueDate : ""),
						paid: isOneTime(bill) ? bill.paid : false,
					};
					return updated;
				}

				// --- Recurring update -----------------------------------------------
				const newTotalAmount =
					data.totalAmount ?? (isRecurring(bill) ? bill.totalAmount : 0);
				const newCount =
					data.installmentCount ??
					(isRecurring(bill) ? bill.installmentCount : 1);
				const newPaymentDay =
					data.paymentDay ?? (isRecurring(bill) ? bill.paymentDay : 1);
				const newStartMonth =
					data.startMonth ?? (isRecurring(bill) ? bill.startMonth : "");

				// Keep already-paid installments untouched
				let paidInstallments: Installment[] = [];
				if (isRecurring(bill)) {
					paidInstallments = bill.installments.filter((i) => i.paid);
				}
				const paidSum = paidInstallments.reduce((s, i) => s + i.amount, 0);

				// Remaining amount to distribute across new unpaid installments
				const remainingAmount =
					Math.round((newTotalAmount - paidSum) * 100) / 100;
				const remainingCount = newCount - paidInstallments.length;

				let newInstallments: Installment[];
				if (remainingCount <= 0) {
					newInstallments = [...paidInstallments];
				} else {
					// Start month = month after the last paid installment
					let startMonthForRemaining: string;
					if (paidInstallments.length > 0) {
						const lastPaid = paidInstallments[paidInstallments.length - 1];
						const [y, m] = lastPaid.month.split("-").map(Number);
						const nextM = m === 12 ? 1 : m + 1;
						const nextY = m === 12 ? y + 1 : y;
						startMonthForRemaining = `${nextY}-${String(nextM).padStart(2, "0")}`;
					} else {
						startMonthForRemaining = newStartMonth;
					}

					const recalculated = calculateInstallments(
						Math.max(0, remainingAmount),
						remainingCount,
						newPaymentDay,
						startMonthForRemaining,
					);

					newInstallments = [...paidInstallments, ...recalculated];
				}

				const updated: RecurringBill = {
					id: bill.id,
					type: "recurring",
					name: data.name,
					totalAmount: newTotalAmount,
					installmentCount: newCount,
					paymentDay: newPaymentDay,
					startMonth: newStartMonth,
					installments: newInstallments,
				};
				return updated;
			});
		}

		case "DELETE_BILL":
			return state.filter((bill) => bill.id !== action.payload);

		case "TOGGLE_PAID":
			return state.map((bill) => {
				if (bill.id === action.payload && isOneTime(bill)) {
					return { ...bill, paid: !bill.paid };
				}
				return bill;
			});

		case "TOGGLE_INSTALLMENT":
			return state.map((bill) => {
				if (bill.id === action.payload.id && isRecurring(bill)) {
					return {
						...bill,
						installments: bill.installments.map((inst) =>
							inst.month === action.payload.month
								? { ...inst, paid: !inst.paid }
								: inst,
						),
					};
				}
				return bill;
			});

		default:
			return state;
	}
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBills() {
	const [bills, dispatch] = useReducer(billsReducer, []);
	const isFirstRender = useRef(true);

	// 1. Load persisted bills on mount
	useEffect(() => {
		const loaded = loadBills();
		dispatch({ type: "LOAD_BILLS", payload: loaded });
	}, []);

	// 2. Persist bills after every state change (skip initial empty state to
	//    avoid overwriting real data before the load effect has completed)
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		saveBills(bills);
	}, [bills]);

	// 3. Cross-tab synchronisation — reload from localStorage when another
	//    tab writes to the same storage key
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === "bill-calendar-v1") {
				const loaded = loadBills();
				dispatch({ type: "LOAD_BILLS", payload: loaded });
			}
		};
		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	// ----- Exported action dispatchers ---------------------------------------

	const addBill = useCallback((data: BillFormData) => {
		const id = crypto.randomUUID();

		if (data.type === "one-time") {
			const bill: OneTimeBill = {
				id,
				type: "one-time",
				name: data.name,
				amount: data.amount ?? 0,
				dueDate: data.dueDate ?? "",
				paid: false,
			};
			dispatch({ type: "ADD_BILL", payload: bill });
		} else {
			const totalAmount = data.totalAmount ?? 0;
			const count = data.installmentCount ?? 1;
			const paymentDay = data.paymentDay ?? 1;
			const startMonth = data.startMonth ?? "";
			const installments = calculateInstallments(
				totalAmount,
				count,
				paymentDay,
				startMonth,
			);

			const bill: RecurringBill = {
				id,
				type: "recurring",
				name: data.name,
				totalAmount,
				installmentCount: count,
				paymentDay,
				startMonth,
				installments,
			};
			dispatch({ type: "ADD_BILL", payload: bill });
		}
	}, []);

	const updateBill = useCallback((id: string, data: BillFormData) => {
		dispatch({ type: "UPDATE_BILL", payload: { id, data } });
	}, []);

	const deleteBill = useCallback((id: string) => {
		dispatch({ type: "DELETE_BILL", payload: id });
	}, []);

	const togglePaid = useCallback((id: string) => {
		dispatch({ type: "TOGGLE_PAID", payload: id });
	}, []);

	const toggleInstallment = useCallback((id: string, month: string) => {
		dispatch({ type: "TOGGLE_INSTALLMENT", payload: { id, month } });
	}, []);

	return {
		bills,
		addBill,
		updateBill,
		deleteBill,
		togglePaid,
		toggleInstallment,
	};
}
