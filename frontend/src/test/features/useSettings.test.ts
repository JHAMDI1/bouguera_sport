import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to declare mock functions that are referenced in vi.mock factories
const { mockToastSuccess, mockToastError, mockMutationFn, mockUseQuery } = vi.hoisted(() => ({
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockMutationFn: vi.fn(),
    mockUseQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: () => mockMutationFn,
}));

vi.mock("../../../../convex/_generated/api", () => ({
    api: {
        settings: { getSettings: "q", updateSettings: "m" },
    },
}));

vi.mock("react-hot-toast", () => {
    const toast = Object.assign(vi.fn(), {
        success: mockToastSuccess,
        error: mockToastError,
    });
    return { default: toast, toast };
});

import { useSettings } from "../../features/settings/useSettings";

describe("useSettings Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery.mockReturnValue({ clubName: "Gym Pro", currency: "TND", taxRate: 19 });
        mockMutationFn.mockResolvedValue(undefined);
    });

    it("returns settings from useQuery", () => {
        const { result } = renderHook(() => useSettings());
        expect(result.current.settings).toBeDefined();
        expect(result.current.settings?.clubName).toBe("Gym Pro");
    });

    it("returns isLoading=false when settings loaded", () => {
        const { result } = renderHook(() => useSettings());
        expect(result.current.isLoading).toBe(false);
    });

    it("returns isLoading=true when settings undefined", () => {
        mockUseQuery.mockReturnValue(undefined);
        const { result } = renderHook(() => useSettings());
        expect(result.current.isLoading).toBe(true);
    });

    it("updateSettings calls mutation and shows success", async () => {
        const { result } = renderHook(() => useSettings());

        let returnValue: boolean | undefined;
        await act(async () => {
            returnValue = await result.current.updateSettings({
                clubName: "New Gym", currency: "EUR", contactEmail: "new@gym.com", taxRate: 20,
            });
        });

        expect(returnValue).toBe(true);
        expect(mockMutationFn).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith("Paramètres mis à jour avec succès");
    });

    it("updateSettings shows error on failure", async () => {
        mockMutationFn.mockRejectedValue(new Error("DB error"));
        const { result } = renderHook(() => useSettings());

        let returnValue: boolean | undefined;
        await act(async () => {
            returnValue = await result.current.updateSettings({
                clubName: "New Gym", currency: "EUR", contactEmail: "a@b.com", taxRate: 20,
            });
        });

        expect(returnValue).toBe(false);
        expect(mockToastError).toHaveBeenCalledWith("DB error");
    });
});
