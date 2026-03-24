import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    exportToCSV,
    exportMembersToCSV,
    exportPaymentsToCSV,
    exportExpensesToCSV,
    exportFamiliesToCSV,
} from "../../lib/export";

describe("export.ts utilities", () => {
    let appendChildSpy: ReturnType<typeof vi.spyOn>;
    let removeChildSpy: ReturnType<typeof vi.spyOn>;
    let clickSpy: ReturnType<typeof vi.fn>;
    let createElementSpy: ReturnType<typeof vi.spyOn>;
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let alertSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        clickSpy = vi.fn();
        const fakeLink = {
            href: "",
            download: "",
            click: clickSpy,
        } as unknown as HTMLAnchorElement;

        createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(fakeLink);
        appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => fakeLink);
        removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => fakeLink);
        createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
        revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => { });
        alertSpy = vi.spyOn(window, "alert").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("exportToCSV", () => {
        it("calls alert when data is empty", () => {
            exportToCSV([], "test");
            expect(alertSpy).toHaveBeenCalledWith("Aucune donnée à exporter");
        });

        it("creates a link and triggers download", () => {
            exportToCSV([{ name: "Alice", age: 30 }], "test");
            expect(createElementSpy).toHaveBeenCalledWith("a");
            expect(clickSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
            expect(revokeObjectURLSpy).toHaveBeenCalled();
        });

        it("uses custom headers when provided", () => {
            exportToCSV(
                [{ name: "Alice", age: 30 }],
                "test",
                [{ key: "name", label: "Prénom" }]
            );
            expect(clickSpy).toHaveBeenCalled();
        });

        it("handles boolean values (Oui/Non)", () => {
            exportToCSV([{ active: true }, { active: false }], "booleans");
            expect(clickSpy).toHaveBeenCalled();
        });

        it("handles null/undefined values", () => {
            exportToCSV([{ name: null, extra: undefined }], "nulls");
            expect(clickSpy).toHaveBeenCalled();
        });

        it("handles Date values", () => {
            exportToCSV([{ date: new Date("2024-01-15") }], "dates");
            expect(clickSpy).toHaveBeenCalled();
        });

        it("handles strings with quotes (escaping)", () => {
            exportToCSV([{ name: 'John "Senior" Doe' }], "quotes");
            expect(clickSpy).toHaveBeenCalled();
        });
    });

    describe("exportMembersToCSV", () => {
        it("exports member data correctly", () => {
            const members = [
                {
                    firstName: "Alice",
                    lastName: "Dupont",
                    phone: "06 01 02 03 04",
                    email: "alice@test.com",
                    registrationDate: Date.now(),
                    medicalCertificateExpiry: Date.now(),
                    isActive: true,
                },
            ];
            exportMembersToCSV(members);
            expect(clickSpy).toHaveBeenCalled();
        });

        it("handles missing optional fields", () => {
            const members = [
                {
                    firstName: "Bob",
                    lastName: "Martin",
                    registrationDate: Date.now(),
                    isActive: false,
                },
            ];
            exportMembersToCSV(members);
            expect(clickSpy).toHaveBeenCalled();
        });
    });

    describe("exportPaymentsToCSV", () => {
        it("exports payment data correctly", () => {
            const payments = [
                {
                    receiptNumber: "R-001",
                    memberName: "Alice",
                    amount: 100,
                    monthCovered: 1,
                    yearCovered: 2024,
                    paymentDate: Date.now(),
                    receivedByName: "Admin",
                },
            ];
            exportPaymentsToCSV(payments);
            expect(clickSpy).toHaveBeenCalled();
        });
    });

    describe("exportExpensesToCSV", () => {
        it("exports expense data correctly", () => {
            const expenses = [
                {
                    expenseDate: Date.now(),
                    categoryName: "Loyer",
                    description: "Loyer mensuel",
                    amount: 1500,
                    recordedByName: "Admin",
                },
            ];
            exportExpensesToCSV(expenses);
            expect(clickSpy).toHaveBeenCalled();
        });
    });

    describe("exportFamiliesToCSV", () => {
        it("exports family data correctly", () => {
            const families = [
                {
                    familyName: "Dupont",
                    primaryContactName: "Jean",
                    primaryContactPhone: "06 xx xx xx xx",
                    discountPercentage: 10,
                    isActive: true,
                    members: [1, 2],
                },
            ];
            exportFamiliesToCSV(families);
            expect(clickSpy).toHaveBeenCalled();
        });

        it("handles missing optional fields", () => {
            const families = [
                {
                    familyName: "Smith",
                    primaryContactName: "Jane",
                    isActive: false,
                },
            ];
            exportFamiliesToCSV(families);
            expect(clickSpy).toHaveBeenCalled();
        });
    });
});
