import { MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError } from "convex/values";

/**
 * Valide qu'un utilisateur est authentifié via Clerk.
 * Retourne l'objet d'identité ou jette une erreur "Non authentifié".
 */
export const requireAuth = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError("Vous devez être connecté pour effectuer cette action.");
    }
    return identity;
};

/**
 * Garde d'autorisation SUPER STRICTE.
 * Valide que l'utilisateur est authentifié ET possède un compte Superadmin.
 */
export const requireSuperAdmin = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await requireAuth(ctx);

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

    if (!user || user.role !== "superadmin") {
        throw new ConvexError("Accès refusé. Privilèges Super Administrateur requis.");
    }

    return user;
};

/**
 * Garde d'autorisation STRICTE.
 * Valide que l'utilisateur est authentifié ET possède un compte Admin ou Superadmin.
 */
export const requireAdmin = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await requireAuth(ctx);

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
        throw new ConvexError("Accès refusé. Privilèges administrateur requis.");
    }

    return user;
};

/**
 * Valide que l'utilisateur possède un compte Caissier ou supérieur (Admin/Superadmin).
 */
export const requireCashier = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await requireAuth(ctx);

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin" && user.role !== "cashier")) {
        throw new ConvexError("Accès refusé. Privilèges caissier ou administrateur requis.");
    }

    return user;
};

/**
 * Valide que l'utilisateur est authentifié ET possède un compte Coach ou supérieur (Admin/Superadmin).
 */
export const requireCoach = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await requireAuth(ctx);

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin" && user.role !== "coach")) {
        throw new ConvexError("Accès refusé. Privilèges coach ou administrateur requis.");
    }

    return user;
};
