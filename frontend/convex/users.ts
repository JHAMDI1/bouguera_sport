import { v } from "convex/values";
import { query } from "./_generated/server";

export const getUsers = query({
  args: { role: v.optional(v.union(v.literal("superadmin"), v.literal("coach"))) },
  handler: async (ctx, args) => {
    const role = args.role;
    if (role) {
      return await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", role)).collect();
    }
    return await ctx.db.query("users").collect();
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId)).unique();
  },
});
