import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "../../components/PageHeader";

describe("PageHeader Component", () => {
    it("renders the title correctly", () => {
        render(<PageHeader title="Gestion des Membres" />);
        expect(screen.getByRole("heading", { name: "Gestion des Membres" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("renders the description if provided", () => {
        render(<PageHeader title="Titre" description="Ici on gère les membres." />);
        expect(screen.getByText("Ici on gère les membres.")).toBeInTheDocument();
    });

    it("renders the icon if provided", () => {
        render(<PageHeader title="Titre" icon={<span data-testid="test-icon">icon</span>} />);
        expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("renders action button and children if provided", () => {
        render(
            <PageHeader
                title="Titre"
                action={<button>Ajouter</button>}
            >
                <button>Filtre</button>
            </PageHeader>
        );
        expect(screen.getByRole("button", { name: "Ajouter" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Filtre" })).toBeInTheDocument();
    });
});
