import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "../../components/EmptyState";

describe("EmptyState Component", () => {
    it("renders title correctly", () => {
        render(<EmptyState title="Aucune donnée" />);
        expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });

    it("renders description if provided", () => {
        render(<EmptyState title="Titre" description="Voici une description." />);
        expect(screen.getByText("Voici une description.")).toBeInTheDocument();
    });

    it("renders icon if provided", () => {
        render(<EmptyState title="Titre" icon={<span data-testid="test-icon">icon</span>} />);
        expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("renders action button if provided", () => {
        render(
            <EmptyState
                title="Titre"
                action={<button>Créer</button>}
            />
        );
        expect(screen.getByRole("button", { name: "Créer" })).toBeInTheDocument();
    });
});
