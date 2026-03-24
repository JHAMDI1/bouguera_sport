import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const { subject, email, name, pictureUrl } = identity;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", subject))
      .first();

    if (existingUser) {
      const isSuperAdmin = email === "sahbibouguerra186@gmail.com" || email === "soltanwerghi@gmail.com";

      if (isSuperAdmin && existingUser.role !== "superadmin") {
        await ctx.db.patch(existingUser._id, { role: "superadmin" });
      }
      // Si la photo a changé, on peut mettre à jour aussi
      if (pictureUrl && existingUser.photoUrl !== pictureUrl) {
        await ctx.db.patch(existingUser._id, { photoUrl: pictureUrl });
      }
      return existingUser._id;
    }

    const isSuperAdmin = email === "sahbibouguerra186@gmail.com" || email === "soltanwerghi@gmail.com";
    const role = isSuperAdmin ? "superadmin" : "coach";

    return await ctx.db.insert("users", {
      clerkId: subject,
      email: email || "",
      fullName: name || "Utilisateur",
      photoUrl: pictureUrl,
      role: role,
      isActive: true,
      createdAt: Date.now(),
    });
  }
});

import { internalMutation } from "./_generated/server";

export const forceUpgrade = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (user) {
      await ctx.db.patch(user._id, { role: "superadmin" });
      return "Upgraded existing user";
    } else {
      await ctx.db.insert("users", {
        email: args.email,
        role: "superadmin",
        fullName: "Admin",
        isActive: true,
        createdAt: Date.now(),
      });
      return "Created superadmin user";
    }
  }
});
