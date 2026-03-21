import { v } from "convex/values";
import { query } from "./_generated/server";

// ─── Membres ──────────────────────────────────────────────────────────────────

import { paginationOptsValidator } from "convex/server";

export const getMembersPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    familyId: v.optional(v.id("families")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Si filtrage par famille
    if (args.familyId !== undefined) {
      return await ctx.db
        .query("members")
        .withIndex("by_familyId", (q) => q.eq("familyId", args.familyId!))
        .paginate(args.paginationOpts);
    }

    // Si filtrage par statut actif
    if (args.isActive !== undefined) {
      return await ctx.db
        .query("members")
        .withIndex("by_isActive", (q) => q.eq("isActive", args.isActive!))
        .paginate(args.paginationOpts);
    }

    // Sans filtre spécifique
    return await ctx.db.query("members").paginate(args.paginationOpts);
  },
});


export const getMembers = query({
  args: {
    familyId: v.optional(v.id("families")),
    isActive: v.optional(v.boolean()),
    searchLastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Cas 1 : filtrer par famille (index disponible)
    if (args.familyId !== undefined) {
      let members = await ctx.db
        .query("members")
        .withIndex("by_familyId", (q) => q.eq("familyId", args.familyId))
        .collect();

      if (args.isActive !== undefined) {
        members = members.filter((m) => m.isActive === args.isActive);
      }
      if (args.searchLastName) {
        const search = args.searchLastName.toLowerCase();
        members = members.filter((m) =>
          m.lastName.toLowerCase().includes(search)
        );
      }
      return members;
    }

    // Cas 2 : filtrer par isActive (index disponible)
    if (args.isActive !== undefined) {
      let members = await ctx.db
        .query("members")
        .withIndex("by_isActive", (q) => q.eq("isActive", args.isActive!))
        .collect();

      if (args.searchLastName) {
        const search = args.searchLastName.toLowerCase();
        members = members.filter((m) =>
          m.lastName.toLowerCase().includes(search)
        );
      }
      return members;
    }

    // Cas 3 : recherche par nom (scan total mais nécessaire — pas d'index texte)
    let members = await ctx.db.query("members").collect();
    if (args.searchLastName) {
      const search = args.searchLastName.toLowerCase();
      members = members.filter((m) =>
        m.lastName.toLowerCase().includes(search)
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

    const subscriptions = await ctx.db
      .query("memberSubscriptions")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.id))
      .collect();

    return { member, subscriptions };
  },
});
