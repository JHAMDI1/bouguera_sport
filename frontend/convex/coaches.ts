import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createCoach = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { createdBy, ...coachData } = args;
    const coachId = await ctx.db.insert("users", {
      ...coachData,
      role: "coach",
      isActive: true,
      createdAt: Date.now(),
    });

    if (createdBy) {
      await ctx.db.insert("auditLog", {
        userId: createdBy,
        action: "COACH_CREATED",
        entityType: "user",
        entityId: coachId,
        details: `Coach créé: ${args.fullName} (${args.email})`,
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
    isActive: v.optional(v.boolean()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
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

export const createDiscipline = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    monthlyFee: v.number(),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
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
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
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
