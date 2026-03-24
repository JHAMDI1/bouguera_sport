import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DataTable } from "../../components/DataTable";

type Person = { id: string; name: string; age: number };

const columns = [
    { header: "Nom", accessor: (r: Person) => r.name },
    { header: "Âge", accessor: (r: Person) => r.age },
];

const data: Person[] = [
    { id: "1", name: "Alice", age: 30 },
    { id: "2", name: "Bob", age: 25 },
];

describe("DataTable Component", () => {
    it("renders column headers", () => {
        render(<DataTable data={data} columns={columns} keyExtractor={(r) => r.id} />);
        expect(screen.getAllByText("Nom").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Âge").length).toBeGreaterThan(0);
    });

    it("renders all rows", () => {
        render(<DataTable data={data} columns={columns} keyExtractor={(r) => r.id} />);
        expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Bob").length).toBeGreaterThan(0);
    });

    it("shows empty message when data is empty array", () => {
        render(<DataTable data={[]} columns={columns} keyExtractor={(r) => r.id} />);
        expect(screen.getByText("Aucun résultat trouvé")).toBeInTheDocument();
    });

    it("shows custom empty message", () => {
        render(
            <DataTable
                data={[]}
                columns={columns}
                keyExtractor={(r) => r.id}
                emptyMessage="Aucun membre trouvé"
            />
        );
        expect(screen.getByText("Aucun membre trouvé")).toBeInTheDocument();
    });

    it("shows skeleton when isLoading and no data", () => {
        const { container } = render(
            <DataTable
                data={undefined}
                columns={columns}
                keyExtractor={(r: Person) => r.id}
                isLoading={true}
            />
        );
        // SkeletonTable renders td elements
        expect(container.querySelector("table")).toBeInTheDocument();
    });

    it("renders null cell values gracefully (mobile view)", () => {
        const colsWithNull = [
            {
                header: "Valeur",
                accessor: (_r: Person) => null as React.ReactNode,
            },
        ];
        const { container } = render(
            <DataTable data={data} columns={colsWithNull} keyExtractor={(r) => r.id} />
        );
        // Should not crash
        expect(container).toBeDefined();
    });
});
