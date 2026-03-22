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
        payments: { getPayments: "q", cancelPayment: "m" },
        members: { getMembers: "q" },
        disciplines: { getDisciplines: "q" },
        users: { getUsers: "q" },
        mutations: { createPayment: "m", updatePayment: "m" },
    },
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("@/components/Toast", () => ({
    useToastHelpers: () => ({ success: mockToastSuccess, error: mockToastError, warning: vi.fn(), info: vi.fn() }),
}));

const mockConfirm = vi.fn().mockResolvedValue(true);
vi.mock("@/components/ConfirmModal", () => ({
    useConfirmModal: () => ({ confirm: mockConfirm, modalProps: { isOpen: false, onClose: vi.fn(), onConfirm: vi.fn(), title: "", message: "" } }),
    ConfirmModal: () => null,
}));

vi.mock("@/components/ReceiptPDF", () => ({
    useReceiptGenerator: () => ({ generateReceiptData: vi.fn().mockReturnValue({ id: "receipt" }) }),
}));

import { usePayments } from "../../features/payments/usePayments";

describe("usePayments Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery.mockReturnValue([{ _id: "p_1", amount: 100, receiptNumber: "R-001" }]);
        mockMutationFn.mockResolvedValue(undefined);
    });

    it("returns payments from useQuery", () => {
        const { result } = renderHook(() => usePayments());
        expect(result.current.payments).toBeDefined();
    });

    it("createPayment calls mutation on success", async () => {
        const { result } = renderHook(() => usePayments());
        await act(async () => {
            await result.current.createPayment({
                amount: 100, monthCovered: 3, yearCovered: 2024, receiptNumber: "R-001", memberId: "m_1",
            });
        });
        expect(mockMutationFn).toHaveBeenCalled();
    });

    it("cancelPayment calls confirmation then mutation", async () => {
        mockConfirm.mockResolvedValue(true);
        const { result } = renderHook(() => usePayments());
        await act(async () => {
            await result.current.cancelPayment("p_1", "R-001");
        });
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockMutationFn).toHaveBeenCalled();
    });

    it("updatePayment calls mutation", async () => {
        const { result } = renderHook(() => usePayments());
        await act(async () => {
            await result.current.updatePayment("p_1" as any, { amount: 200 });
        });
        expect(mockMutationFn).toHaveBeenCalled();
    });
});
