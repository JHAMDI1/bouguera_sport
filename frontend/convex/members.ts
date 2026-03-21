import { v } from "convex/values";
import { query } from "./_generated/server";

export const getMembers = query({
  args: { 
    familyId: v.optional(v.id("families")),
    isActive: v.optional(v.boolean()),
    searchLastName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let members = await ctx.db.query("members").collect();
    
    if (args.familyId) {
      members = members.filter((m) => m.familyId === args.familyId);
    }
    if (args.isActive !== undefined) {
      members = members.filter((m) => m.isActive === args.isActive);
    }
    if (args.searchLastName) {
      members = members.filter((m) => 
        m.lastName.toLowerCase().includes(args.searchLastName!.toLowerCase())
      );
    }
    
    return members;
  },
});

export const getMemberById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getMemberWithSubscriptions = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) return null;
    
    const subscriptions = await ctx.db.query("memberSubscriptions")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.id))
      .collect();
    
    return { member, subscriptions };
  },
});
