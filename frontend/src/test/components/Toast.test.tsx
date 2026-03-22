import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToastProvider } from "../../components/Toast";

describe("Toast System", () => {
    it("renders ToastProvider with children", () => {
        render(
            <ToastProvider>
                <div data-testid="child">Content</div>
            </ToastProvider>
        );
        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByText("Content")).toBeInTheDocument();
    });
});
