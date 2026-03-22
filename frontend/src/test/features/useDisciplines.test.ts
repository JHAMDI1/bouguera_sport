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
        disciplines: { getDisciplines: "q" },
        users: { getUsers: "q" },
        mutations: { createDiscipline: "m", updateDiscipline: "m", deleteDiscipline: "m" },
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

import { useDisciplines } from "../../features/disciplines/useDisciplines";

describe("useDisciplines Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery.mockReturnValue([{ _id: "d_1", name: "Yoga", isActive: true }]);
        mockMutationFn.mockResolvedValue(undefined);
    });

    it("returns disciplines from useQuery", () => {
        const { result } = renderHook(() => useDisciplines());
        expect(result.current.disciplines).toHaveLength(1);
    });

    it("createDiscipline calls mutation and shows success", async () => {
        const { result } = renderHook(() => useDisciplines());
        await act(async () => {
            await result.current.createDiscipline({ name: "Boxing", monthlyFee: 50 });
        });
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("deleteDiscipline with confirm calls mutation", async () => {
        mockConfirm.mockResolvedValue(true);
        const { result } = renderHook(() => useDisciplines());
        await act(async () => {
            await result.current.deleteDiscipline({ _id: "d_1", name: "Yoga" } as any);
        });
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockMutationFn).toHaveBeenCalled();
    });
});
