// Unmock the global setup mock to test the real Toast implementation
vi.unmock("@/components/Toast");

import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ToastProvider, useToastHelpers, useToast } from "../../components/Toast";

afterEach(() => cleanup());

// Helper component that uses the toast hook
function ToastTrigger({ type }: { type: "success" | "error" | "warning" | "info" }) {
    const toast = useToastHelpers();
    return (
        <button
            onClick={() => {
                if (type === "success") toast.success("Titre succès", "Msg succès");
                if (type === "error") toast.error("Titre erreur", "Msg erreur");
                if (type === "warning") toast.warning("Titre alerte");
                if (type === "info") toast.info("Titre info");
            }}
        >
            trigger-{type}
        </button>
    );
}

// Helper to expose internal toast list count
function CountDisplay() {
    const { toasts } = useToast();
    return <span data-testid="count">{toasts.length}</span>;
}

describe("ToastProvider", () => {
    it("renders children without crashing", () => {
        render(
            <ToastProvider>
                <div data-testid="child">content</div>
            </ToastProvider>
        );
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("starts with zero toasts", () => {
        render(
            <ToastProvider>
                <CountDisplay />
            </ToastProvider>
        );
        expect(screen.getByTestId("count").textContent).toBe("0");
    });

    it("adds a success toast on trigger", () => {
        render(
            <ToastProvider>
                <CountDisplay />
                <ToastTrigger type="success" />
            </ToastProvider>
        );
        expect(screen.getByTestId("count").textContent).toBe("0");
        fireEvent.click(screen.getByText("trigger-success"));
        expect(screen.getByTestId("count").textContent).toBe("1");
    });

    it("adds an error toast on trigger", () => {
        render(
            <ToastProvider>
                <CountDisplay />
                <ToastTrigger type="error" />
            </ToastProvider>
        );
        fireEvent.click(screen.getByText("trigger-error"));
        expect(screen.getByTestId("count").textContent).toBe("1");
    });

    it("adds a warning toast on trigger", () => {
        render(
            <ToastProvider>
                <CountDisplay />
                <ToastTrigger type="warning" />
            </ToastProvider>
        );
        fireEvent.click(screen.getByText("trigger-warning"));
        expect(screen.getByTestId("count").textContent).toBe("1");
    });

    it("adds an info toast on trigger", () => {
        render(
            <ToastProvider>
                <CountDisplay />
                <ToastTrigger type="info" />
            </ToastProvider>
        );
        fireEvent.click(screen.getByText("trigger-info"));
        expect(screen.getByTestId("count").textContent).toBe("1");
    });

    it("adds multiple toasts", () => {
        render(
            <ToastProvider>
                <CountDisplay />
                <ToastTrigger type="success" />
                <ToastTrigger type="error" />
            </ToastProvider>
        );
        fireEvent.click(screen.getByText("trigger-success"));
        fireEvent.click(screen.getByText("trigger-error"));
        expect(screen.getByTestId("count").textContent).toBe("2");
    });
});
