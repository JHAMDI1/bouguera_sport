import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatusBadge } from "../../components/StatusBadge";

describe("StatusBadge Component", () => {
    it("renders active text by default and uses badge-success", () => {
        render(<StatusBadge status={true} />);
        const element = screen.getByText("Actif");
        expect(element).toBeInTheDocument();
        expect(element.tagName).toBe("SPAN");
        expect(element).toHaveClass("badge-success");
    });

    it("renders inactive text by default and uses badge-error", () => {
        render(<StatusBadge status={false} />);
        const element = screen.getByText("Inactif");
        expect(element).toBeInTheDocument();
        expect(element).toHaveClass("badge-error");
    });

    it("renders custom text when provided", () => {
        render(<StatusBadge status={true} activeText="Payé" inactiveText="Impayé" />);
        expect(screen.getByText("Payé")).toBeInTheDocument();
    });

    it("renders as a button if onClick is provided", () => {
        const onClickMock = vi.fn();
        render(<StatusBadge status={true} onClick={onClickMock} />);

        const button = screen.getByRole("button", { name: "Actif" });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("disables the button when disabled prop is true", () => {
        const onClickMock = vi.fn();
        render(<StatusBadge status={true} onClick={onClickMock} disabled={true} />);

        const button = screen.getByRole("button", { name: "Actif" });
        expect(button).toBeDisabled();
        expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
    });
});
