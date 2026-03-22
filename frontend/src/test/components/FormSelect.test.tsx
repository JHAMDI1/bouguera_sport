import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FormSelect } from "../../components/FormSelect";

describe("FormSelect Component", () => {
    const fakeRegistration = { name: "category", onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() };

    it("renders label and select with children", () => {
        render(
            <FormSelect label="Catégorie" registration={fakeRegistration as any}>
                <option value="a">Option A</option>
                <option value="b">Option B</option>
            </FormSelect>
        );

        expect(screen.getByText("Catégorie")).toBeInTheDocument();
        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();
        expect(select).toHaveAttribute("name", "category");
    });

    it("renders error message when error is provided", () => {
        const fakeError = { type: "manual", message: "Ce champ est requis" };
        render(
            <FormSelect label="Catégorie" registration={fakeRegistration as any} error={fakeError as any}>
                <option value="">Sélectionner</option>
            </FormSelect>
        );
        expect(screen.getByText("Ce champ est requis")).toBeInTheDocument();
        expect(screen.getByText("Ce champ est requis")).toHaveClass("text-error");
    });
});
