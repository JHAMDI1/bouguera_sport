import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Avatar } from "../../components/Avatar";

describe("Avatar Component", () => {
    it("should render an image when src is provided", () => {
        render(<Avatar src="https://example.com/photo.jpg" name="John Doe" />);
        const img = screen.getByAltText("Avatar de John Doe");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
    });

    it("should render initials when no src is provided", () => {
        render(<Avatar name="Alice Dupont" />);
        // The text content should be 'AD'
        expect(screen.getByText("AD")).toBeInTheDocument();
    });

    it("should handle single word names correctly", () => {
        render(<Avatar name="Admin" />);
        expect(screen.getByText("AD")).toBeInTheDocument();
    });

    it("should fallback to '?' if name is empty", () => {
        render(<Avatar name="  " />);
        expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("should apply size classes correctly", () => {
        const { container } = render(<Avatar name="Bob" size="xl" />);
        // By default size xl is "h-16 w-16 text-xl"
        expect(container.firstChild).toHaveClass("h-16 w-16 text-xl");
    });
});
