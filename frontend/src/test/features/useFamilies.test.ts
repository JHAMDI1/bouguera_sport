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
        families: { getFamilies: "q" },
        mutations: { createFamily: "m", updateFamily: "m", deleteFamily: "m" },
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

import { useFamilies } from "../../features/families/useFamilies";

describe("useFamilies Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery.mockReturnValue([{ _id: "f_1", familyName: "Dupont", isActive: true }]);
        mockMutationFn.mockResolvedValue(undefined);
    });

    it("returns families from useQuery", () => {
        const { result } = renderHook(() => useFamilies());
        expect(result.current.families).toHaveLength(1);
    });

    it("createFamily calls mutation and shows success", async () => {
        const { result } = renderHook(() => useFamilies());
        await act(async () => {
            await result.current.createFamily({ familyName: "Smith", primaryContactName: "John" });
        });
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("createFamily shows error on failure", async () => {
        mockMutationFn.mockRejectedValue(new Error("fail"));
        const { result } = renderHook(() => useFamilies());
        await act(async () => {
            await result.current.createFamily({ familyName: "Smith", primaryContactName: "John" });
        });
        expect(mockToastError).toHaveBeenCalled();
    });

    it("deleteFamily with confirm calls mutation", async () => {
        mockConfirm.mockResolvedValue(true);
        const { result } = renderHook(() => useFamilies());
        await act(async () => {
            await result.current.deleteFamily({ _id: "f_1", familyName: "Dupont" } as any);
        });
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockMutationFn).toHaveBeenCalled();
    });
});
