import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Récupérer toutes les familles
export const getFamilies = query({
  args: {
    isActive: v.optional(v.boolean()),
    searchFamilyName: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("families"),
      _creationTime: v.number(),
      familyName: v.string(),
      primaryContactName: v.string(),
      primaryContactPhone: v.optional(v.string()),
      discountPercentage: v.optional(v.number()),
      isActive: v.boolean(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let families = await ctx.db.query("families").collect();

    // Filtre par statut actif
    if (args.isActive !== undefined) {
      families = families.filter((f) => f.isActive === args.isActive);
    }

    // Filtre par nom de famille
    if (args.searchFamilyName) {
      const search = args.searchFamilyName.toLowerCase();
      families = families.filter((f) =>
        f.familyName.toLowerCase().includes(search)
      );
    }

    // Trier par nom de famille
    families.sort((a, b) => a.familyName.localeCompare(b.familyName));

    return families;
  },
});

// Query: Récupérer une famille par ID avec ses membres
export const getFamilyById = query({
  args: { id: v.id("families") },
  returns: v.union(
    v.object({
      _id: v.id("families"),
      _creationTime: v.number(),
      familyName: v.string(),
      primaryContactName: v.string(),
      primaryContactPhone: v.optional(v.string()),
      discountPercentage: v.optional(v.number()),
      isActive: v.boolean(),
      createdAt: v.number(),
      members: v.array(
        v.object({
          _id: v.id("members"),
          firstName: v.string(),
          lastName: v.string(),
          isActive: v.boolean(),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const family = await ctx.db.get(args.id);
    if (!family) return null;

    // Récupérer les membres de cette famille
    const members = await ctx.db
      .query("members")
      .withIndex("by_familyId", (q) => q.eq("familyId", args.id))
      .collect();

    return {
      ...family,
      members: members.map((m) => ({
        _id: m._id,
        firstName: m.firstName,
        lastName: m.lastName,
        isActive: m.isActive,
      })),
    };
  },
});

// Mutation: Créer une famille
export const createFamily = mutation({
  args: {
    familyName: v.string(),
    primaryContactName: v.string(),
    primaryContactPhone: v.optional(v.string()),
    discountPercentage: v.optional(v.number()),
  },
  returns: v.id("families"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("families", {
      familyName: args.familyName,
      primaryContactName: args.primaryContactName,
      primaryContactPhone: args.primaryContactPhone,
      discountPercentage: args.discountPercentage,
      isActive: true,
      createdAt: now,
    });
  },
});

// Mutation: Mettre à jour une famille
export const updateFamily = mutation({
  args: {
    id: v.id("families"),
    familyName: v.string(),
    primaryContactName: v.string(),
    primaryContactPhone: v.optional(v.string()),
    discountPercentage: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
