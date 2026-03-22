import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ─── Membres ──────────────────────────────────────────────────────────────────

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
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { createdBy, ...memberData } = args;

    // Validation métier
    if (args.firstName.trim().length < 2) throw new Error("Le prénom doit contenir au moins 2 caractères");
    if (args.lastName.trim().length < 2) throw new Error("Le nom de famille doit contenir au moins 2 caractères");

    // Si un téléphone est fourni, vérifier un format basique (optionnel mais recommandé)
    if (args.phone && args.phone.trim().length < 8) {
      throw new Error("Le numéro de téléphone semble invalide");
    }

    const memberId = await ctx.db.insert("members", {
      ...memberData,
      registrationDate: Date.now(),
      isActive: true,
      createdAt: Date.now(),
    });

    // Audit log
    if (createdBy) {
      await ctx.db.insert("auditLog", {
        userId: createdBy,
        action: "MEMBER_CREATED",
        entityType: "member",
        entityId: memberId,
        details: `Membre créé: ${args.firstName} ${args.lastName}`,
        createdAt: Date.now(),
      });
    }

    return memberId;
  },
});

export const updateMember = mutation({
  args: {
    id: v.id("members"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    medicalCertificateExpiry: v.optional(v.number()),
    address: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, updatedBy, ...updates } = args;
    await ctx.db.patch(id, updates);

    // Audit log
    if (updatedBy) {
      const changedFields = Object.keys(updates).join(", ");
      await ctx.db.insert("auditLog", {
        userId: updatedBy,
        action: "MEMBER_UPDATED",
        entityType: "member",
        entityId: id,
        details: `Champs modifiés: ${changedFields}`,
        createdAt: Date.now(),
      });
    }

    return id;
  },
});

// ─── Paiements ────────────────────────────────────────────────────────────────

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
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("card"), v.literal("transfer"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validation métier
    if (args.amount <= 0) throw new Error("Le montant du paiement doit être supérieur à 0");
    if (args.monthCovered < 1 || args.monthCovered > 12) throw new Error("Le mois doit être compris entre 1 et 12");
    if (args.yearCovered < 2000 || args.yearCovered > 2100) throw new Error("L'année est invalide");
    if (!args.memberId && !args.familyId) throw new Error("Un paiement doit être rattaché à un membre ou une famille");

    const paymentId = await ctx.db.insert("payments", {
      ...args,
      paymentMethod: args.paymentMethod ?? "cash",
      paymentDate: Date.now(),
      createdAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLog", {
      userId: args.receivedBy,
      action: "PAYMENT_CREATED",
      entityType: "payment",
      entityId: paymentId,
      details: `Paiement créé: ${args.receiptNumber} - ${args.amount} TND - Mois ${args.monthCovered}/${args.yearCovered}`,
      createdAt: Date.now(),
    });

    return paymentId;
  },
});
