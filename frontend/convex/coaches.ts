import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const createCoach = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("cashier"), v.literal("coach")),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { createdBy, role, ...coachData } = args;
    const coachId = await ctx.db.insert("users", {
      ...coachData,
      role: role,
      isActive: true,
      createdAt: Date.now(),
    });

    if (createdBy) {
      await ctx.db.insert("auditLog", {
        userId: createdBy,
        action: "STAFF_CREATED",
        entityType: "user",
        entityId: coachId,
        details: `Membre du staff créé: ${args.fullName} (${args.email}) - Rôle: ${role}`,
        createdAt: Date.now(),
      });
    }
    return coachId;
  },
});

export const updateCoach = mutation({
  args: {
    id: v.id("users"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("cashier"), v.literal("coach"))),
    isActive: v.optional(v.boolean()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, updatedBy, ...updates } = args;
    await ctx.db.patch(id, updates);

    if (updatedBy) {
      await ctx.db.insert("auditLog", {
        userId: updatedBy,
        action: "COACH_UPDATED",
        entityType: "user",
        entityId: id,
        details: `Coach mis à jour: champs ${Object.keys(updates).join(", ")}`,
        createdAt: Date.now(),
      });
    }
    return id;
  },
});

export const deleteCoach = mutation({
  args: { id: v.id("users"), deletedBy: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const coach = await ctx.db.get(args.id);
    if (coach && args.deletedBy) {
      await ctx.db.insert("auditLog", {
        userId: args.deletedBy,
        action: "COACH_DELETED",
        entityType: "user",
        entityId: args.id,
        details: `Coach supprimé: ${coach.fullName}`,
        createdAt: Date.now(),
      });
    }
    await ctx.db.delete(args.id);
  },
});

export const createDiscipline = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    monthlyFee: v.number(),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { createdBy, ...disciplineData } = args;
    const disciplineId = await ctx.db.insert("disciplines", {
      ...disciplineData,
      isActive: true,
      createdAt: Date.now(),
    });

    if (createdBy) {
      await ctx.db.insert("auditLog", {
        userId: createdBy,
        action: "DISCIPLINE_CREATED",
        entityType: "discipline",
        entityId: disciplineId,
        details: `Discipline créée: ${args.name} (${args.monthlyFee} TND/mois)`,
        createdAt: Date.now(),
      });
    }
    return disciplineId;
  },
});

export const updateDiscipline = mutation({
  args: {
    id: v.id("disciplines"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    monthlyFee: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteDiscipline = mutation({
  args: { id: v.id("disciplines"), deletedBy: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const discipline = await ctx.db.get(args.id);
    if (discipline && args.deletedBy) {
      await ctx.db.insert("auditLog", {
        userId: args.deletedBy,
        action: "DISCIPLINE_DELETED",
        entityType: "discipline",
        entityId: args.id,
        details: `Discipline supprimée: ${discipline.name}`,
        createdAt: Date.now(),
      });
    }
    await ctx.db.delete(args.id);
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    disciplineId: v.id("disciplines"),
    coachId: v.id("users"),
    schedule: v.optional(v.string()),
    maxCapacity: v.number(),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { createdBy, ...groupData } = args;
    const groupId = await ctx.db.insert("groups", {
      ...groupData,
      isActive: true,
      createdAt: Date.now(),
    });

    if (createdBy) {
      await ctx.db.insert("auditLog", {
        userId: createdBy,
        action: "GROUP_CREATED",
        entityType: "group",
        entityId: groupId,
        details: `Groupe créé: ${args.name}`,
        createdAt: Date.now(),
      });
    }
    return groupId;
  },
});

export const updateGroup = mutation({
  args: {
    id: v.id("groups"),
    name: v.optional(v.string()),
    disciplineId: v.optional(v.id("disciplines")),
    coachId: v.optional(v.id("users")),
    schedule: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteGroup = mutation({
  args: { id: v.id("groups"), deletedBy: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.id);
    if (group && args.deletedBy) {
      await ctx.db.insert("auditLog", {
        userId: args.deletedBy,
        action: "GROUP_DELETED",
        entityType: "group",
        entityId: args.id,
        details: `Groupe supprimé: ${group.name}`,
        createdAt: Date.now(),
      });
    }
    await ctx.db.delete(args.id);
  },
});

export const createExpense = mutation({
  args: {
    categoryId: v.id("expenseCategories"),
    description: v.string(),
    amount: v.number(),
    expenseDate: v.number(),
    receiptUrl: v.optional(v.string()),
    recordedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validation métier
    if (args.amount <= 0) throw new Error("Le montant de la dépense doit être supérieur à 0");
    if (args.description.trim().length === 0) throw new Error("La description de la dépense est requise");

    const expenseId = await ctx.db.insert("expenses", {
      ...args,
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLog", {
      userId: args.recordedBy,
      action: "EXPENSE_CREATED",
      entityType: "expense",
      entityId: expenseId,
      details: `Dépense enregistrée: ${args.description} - ${args.amount} TND`,
      createdAt: Date.now(),
    });

    return expenseId;
  },
});

export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    categoryId: v.optional(v.id("expenseCategories")),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    expenseDate: v.optional(v.number()),
    receiptUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const expense = await ctx.db.get(args.id);
    if (expense) {
      await ctx.db.insert("auditLog", {
        userId: expense.recordedBy,
        action: "EXPENSE_DELETED",
        entityType: "expense",
        entityId: args.id,
        details: `Dépense supprimée: ${expense.description} - ${expense.amount} TND`,
        createdAt: Date.now(),
      });
    }
    await ctx.db.delete(args.id);
  },
});
