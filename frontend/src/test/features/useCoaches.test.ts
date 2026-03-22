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
        users: { getUsers: "q" },
        coaches: { createCoach: "m", updateCoach: "m", deleteCoach: "m" },
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

import { useCoaches } from "../../features/coaches/useCoaches";

describe("useCoaches Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery.mockReturnValue([{ _id: "c_1", fullName: "Coach Karim", role: "coach", isActive: true }]);
        mockMutationFn.mockResolvedValue(undefined);
    });

    it("returns coaches from useQuery", () => {
        const { result } = renderHook(() => useCoaches());
        expect(result.current.coaches).toHaveLength(1);
    });

    it("createCoach calls mutation and shows success", async () => {
        const { result } = renderHook(() => useCoaches());
        await act(async () => {
            await result.current.createCoach({ email: "k@gym.com", fullName: "Karim" });
        });
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("createCoach shows error on failure", async () => {
        mockMutationFn.mockRejectedValue(new Error("fail"));
        const { result } = renderHook(() => useCoaches());
        await act(async () => {
            await result.current.createCoach({ email: "bad@e.com", fullName: "Bad" });
        });
        expect(mockToastError).toHaveBeenCalled();
    });

    it("updateCoach calls mutation", async () => {
        const { result } = renderHook(() => useCoaches());
        await act(async () => {
            await result.current.updateCoach("c_1" as any, { fullName: "New", isActive: true });
        });
        expect(mockMutationFn).toHaveBeenCalled();
    });

    it("deleteCoach with confirm calls mutation", async () => {
        mockConfirm.mockResolvedValue(true);
        const { result } = renderHook(() => useCoaches());
        await act(async () => {
            await result.current.deleteCoach({ _id: "c_1", fullName: "Coach K", isActive: true } as any);
        });
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockMutationFn).toHaveBeenCalled();
    });

    it("toggleStatus flips isActive", async () => {
        mockConfirm.mockResolvedValue(true);
        const { result } = renderHook(() => useCoaches());
        await act(async () => {
            await result.current.toggleStatus({ _id: "c_1", fullName: "Coach K", isActive: true } as any);
        });
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockMutationFn).toHaveBeenCalled();
    });
});
