import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FormInput } from "../../components/FormInput";

describe("FormInput Component", () => {
    it("renders label and input correctly", () => {
        const fakeRegistration = { name: "testField", onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() };
        render(<FormInput label="Email" type="email" registration={fakeRegistration as any} />);

        expect(screen.getByText("Email")).toBeInTheDocument();
        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("name", "testField");
        expect(input).toHaveAttribute("type", "email");
    });

    it("displays error message when error is provided", () => {
        const fakeRegistration = { name: "testField", onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() };
        const fakeError = { type: "manual", message: "Email is required" };

        render(<FormInput label="Email" registration={fakeRegistration as any} error={fakeError as any} />);

        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toHaveClass("text-error");
    });
});
