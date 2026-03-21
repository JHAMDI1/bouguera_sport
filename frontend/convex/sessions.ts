import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getSessions = query({
  args: { 
    groupId: v.optional(v.id("groups")),
    coachId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let sessions = await ctx.db.query("sessions").collect();

    if (args.groupId) {
      sessions = sessions.filter((s) => s.groupId === args.groupId);
    }

    if (args.coachId) {
      sessions = sessions.filter((s) => s.coachId === args.coachId);
    }

    if (args.startDate !== undefined) {
      sessions = sessions.filter((s) => s.startTime >= args.startDate!);
    }

    if (args.endDate !== undefined) {
      sessions = sessions.filter((s) => s.startTime <= args.endDate!);
    }

    // Enrich with group and coach info
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const group = session.groupId ? await ctx.db.get(session.groupId) : null;
        const coach = session.coachId ? await ctx.db.get(session.coachId) : null;
        const discipline = group?.disciplineId ? await ctx.db.get(group.disciplineId) : null;
        
        return {
          ...session,
          groupName: group?.name || null,
          coachName: coach?.fullName || null,
          disciplineName: discipline?.name || null,
          color: discipline?.color || "#4F46E5",
        };
      })
    );

    return enrichedSessions;
  },
});

export const getSessionById = query({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) return null;

    const group = session.groupId ? await ctx.db.get(session.groupId) : null;
    const coach = session.coachId ? await ctx.db.get(session.coachId) : null;
    const discipline = group?.disciplineId ? await ctx.db.get(group.disciplineId) : null;

    return {
      ...session,
      groupName: group?.name || null,
      coachName: coach?.fullName || null,
      disciplineName: discipline?.name || null,
      color: discipline?.color || "#4F46E5",
    };
  },
});

export const createSession = mutation({
  args: {
    groupId: v.id("groups"),
    coachId: v.id("users"),
    title: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    dayOfWeek: v.number(), // 0 = Sunday, 1 = Monday, etc.
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      groupId: args.groupId,
      coachId: args.coachId,
      title: args.title,
      startTime: args.startTime,
      endTime: args.endTime,
      dayOfWeek: args.dayOfWeek,
      location: args.location,
      notes: args.notes,
      isRecurring: args.isRecurring || false,
      createdAt: Date.now(),
    });

    // Log audit
    await ctx.db.insert("auditLog", {
      userId: "system" as Id<"users">,
      action: "CREATE_SESSION",
      entityType: "session",
      entityId: sessionId,
      details: JSON.stringify({ title: args.title, groupId: args.groupId }),
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

export const updateSession = mutation({
  args: {
    id: v.id("sessions"),
    groupId: v.optional(v.id("groups")),
    coachId: v.optional(v.id("users")),
    title: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    dayOfWeek: v.optional(v.number()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, updates);

    // Log audit
    await ctx.db.insert("auditLog", {
      userId: "system" as Id<"users">,
      action: "UPDATE_SESSION",
      entityType: "session",
      entityId: id,
      details: JSON.stringify(updates),
      createdAt: Date.now(),
    });

    return id;
  },
});

export const deleteSession = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);

    // Log audit
    await ctx.db.insert("auditLog", {
      userId: "system" as Id<"users">,
      action: "DELETE_SESSION",
      entityType: "session",
      entityId: args.id,
      details: "",
      createdAt: Date.now(),
    });

    return args.id;
  },
});

// Get sessions for a specific week
export const getWeeklySchedule = query({
  args: {
    weekStart: v.number(), // Timestamp of week start (Monday)
  },
  handler: async (ctx, args) => {
    const weekEnd = args.weekStart + 7 * 24 * 60 * 60 * 1000;
    
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.gte(q.field("startTime"), args.weekStart))
      .filter((q) => q.lte(q.field("startTime"), weekEnd))
      .collect();

    // Enrich with group and coach info
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const group = session.groupId ? await ctx.db.get(session.groupId) : null;
        const coach = session.coachId ? await ctx.db.get(session.coachId) : null;
        const discipline = group?.disciplineId ? await ctx.db.get(group.disciplineId) : null;
        
        return {
          ...session,
          groupName: group?.name || null,
          coachName: coach?.fullName || null,
          disciplineName: discipline?.name || null,
          color: discipline?.color || "#4F46E5",
        };
      })
    );

    return enrichedSessions;
  },
});
