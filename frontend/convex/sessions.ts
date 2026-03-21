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
    let sessions;

    // Utiliser l'index le plus sélectif disponible
    if (args.groupId !== undefined) {
      sessions = await ctx.db
        .query("sessions")
        .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId!))
        .collect();
      if (args.coachId !== undefined) {
        sessions = sessions.filter((s) => s.coachId === args.coachId);
      }
    } else if (args.coachId !== undefined) {
      sessions = await ctx.db
        .query("sessions")
        .withIndex("by_coachId", (q) => q.eq("coachId", args.coachId!))
        .collect();
    } else {
      // Filtre par plage de dates via index startTime
      sessions = await ctx.db
        .query("sessions")
        .withIndex("by_startTime")
        .order("desc")
        .collect();
    }

    // Filtrer par dates si spécifié
    if (args.startDate !== undefined) {
      sessions = sessions.filter((s) => s.startTime >= args.startDate!);
    }
    if (args.endDate !== undefined) {
      sessions = sessions.filter((s) => s.startTime <= args.endDate!);
    }

    // Enrichir avec infos groupe, coach, discipline
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const group = session.groupId ? await ctx.db.get(session.groupId) : null;
        const coach = session.coachId ? await ctx.db.get(session.coachId) : null;
        const discipline = group?.disciplineId ? await ctx.db.get(group.disciplineId) : null;
        return {
          ...session,
          groupName: group?.name ?? null,
          coachName: coach?.fullName ?? null,
          disciplineName: discipline?.name ?? null,
          color: discipline?.color ?? "#4F46E5",
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

    // Audit log (sans userId car création via interface — ajouter createdBy si besoin)
    await ctx.db.insert("auditLog", {
      action: "SESSION_CREATED",
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

    // Audit log
    await ctx.db.insert("auditLog", {
      action: "SESSION_UPDATED",
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

    // Audit log
    await ctx.db.insert("auditLog", {
      action: "SESSION_DELETED",
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

    // Utiliser l'index by_startTime avec une plage de dates
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_startTime", (q) =>
        q.gte("startTime", args.weekStart).lte("startTime", weekEnd)
      )
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
