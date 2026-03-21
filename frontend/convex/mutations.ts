import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createMember = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const memberId = await ctx.db.insert("members", {
      ...args,
      registrationDate: Date.now(),
      isActive: true,
      createdAt: Date.now(),
    });
    return memberId;
  },
});

export const updateMember = mutation({
  args: {
    id: v.id("members"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    medicalCertificateExpiry: v.optional(v.number()),
    address: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const createPayment = mutation({
  args: {
    memberId: v.optional(v.id("members")),
    familyId: v.optional(v.id("families")),
    disciplineId: v.optional(v.id("disciplines")),
    amount: v.number(),
    monthCovered: v.number(),
    yearCovered: v.number(),
    receivedBy: v.id("users"),
    receiptNumber: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      ...args,
      paymentDate: Date.now(),
      paymentMethod: "cash",
      createdAt: Date.now(),
    });
    return paymentId;
  },
});
