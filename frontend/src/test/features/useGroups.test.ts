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
        groups: { getGroups: "q" },
        members: { getMembers: "q" },
        disciplines: { getDisciplines: "q" },
        users: { getUsers: "q" },
        coaches: { createCoach: "m" },
        mutations: { createGroup: "m", updateGroup: "m", deleteGroup: "m" },
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

import { useGroups } from "../../features/groups/useGroups";

describe("useGroups Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery.mockReturnValue([{ _id: "g_1", name: "Beginners", isActive: true }]);
        mockMutationFn.mockResolvedValue(undefined);
    });

    it("returns groups from useQuery", () => {
        const { result } = renderHook(() => useGroups());
        expect(result.current.groups).toHaveLength(1);
    });

    it("createGroup calls mutation and shows success", async () => {
        const { result } = renderHook(() => useGroups());
        await act(async () => {
            await result.current.createGroup({ name: "Pro", disciplineId: "d_1", coachId: "c_1", maxCapacity: 20 });
        });
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("deleteGroup with confirm calls mutation", async () => {
        mockConfirm.mockResolvedValue(true);
        const { result } = renderHook(() => useGroups());
        await act(async () => {
            await result.current.deleteGroup({ _id: "g_1", name: "Beginners" } as any);
        });
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockMutationFn).toHaveBeenCalled();
    });
});
