import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton, SkeletonTable } from "../../components/Skeleton";

describe("Skeleton Component", () => {
    it("renders with default 'rounded' variant", () => {
        const { container } = render(<Skeleton />);
        const el = container.firstChild as HTMLElement;
        expect(el).toHaveClass("skeleton", "rounded-xl");
        expect(el).toHaveAttribute("aria-hidden", "true");
    });

    it("renders text variant correctly", () => {
        const { container } = render(<Skeleton variant="text" />);
        const el = container.firstChild as HTMLElement;
        expect(el).toHaveClass("rounded-md", "h-4", "w-full");
    });

    it("renders circular variant correctly", () => {
        const { container } = render(<Skeleton variant="circular" />);
        const el = container.firstChild as HTMLElement;
        expect(el).toHaveClass("rounded-full", "h-10", "w-10");
    });

    it("renders rectangular variant correctly", () => {
        const { container } = render(<Skeleton variant="rectangular" />);
        const el = container.firstChild as HTMLElement;
        expect(el).toHaveClass("h-full", "w-full");
        expect(el).not.toHaveClass("rounded-xl");
    });

    it("applies custom class", () => {
        const { container } = render(<Skeleton className="h-20" />);
        const el = container.firstChild as HTMLElement;
        expect(el).toHaveClass("h-20");
    });
});

describe("SkeletonTable Component", () => {
    it("renders correct default number of rows and cols", () => {
        const { container } = render(<SkeletonTable />);
        // 5 rows by default
        const rows = container.querySelectorAll(".border-t");
        expect(rows.length).toBe(5);
    });

    it("renders custom number of rows", () => {
        const { container } = render(<SkeletonTable rows={3} cols={2} />);
        const rows = container.querySelectorAll(".border-t");
        expect(rows.length).toBe(3);
    });
});
