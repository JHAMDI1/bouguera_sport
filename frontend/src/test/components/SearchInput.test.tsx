import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchInput } from "../../components/SearchInput";

describe("SearchInput Component", () => {
    it("renders the input and handles props correctly", () => {
        const onChangeMock = vi.fn();
        render(<SearchInput placeholder="Rechercher..." onChange={onChangeMock} />);

        const input = screen.getByPlaceholderText("Rechercher...");
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("type", "text");

        fireEvent.change(input, { target: { value: "John" } });
        expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it("applies custom classes correctly", () => {
        const { container } = render(<SearchInput className="border-red-500" />);
        const input = container.querySelector("input");
        expect(input).toHaveClass("border-red-500");
    });
});
