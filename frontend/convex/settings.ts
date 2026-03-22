import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireAdmin } from "./auth";

export const getSettings = query({
    handler: async (ctx) => {
        const settings = await ctx.db.query("settings").first();
        // Valeurs par défaut si le document n'existe pas encore
        if (!settings) {
            return {
                clubName: "Ma Salle de Sport",
                currency: "TND",
                contactEmail: "contact@example.com",
                taxRate: 0,
                updatedAt: Date.now(),
            };
        }
        return settings;
    },
});

export const updateSettings = mutation({
    args: {
        clubName: v.string(),
        currency: v.string(),
        contactEmail: v.string(),
        contactPhone: v.optional(v.string()),
        taxRate: v.number(),
        logoUrl: v.optional(v.string()),
        address: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx);

        const existing = await ctx.db.query("settings").first();
        const data = { ...args, updatedAt: Date.now() };

        if (existing) {
            await ctx.db.patch(existing._id, data);
        } else {
            await ctx.db.insert("settings", data);
        }

        // Audit log
        await ctx.db.insert("auditLog", {
            action: "UPDATE",
            entityType: "settings",
            entityId: "global",
            details: "Configuration globale mise à jour",
            userId: admin._id,
            createdAt: Date.now(),
        });

        return true;
    },
});
