import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table users (SuperAdmin & Coachs)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    role: v.union(v.literal("superadmin"), v.literal("coach")),
    fullName: v.string(),
    phone: v.optional(v.string()),
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
    firstName: v.string(),
    lastName: v.string(),
    familyId: v.optional(v.id("families")),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    phone: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    medicalCertificateExpiry: v.optional(v.number()),
    address: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    registrationDate: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_familyId", ["familyId"])
    .index("by_lastName", ["lastName"])
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
    paymentMethod: v.literal("cash"),
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

  // Table auditLog (Journal d'activité)
  auditLog: defineTable({
    userId: v.id("users"),
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
