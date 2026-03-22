import { describe, it, expect } from "vitest";
import {
    getDisciplineName,
    getGroupName,
    getFamilyName,
    getCoachName,
    getUserName,
    getCategoryName,
    getMemberName
} from "../../lib/lookups";

describe("Lookups Utils", () => {
    describe("getDisciplineName", () => {
        const disciplines = [{ _id: "id_1", name: "Yoga" }, { _id: "id_2", name: "Pilates" }];

        it("should return the correct discipline name", () => {
            expect(getDisciplineName(disciplines, "id_1")).toBe("Yoga");
            expect(getDisciplineName(disciplines, "id_2")).toBe("Pilates");
        });

        it("should return 'Inconnu' if id is not found", () => {
            expect(getDisciplineName(disciplines, "invalid_id")).toBe("Inconnu");
        });

        it("should return 'Inconnu' if list is undefined", () => {
            expect(getDisciplineName(undefined, "id_1")).toBe("Inconnu");
        });
    });

    describe("getGroupName", () => {
        const groups = [{ _id: "g_1", name: "Beginners" }, { _id: "g_2", name: "Advanced" }];

        it("should return the correct group name", () => {
            expect(getGroupName(groups, "g_1")).toBe("Beginners");
        });

        it("should return 'Inconnu' if id is not found", () => {
            expect(getGroupName(groups, "g_3")).toBe("Inconnu");
        });

        it("should return 'Inconnu' if list is undefined", () => {
            expect(getGroupName(undefined, "g_1")).toBe("Inconnu");
        });
    });

    describe("getFamilyName", () => {
        const families = [{ _id: "f_1", familyName: "Smith" }];

        it("should return the correct family name", () => {
            expect(getFamilyName(families, "f_1")).toBe("Smith");
        });

        it("should return 'Inconnu' if id is not found or list is undefined", () => {
            expect(getFamilyName(families, "invalid")).toBe("Inconnu");
            expect(getFamilyName(undefined, "f_1")).toBe("Inconnu");
        });
    });

    describe("getCoachName", () => {
        const coaches = [{ _id: "c_1", fullName: "Coach John" }];

        it("should return the correct coach name", () => {
            expect(getCoachName(coaches, "c_1")).toBe("Coach John");
        });

        it("should return 'Inconnu' if id is not found or list is undefined", () => {
            expect(getCoachName(coaches, "invalid")).toBe("Inconnu");
            expect(getCoachName(undefined, "c_1")).toBe("Inconnu");
        });
    });

    describe("getUserName", () => {
        const users = [{ _id: "u_1", fullName: "Admin Doe" }];

        it("should return the correct user name", () => {
            expect(getUserName(users, "u_1")).toBe("Admin Doe");
        });

        it("should return 'Inconnu' if id is not found or list is undefined", () => {
            expect(getUserName(users, "invalid")).toBe("Inconnu");
            expect(getUserName(undefined, "u_1")).toBe("Inconnu");
        });
    });

    describe("getCategoryName", () => {
        const categories = [{ _id: "cat_1", name: "Equipement" }];

        it("should return the correct category name", () => {
            expect(getCategoryName(categories, "cat_1")).toBe("Equipement");
        });

        it("should return 'Inconnu' if id is not found or list is undefined", () => {
            expect(getCategoryName(categories, "invalid")).toBe("Inconnu");
            expect(getCategoryName(undefined, "cat_1")).toBe("Inconnu");
        });
    });

    describe("getMemberName", () => {
        const members = [{ _id: "m_1", firstName: "Alice", lastName: "Wonder" }];

        it("should return the full member name (firstName + lastName)", () => {
            expect(getMemberName(members, "m_1")).toBe("Alice Wonder");
        });

        it("should return 'Inconnu' if id is not found or list is undefined", () => {
            expect(getMemberName(members, "invalid")).toBe("Inconnu");
            expect(getMemberName(undefined, "m_1")).toBe("Inconnu");
        });
    });
});
