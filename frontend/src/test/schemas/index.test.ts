import { describe, it, expect } from "vitest";
import {
    memberSchema,
    paymentSchema,
    familySchema,
    groupSchema,
    coachSchema,
    expenseSchema,
    sessionSchema,
    disciplineSchema
} from "../../schemas";

describe("Zod Schemas Validation", () => {
    describe("memberSchema", () => {
        it("should validate a correct member", () => {
            const data = { firstName: "John", lastName: "Doe", gender: "male" };
            expect(memberSchema.safeParse(data).success).toBe(true);
        });

        it("should reject if names are too short", () => {
            const data = { firstName: "J", lastName: "D", gender: "male" };
            const result = memberSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
            }
        });
    });

    describe("paymentSchema", () => {
        it("should validate if at least memberId or familyId is provided", () => {
            const data = {
                memberId: "m_1",
                amount: 100,
                monthCovered: 5,
                yearCovered: 2024,
                receiptNumber: "REC-001"
            };
            expect(paymentSchema.safeParse(data).success).toBe(true);
        });

        it("should reject if both memberId and familyId are missing", () => {
            const data = {
                amount: 100,
                monthCovered: 5,
                yearCovered: 2024,
                receiptNumber: "REC-001"
            };
            const result = paymentSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Vous devez sélectionner un membre ou une famille");
            }
        });

        it("should reject invalid months or years", () => {
            const data = {
                memberId: "m_1", amount: 100, monthCovered: 13, yearCovered: 2150, receiptNumber: "REC-001"
            };
            expect(paymentSchema.safeParse(data).success).toBe(false);
        });
    });

    describe("familySchema", () => {
        it("should validate a correct family", () => {
            const data = { familyName: "Smiths", primaryContactName: "John Smith", discountPercentage: 10 };
            expect(familySchema.safeParse(data).success).toBe(true);
        });
    });

    describe("groupSchema", () => {
        it("should validate a correct group", () => {
            const data = { name: "Pro Team", disciplineId: "d_1", coachId: "c_1", maxCapacity: 20 };
            expect(groupSchema.safeParse(data).success).toBe(true);
        });
    });

    describe("coachSchema", () => {
        it("should reject invalid email", () => {
            const data = { email: "not-an-email", fullName: "Coach Ben" };
            const result = coachSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
        it("should accept valid coach", () => {
            const data = { email: "ben@coach.com", fullName: "Coach Ben" };
            expect(coachSchema.safeParse(data).success).toBe(true);
        });
    });

    describe("expenseSchema", () => {
        it("should validate correct expense", () => {
            const data = { categoryId: "cat_1", description: "Loyer", amount: 1500, expenseDate: Date.now() };
            expect(expenseSchema.safeParse(data).success).toBe(true);
        });
        it("should reject negative amount", () => {
            const data = { categoryId: "cat_1", description: "Loyer", amount: -10, expenseDate: Date.now() };
            expect(expenseSchema.safeParse(data).success).toBe(false);
        });
    });

    describe("sessionSchema", () => {
        it("should validate correct session", () => {
            const data = {
                groupId: "g_1", coachId: "c_1", title: "Morning Yoga",
                dayOfWeek: 1, startHour: 8, startMinute: 30, endHour: 10, endMinute: 0,
                isRecurring: true
            };
            expect(sessionSchema.safeParse(data).success).toBe(true);
        });
        it("should reject invalid hours", () => {
            const data = {
                groupId: "g_1", coachId: "c_1", title: "Midnight Yoga",
                dayOfWeek: 1, startHour: 25, startMinute: 60, endHour: 10, endMinute: 0,
                isRecurring: false
            };
            expect(sessionSchema.safeParse(data).success).toBe(false);
        });
    });

    describe("disciplineSchema", () => {
        it("should validate a correct discipline", () => {
            const data = { name: "Boxing", monthlyFee: 50 };
            expect(disciplineSchema.safeParse(data).success).toBe(true);
        });
    });
});
