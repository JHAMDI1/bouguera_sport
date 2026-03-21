import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDisciplines = query({
  args: { isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.isActive !== undefined) {
      return await ctx.db.query("disciplines").filter((q) => q.eq(q.field("isActive"), args.isActive)).collect();
    }
    return await ctx.db.query("disciplines").collect();
  },
});

export const getDisciplineById = query({
  args: { id: v.id("disciplines") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getGroups = query({
  args: { 
    disciplineId: v.optional(v.id("disciplines")),
    coachId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    const disciplineId = args.disciplineId;
    const coachId = args.coachId;
    if (disciplineId) {
      return await ctx.db.query("groups").withIndex("by_disciplineId", (q) => q.eq("disciplineId", disciplineId)).collect();
    }
    if (coachId) {
      return await ctx.db.query("groups").withIndex("by_coachId", (q) => q.eq("coachId", coachId)).collect();
    }
    return await ctx.db.query("groups").collect();
  },
});

export const getGroupById = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
