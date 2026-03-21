import { v } from "convex/values";
import { query } from "./_generated/server";

export const getPayments = query({
  args: { 
    memberId: v.optional(v.id("members")),
    familyId: v.optional(v.id("families")),
    monthCovered: v.optional(v.number()),
    yearCovered: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let payments = await ctx.db.query("payments").collect();
    
    if (args.memberId) {
      payments = payments.filter((p) => p.memberId === args.memberId);
    }
    if (args.familyId) {
      payments = payments.filter((p) => p.familyId === args.familyId);
    }
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

export const getExpenses = query({
  args: { 
    categoryId: v.optional(v.id("expenseCategories")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let expenses = await ctx.db.query("expenses").collect();
    
    if (args.categoryId) {
      expenses = expenses.filter((e) => e.categoryId === args.categoryId);
    }
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
