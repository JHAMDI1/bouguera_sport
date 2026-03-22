import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DropdownMenu, DropdownItem } from "../../components/DropdownMenu";

describe("DropdownMenu Component", () => {
    it("renders the trigger button", () => {
        render(
            <DropdownMenu>
                <DropdownItem>Modifier</DropdownItem>
            </DropdownMenu>
        );
        const trigger = screen.getByRole("button", { expanded: false });
        expect(trigger).toBeInTheDocument();
    });

    it("opens the menu when trigger is clicked", () => {
        render(
            <DropdownMenu>
                <DropdownItem>Modifier</DropdownItem>
                <DropdownItem danger>Supprimer</DropdownItem>
            </DropdownMenu>
        );

        const trigger = screen.getByRole("button");
        fireEvent.click(trigger);

        expect(screen.getByRole("menu")).toBeInTheDocument();
        expect(screen.getByText("Modifier")).toBeInTheDocument();
        expect(screen.getByText("Supprimer")).toBeInTheDocument();
    });

    it("closes the menu when clicking outside", () => {
        render(
            <div>
                <span data-testid="outside">Outside</span>
                <DropdownMenu>
                    <DropdownItem>Action</DropdownItem>
                </DropdownMenu>
            </div>
        );

        const trigger = screen.getByRole("button");
        fireEvent.click(trigger);
        expect(screen.getByRole("menu")).toBeInTheDocument();

        fireEvent.mouseDown(screen.getByTestId("outside"));
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
});

describe("DropdownItem Component", () => {
    it("calls onClick when clicked", () => {
        const onClickMock = vi.fn();
        render(
            <DropdownItem onClick={onClickMock}>Modifier</DropdownItem>
        );
        fireEvent.click(screen.getByText("Modifier"));
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("applies danger styling when danger prop is true", () => {
        render(<DropdownItem danger>Supprimer</DropdownItem>);
        const item = screen.getByRole("menuitem", { name: "Supprimer" });
        expect(item).toHaveClass("text-error");
    });

    it("renders an icon if provided", () => {
        render(
            <DropdownItem icon={<span data-testid="icon">🖊</span>}>
                Modifier
            </DropdownItem>
        );
        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });
});
