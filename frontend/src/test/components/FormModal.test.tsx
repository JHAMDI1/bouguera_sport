import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FormModal } from "../../components/FormModal";

describe("FormModal Component", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        title: "Ajouter un membre",
        isSubmitting: false,
        onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    };

    it("renders nothing when isOpen is false", () => {
        const { container } = render(
            <FormModal {...defaultProps} isOpen={false}>
                <input />
            </FormModal>
        );
        expect(container.innerHTML).toBe("");
    });

    it("renders title, children, and buttons when open", () => {
        render(
            <FormModal {...defaultProps}>
                <input placeholder="Nom" />
            </FormModal>
        );
        expect(screen.getByText("Ajouter un membre")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Nom")).toBeInTheDocument();
        expect(screen.getByText("Annuler")).toBeInTheDocument();
        expect(screen.getByText("Enregistrer")).toBeInTheDocument();
    });

    it("calls onClose when Annuler is clicked", () => {
        const onCloseMock = vi.fn();
        render(
            <FormModal {...defaultProps} onClose={onCloseMock}>
                <input />
            </FormModal>
        );
        fireEvent.click(screen.getByText("Annuler"));
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it("shows loading spinner when isSubmitting is true", () => {
        render(
            <FormModal {...defaultProps} isSubmitting={true}>
                <input />
            </FormModal>
        );
        expect(screen.getByText("Chargement...")).toBeInTheDocument();
    });

    it("uses custom submitText when provided", () => {
        render(
            <FormModal {...defaultProps} submitText="Sauvegarder">
                <input />
            </FormModal>
        );
        expect(screen.getByText("Sauvegarder")).toBeInTheDocument();
    });
});
