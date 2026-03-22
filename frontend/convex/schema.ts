import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export default defineSchema({
  // Table users (SuperAdmin & Coachs)
  users: defineTable({
    clerkId: v.optional(v.string()), // rendu optionnel pour créer des coachs en attente
    email: v.string(),
    role: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("cashier"),
      v.literal("coach")
    ),
    fullName: v.string(),
    phone: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Table disciplines (Taekwondo, Kung Fu, etc.)
  disciplines: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    monthlyFee: v.number(),
    color: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"]),

  // Table groups (Groupes de cours)
  groups: defineTable({
    name: v.string(),
    disciplineId: v.id("disciplines"),
    coachId: v.id("users"),
    schedule: v.optional(v.string()), // horaires JSON ou string
    maxCapacity: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_disciplineId", ["disciplineId"])
    .index("by_coachId", ["coachId"]),

  // Table families (Comptes Familiaux)
  families: defineTable({
    familyName: v.string(),
    primaryContactName: v.string(),
    primaryContactPhone: v.optional(v.string()),
    discountPercentage: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }),

  // Table members (Adhérents)
  members: defineTable({
    userId: v.optional(v.string()), // Lier avec Clerk (Portail Adhérent)
    firstName: v.string(),
    lastName: v.string(),
    familyId: v.optional(v.id("families")),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    phone: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    medicalCertificateExpiry: v.optional(v.number()),
    medicalCertificateUrl: v.optional(v.string()),
    address: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    registrationDate: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_familyId", ["familyId"])
    .index("by_lastName", ["lastName"])
    .index("by_userId", ["userId"])
    .index("by_isActive", ["isActive"]),

  // Table memberSubscriptions (Inscription aux Disciplines & Groupes)
  memberSubscriptions: defineTable({
    memberId: v.id("members"),
    disciplineId: v.id("disciplines"),
    groupId: v.optional(v.id("groups")),
    customMonthlyFee: v.optional(v.number()),
    currentBeltLevel: v.optional(v.string()),
    joinedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_disciplineId", ["disciplineId"])
    .index("by_groupId", ["groupId"]),

  // Table payments (Paiements)
  payments: defineTable({
    familyId: v.optional(v.id("families")),
    memberId: v.optional(v.id("members")),
    disciplineId: v.optional(v.id("disciplines")),
    amount: v.number(),
    paymentDate: v.number(),
    monthCovered: v.number(), // mois payé (1-12)
    yearCovered: v.number(),
    receivedBy: v.id("users"),
    paymentMethod: v.union(v.literal("cash"), v.literal("card"), v.literal("transfer")),
    receiptNumber: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_familyId", ["familyId"])
    .index("by_memberId", ["memberId"])
    .index("by_paymentDate", ["paymentDate"])
    .index("by_receiptNumber", ["receiptNumber"]),

  // Table expenses (Dépenses)
  expenses: defineTable({
    categoryId: v.id("expenseCategories"),
    description: v.string(),
    amount: v.number(),
    expenseDate: v.number(),
    recordedBy: v.id("users"),
    receiptUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_categoryId", ["categoryId"])
    .index("by_expenseDate", ["expenseDate"]),

  // Table expenseCategories
  expenseCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }),

  // Table attendance (Présences)
  attendance: defineTable({
    memberId: v.id("members"),
    groupId: v.id("groups"),
    date: v.number(),
    isPresent: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_groupId", ["groupId"])
    .index("by_date", ["date"]),

  // Table sessions (Planning des cours)
  sessions: defineTable({
    groupId: v.id("groups"),
    coachId: v.id("users"),
    title: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    dayOfWeek: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_coachId", ["coachId"])
    .index("by_startTime", ["startTime"]),

  // Table settings (Configuration SaaS globale)
  settings: defineTable({
    clubName: v.string(),
    currency: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    taxRate: v.number(),
    logoUrl: v.optional(v.string()),
    address: v.optional(v.string()),
    updatedAt: v.number(),
  }),

  // Table auditLog (Journal d'activité)
  auditLog: defineTable({
    userId: v.optional(v.union(v.id("users"), v.literal("system"))), // optionnel pour les actions système (cron jobs)
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_entityType_entityId", ["entityType", "entityId"])
    .index("by_createdAt", ["createdAt"]),
});
