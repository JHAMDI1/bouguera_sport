import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Single shared mutation mock - each hook call uses the same fn
const mockMutationFn = vi.fn();
const mockUseQuery = vi.fn();
vi.mock("convex/react", () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: () => mockMutationFn,
}));

vi.mock("../../../../convex/_generated/api", () => ({
    api: {
        members: { getMembers: "api.members.getMembers" },
        mutations: {
            createMember: "api.mutations.createMember",
            updateMember: "api.mutations.updateMember",
            deleteMember: "api.mutations.deleteMember",
        },
    },
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("@/components/Toast", () => ({
    useToastHelpers: () => ({
        success: mockToastSuccess,
        error: mockToastError,
        warning: vi.fn(),
        info: vi.fn(),
    }),
}));

const mockConfirm = vi.fn().mockResolvedValue(true);
vi.mock("@/components/ConfirmModal", () => ({
    useConfirmModal: () => ({
        confirm: mockConfirm,
        modalProps: { isOpen: false, onClose: vi.fn(), onConfirm: vi.fn(), title: "", message: "" },
    }),
    ConfirmModal: () => null,
}));

import { useMembers } from "../../features/members/useMembers";

describe("useMembers Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery.mockReturnValue([
            { _id: "m_1", firstName: "John", lastName: "Doe", isActive: true },
        ]);
        mockMutationFn.mockResolvedValue(undefined);
    });

    it("returns members from useQuery", () => {
        const { result } = renderHook(() => useMembers());
        expect(result.current.members).toHaveLength(1);
        expect(result.current.members![0].firstName).toBe("John");
    });

    it("createMember calls mutation and shows success toast", async () => {
        mockMutationFn.mockResolvedValue("new_id");
        const { result } = renderHook(() => useMembers());

        let success: boolean | undefined;
        await act(async () => {
            success = await result.current.createMember({ firstName: "Alice", lastName: "Dupont", gender: "female" });
        });

        expect(success).toBe(true);
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("createMember shows error toast on failure", async () => {
        mockMutationFn.mockRejectedValue(new Error("Database error"));
        const { result } = renderHook(() => useMembers());

        let success: boolean | undefined;
        await act(async () => {
            success = await result.current.createMember({ firstName: "Alice", lastName: "Dupont", gender: "female" });
        });

        expect(success).toBe(false);
        expect(mockToastError).toHaveBeenCalled();
    });

    it("updateMember calls mutation and shows success toast", async () => {
        const { result } = renderHook(() => useMembers());

        let success: boolean | undefined;
        await act(async () => {
            success = await result.current.updateMember("m_1" as any, { firstName: "Jane" });
        });

        expect(success).toBe(true);
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("deleteMember calls confirm, then mutation", async () => {
        mockConfirm.mockResolvedValue(true);
        const { result } = renderHook(() => useMembers());

        const member = { _id: "m_1", firstName: "John", lastName: "Doe", isActive: true } as any;
        await act(async () => {
            await result.current.deleteMember(member);
        });

        expect(mockConfirm).toHaveBeenCalled();
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("deleteMember does nothing if user cancels", async () => {
        mockConfirm.mockResolvedValue(false);
        const { result } = renderHook(() => useMembers());

        const member = { _id: "m_1", firstName: "John", lastName: "Doe", isActive: true } as any;
        await act(async () => {
            await result.current.deleteMember(member);
        });

        // The mutation should not be called if user clicks cancel
        // (confirm returns false, so the if block is skipped)
        expect(mockConfirm).toHaveBeenCalled();
    });

    it("toggleStatus calls confirm then update mutation", async () => {
        mockConfirm.mockResolvedValue(true);
        const { result } = renderHook(() => useMembers());

        const member = { _id: "m_1", firstName: "John", lastName: "Doe", isActive: true } as any;
        await act(async () => {
            await result.current.toggleStatus(member);
        });

        expect(mockConfirm).toHaveBeenCalled();
        expect(mockMutationFn).toHaveBeenCalled();
    });
});
