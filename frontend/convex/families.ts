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
    createdBy: v.optional(v.id("users")),
  },
  returns: v.id("families"),
  handler: async (ctx, args) => {
    const { createdBy, ...familyData } = args;
    const now = Date.now();
    const familyId = await ctx.db.insert("families", {
      ...familyData,
      isActive: true,
      createdAt: now,
    });

    if (createdBy) {
      await ctx.db.insert("auditLog", {
        userId: createdBy,
        action: "FAMILY_CREATED",
        entityType: "family",
        entityId: familyId,
        details: `Famille créée: ${args.familyName}`,
        createdAt: now,
      });
    }

    return familyId;
  },
});

export const deleteFamily = mutation({
  args: { id: v.id("families"), deletedBy: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const family = await ctx.db.get(args.id);
    if (family && args.deletedBy) {
      await ctx.db.insert("auditLog", {
        userId: args.deletedBy,
        action: "FAMILY_DELETED",
        entityType: "family",
        entityId: args.id,
        details: `Famille supprimée: ${family.familyName}`,
        createdAt: Date.now(),
      });
    }
    await ctx.db.delete(args.id);
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
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, updatedBy, ...updates } = args;
    await ctx.db.patch(id, updates);

    if (updatedBy) {
      await ctx.db.insert("auditLog", {
        userId: updatedBy,
        action: "FAMILY_UPDATED",
        entityType: "family",
        entityId: id,
        details: `Famille mise à jour: ${args.familyName}`,
        createdAt: Date.now(),
      });
    }
  },
});
