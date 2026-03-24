import { z } from "zod";

// --- Members ---
export const memberSchema = z.object({
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    phone: z.string().optional(),
    gender: z.enum(["male", "female", "other"]),
    photoUrl: z.string().optional(),
    medicalCertificateUrl: z.string().optional(),
});

export const updateMemberSchema = memberSchema.extend({
    isActive: z.boolean(),
});

export type MemberFormData = z.infer<typeof memberSchema>;
export type UpdateMemberFormData = z.infer<typeof updateMemberSchema>;


// --- Payments ---
export const paymentSchema = z.object({
    memberId: z.string().optional(),
    familyId: z.string().optional(),
    disciplineId: z.string().optional(),
    amount: z.number().min(1, "Montant requis"),
    monthCovered: z.number().min(1).max(12),
    yearCovered: z.number().min(2020).max(2100),
    receiptNumber: z.string().min(1, "Numéro de reçu requis"),
    notes: z.string().optional(),
}).refine((data) => data.memberId || data.familyId, {
    message: "Vous devez sélectionner un membre ou une famille",
    path: ["memberId"],
});

export type PaymentFormData = z.infer<typeof paymentSchema>;


// --- Families ---
export const familySchema = z.object({
    familyName: z.string().min(1, "Nom de famille requis"),
    primaryContactName: z.string().min(1, "Nom du contact requis"),
    primaryContactPhone: z.string().optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
});

export const updateFamilySchema = familySchema.extend({
    isActive: z.boolean(),
});

export type FamilyFormData = z.infer<typeof familySchema>;
export type UpdateFamilyFormData = z.infer<typeof updateFamilySchema>;


// --- Groups ---
export const groupSchema = z.object({
    name: z.string().min(2, "Nom du groupe requis"),
    disciplineId: z.string().min(1, "Discipline requise"),
    coachId: z.string().min(1, "Coach requis"),
    schedule: z.string().optional(),
    maxCapacity: z.number().min(1, "Capacité minimale de 1"),
});

export const updateGroupSchema = groupSchema.extend({
    isActive: z.boolean(),
});

export type GroupFormData = z.infer<typeof groupSchema>;
export type UpdateGroupFormData = z.infer<typeof updateGroupSchema>;


// --- Coaches ---
export const coachSchema = z.object({
    email: z.string().email("Email invalide"),
    fullName: z.string().min(2, "Nom complet requis"),
    phone: z.string().optional(),
    role: z.enum(["admin", "cashier", "coach"]),
});

export const updateCoachSchema = z.object({
    fullName: z.string().min(2, "Nom complet requis"),
    phone: z.string().optional(),
    role: z.enum(["admin", "cashier", "coach"]),
    isActive: z.boolean(),
});

export type CoachFormData = z.infer<typeof coachSchema>;
export type UpdateCoachFormData = z.infer<typeof updateCoachSchema>;


// --- Expenses ---
export const expenseSchema = z.object({
    categoryId: z.string().min(1, "Catégorie requise"),
    description: z.string().min(2, "Description requise"),
    amount: z.number().min(0.001, "Montant requis"),
    expenseDate: z.number().min(1, "Date requise"),
    receiptUrl: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;


// --- Schedule (Sessions) ---
export const sessionSchema = z.object({
    groupId: z.string().min(1, "Groupe requis"),
    coachId: z.string().min(1, "Coach requis"),
    title: z.string().min(1, "Titre requis"),
    dayOfWeek: z.number().min(0).max(6),
    startHour: z.number().min(0).max(23),
    startMinute: z.number().min(0).max(59),
    endHour: z.number().min(0).max(23),
    endMinute: z.number().min(0).max(59),
    location: z.string().optional(),
    notes: z.string().optional(),
    isRecurring: z.boolean(),
});

export type SessionFormData = z.infer<typeof sessionSchema>;

// --- Disciplines ---
export const disciplineSchema = z.object({
    name: z.string().min(2, "Nom de la discipline requis"),
    description: z.string().optional(),
    monthlyFee: z.number().min(0, "Tarif mensuel requis"),
});

export const updateDisciplineSchema = disciplineSchema.extend({
    isActive: z.boolean(),
});

export type DisciplineFormData = z.infer<typeof disciplineSchema>;
export type UpdateDisciplineFormData = z.infer<typeof updateDisciplineSchema>;
