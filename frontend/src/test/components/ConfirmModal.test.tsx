// Unmock the global setup mock to test the real ConfirmModal implementation
vi.unmock("@/components/ConfirmModal");

import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ConfirmModal } from "../../components/ConfirmModal";

afterEach(() => cleanup());

describe("ConfirmModal", () => {
    it("renders nothing when isOpen=false", () => {
        render(<ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} title="T" message="M" />);
        expect(screen.queryByText("T")).toBeNull();
    });

    it("renders title and message when isOpen=true", () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Titre test" message="Message test" />);
        expect(screen.getByText("Titre test")).toBeInTheDocument();
        expect(screen.getByText("Message test")).toBeInTheDocument();
    });

    it("renders default confirm and cancel buttons", () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="T" message="M" />);
        expect(screen.getByText("Confirmer")).toBeInTheDocument();
        expect(screen.getByText("Annuler")).toBeInTheDocument();
    });

    it("renders custom confirmText and cancelText", () => {
        render(
            <ConfirmModal
                isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()}
                title="T" message="M"
                confirmText="Supprimer définitivement"
                cancelText="Pas maintenant"
            />
        );
        expect(screen.getByText("Supprimer définitivement")).toBeInTheDocument();
        expect(screen.getByText("Pas maintenant")).toBeInTheDocument();
    });

    it("shows loading text when isLoading=true", () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="T" message="M" isLoading={true} />);
        expect(screen.getByText("Traitement...")).toBeInTheDocument();
    });

    it("calls onConfirm when confirm button clicked", () => {
        const onConfirm = vi.fn();
        render(
            <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm}
                title="T" message="M" confirmText="Valider" />
        );
        fireEvent.click(screen.getByText("Valider"));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when cancel button clicked", () => {
        const onClose = vi.fn();
        render(
            <ConfirmModal isOpen={true} onClose={onClose} onConfirm={vi.fn()}
                title="T" message="M" cancelText="Retour" />
        );
        fireEvent.click(screen.getByText("Retour"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders danger type", () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Suppr" message="M" type="danger" />);
        expect(screen.getByText("Suppr")).toBeInTheDocument();
    });

    it("renders warning type", () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Alerte" message="M" type="warning" />);
        expect(screen.getByText("Alerte")).toBeInTheDocument();
    });

    it("renders info type", () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Infos" message="M" type="info" />);
        expect(screen.getByText("Infos")).toBeInTheDocument();
    });

    it("renders success type", () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Succes" message="M" type="success" />);
        expect(screen.getByText("Succes")).toBeInTheDocument();
    });

    it("renders children inside modal", () => {
        render(
            <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="T" message="M">
                <span data-testid="child-content">Custom content</span>
            </ConfirmModal>
        );
        expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
});
