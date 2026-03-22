import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMutationFn = vi.fn();
const mockUseQuery = vi.fn();
vi.mock("convex/react", () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: () => mockMutationFn,
}));

vi.mock("../../../../convex/_generated/api", () => ({
    api: {
        expenses: { getUserExpenses: "q", getExpenseCategories: "q" },
        mutations: { createExpense: "m", updateExpense: "m" },
        users: { getUsers: "q" },
    },
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("@/components/Toast", () => ({
    useToastHelpers: () => ({ success: mockToastSuccess, error: mockToastError, warning: vi.fn(), info: vi.fn() }),
}));

vi.mock("@/components/ConfirmModal", () => ({
    useConfirmModal: () => ({ confirm: vi.fn().mockResolvedValue(true), modalProps: { isOpen: false, onClose: vi.fn(), onConfirm: vi.fn(), title: "", message: "" } }),
    ConfirmModal: () => null,
}));

import { useExpenses } from "../../features/expenses/useExpenses";

describe("useExpenses Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery.mockReturnValue([{ _id: "e_1", description: "Loyer", amount: 1500 }]);
        mockMutationFn.mockResolvedValue(undefined);
    });

    it("returns expenses from useQuery", () => {
        const { result } = renderHook(() => useExpenses());
        expect(result.current.expenses).toBeDefined();
    });

    it("createExpense calls mutation and shows success", async () => {
        const { result } = renderHook(() => useExpenses());
        await act(async () => {
            await result.current.createExpense({
                categoryId: "cat_1", description: "Loyer", amount: 1500, expenseDate: Date.now(),
            });
        });
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("createExpense shows error on failure", async () => {
        mockMutationFn.mockRejectedValue(new Error("fail"));
        const { result } = renderHook(() => useExpenses());
        await act(async () => {
            await result.current.createExpense({
                categoryId: "cat_1", description: "Loyer", amount: 1500, expenseDate: Date.now(),
            });
        });
        expect(mockToastError).toHaveBeenCalled();
    });
});
