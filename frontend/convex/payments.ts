import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Queries Paiements ────────────────────────────────────────────────────────

import { paginationOptsValidator } from "convex/server";

export const getPaymentsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    memberId: v.optional(v.id("members")),
    familyId: v.optional(v.id("families")),
  },
  handler: async (ctx, args) => {
    if (args.memberId !== undefined) {
      return await ctx.db
        .query("payments")
        .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId!))
        .paginate(args.paginationOpts);
    }
    if (args.familyId !== undefined) {
      return await ctx.db
        .query("payments")
        .withIndex("by_familyId", (q) => q.eq("familyId", args.familyId!))
        .paginate(args.paginationOpts);
    }
    return await ctx.db.query("payments").order("desc").paginate(args.paginationOpts);
  },
});


export const getPayments = query({
  args: {
    memberId: v.optional(v.id("members")),
    familyId: v.optional(v.id("families")),
    monthCovered: v.optional(v.number()),
    yearCovered: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Utiliser l'index le plus sélectif en premier
    if (args.memberId !== undefined) {
      let payments = await ctx.db
        .query("payments")
        .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
        .collect();

      if (args.monthCovered !== undefined) {
        payments = payments.filter((p) => p.monthCovered === args.monthCovered);
      }
      if (args.yearCovered !== undefined) {
        payments = payments.filter((p) => p.yearCovered === args.yearCovered);
      }
      return payments;
    }

    if (args.familyId !== undefined) {
      let payments = await ctx.db
        .query("payments")
        .withIndex("by_familyId", (q) => q.eq("familyId", args.familyId))
        .collect();

      if (args.monthCovered !== undefined) {
        payments = payments.filter((p) => p.monthCovered === args.monthCovered);
      }
      if (args.yearCovered !== undefined) {
        payments = payments.filter((p) => p.yearCovered === args.yearCovered);
      }
      return payments;
    }

    // Filtre par date de paiement ordonnée
    let payments = await ctx.db
      .query("payments")
      .withIndex("by_paymentDate")
      .order("desc")
      .collect();

    if (args.monthCovered !== undefined) {
      payments = payments.filter((p) => p.monthCovered === args.monthCovered);
    }
    if (args.yearCovered !== undefined) {
      payments = payments.filter((p) => p.yearCovered === args.yearCovered);
    }
    return payments;
  },
});

export const getPaymentById = query({
  args: { id: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPaymentByReceipt = query({
  args: { receiptNumber: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_receiptNumber", (q) =>
        q.eq("receiptNumber", args.receiptNumber)
      )
      .first();

    if (!payment) return null;

    // Enrichir avec le nom du membre
    const member = payment.memberId
      ? await ctx.db.get(payment.memberId)
      : null;
    const receiver = await ctx.db.get(payment.receivedBy);

    return {
      ...payment,
      memberName: member
        ? `${member.firstName} ${member.lastName}`
        : "Paiement familial",
      receivedBy: receiver?.fullName ?? "Admin",
      monthCovered: String(payment.monthCovered),
      yearCovered: payment.yearCovered,
    };
  },
});

// ─── Annulation de Paiement ───────────────────────────────────────────────────

export const cancelPayment = mutation({
  args: {
    paymentId: v.string(),
    cancelledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Trouver le paiement par son ID string (format Convex ID)
    // On cherche dans tous les paiements (la table n'a pas d'index par ID custom)
    const payments = await ctx.db.query("payments").collect();
    const payment = payments.find((p) => p._id === args.paymentId || p._id.toString() === args.paymentId);

    if (!payment) {
      throw new Error(`Paiement introuvable: ${args.paymentId}`);
    }

    // Marquer comme annulé
    await ctx.db.patch(payment._id, {
      notes: `ANNULÉ le ${new Date(args.cancelledAt ?? Date.now()).toLocaleDateString("fr-FR")}${payment.notes ? " | " + payment.notes : ""}`,
    });

    // Audit log
    await ctx.db.insert("auditLog", {
      userId: payment.receivedBy,
      action: "PAYMENT_CANCELLED",
      entityType: "payment",
      entityId: payment._id,
      details: `Paiement annulé: ${payment.receiptNumber} - Montant: ${payment.amount} TND`,
      createdAt: args.cancelledAt ?? Date.now(),
    });

    return payment._id;
  },
});

// ─── Dépenses ──────────────────────────────────────────────────────────────────

export const getExpensesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("expenseCategories")),
  },
  handler: async (ctx, args) => {
    if (args.categoryId !== undefined) {
      return await ctx.db
        .query("expenses")
        .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!))
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("expenses")
      .withIndex("by_expenseDate")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});


export const getExpenses = query({
  args: {
    categoryId: v.optional(v.id("expenseCategories")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.categoryId !== undefined) {
      let expenses = await ctx.db
        .query("expenses")
        .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!))
        .collect();

      if (args.startDate !== undefined) {
        expenses = expenses.filter((e) => e.expenseDate >= args.startDate!);
      }
      if (args.endDate !== undefined) {
        expenses = expenses.filter((e) => e.expenseDate <= args.endDate!);
      }
      return expenses;
    }

    // Ordonné par date (index by_expenseDate)
    let expenses = await ctx.db
      .query("expenses")
      .withIndex("by_expenseDate")
      .order("desc")
      .collect();

    if (args.startDate !== undefined) {
      expenses = expenses.filter((e) => e.expenseDate >= args.startDate!);
    }
    if (args.endDate !== undefined) {
      expenses = expenses.filter((e) => e.expenseDate <= args.endDate!);
    }
    return expenses;
  },
});

export const getExpenseCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query("expenseCategories").collect();
  },
});

export const createExpenseCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("expenseCategories", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateExpenseCategory = mutation({
  args: {
    id: v.id("expenseCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteExpenseCategory = mutation({
  args: { id: v.id("expenseCategories") },
  handler: async (ctx, args) => {
    const expenses = await ctx.db.query("expenses")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.id))
      .first();
    if (expenses) {
      throw new Error("Impossible de supprimer une catégorie contenant des dépenses");
    }
    await ctx.db.delete(args.id);
  },
});
