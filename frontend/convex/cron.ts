import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// NOTE: Les cron jobs sont configurés via le dashboard Convex
// ou en utilisant l'API Convex CLI
// Pour l'instant, les fonctions sont disponibles pour être appelées manuellement

// Fonction interne: Vérification des certificats médicaux expirants
export const checkExpiredMedicalCertificates = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

    const members = await ctx.db
      .query("members")
      .filter((q) =>
        q.and(
          q.neq(q.field("medicalCertificateExpiry"), null),
          q.lte(q.field("medicalCertificateExpiry"), thirtyDaysFromNow)
        )
      )
      .collect();

    for (const member of members) {
      const expiryDate = member.medicalCertificateExpiry!;
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (24 * 60 * 60 * 1000));

      let message: string;
      if (daysUntilExpiry < 0) {
        message = `Certificat médical EXPIRÉ depuis ${Math.abs(daysUntilExpiry)} jours pour ${member.firstName} ${member.lastName}`;
      } else if (daysUntilExpiry === 0) {
        message = `Certificat médical expire AUJOURD'HUI pour ${member.firstName} ${member.lastName}`;
      } else {
        message = `Certificat médical expire dans ${daysUntilExpiry} jours pour ${member.firstName} ${member.lastName}`;
      }

      await ctx.db.insert("auditLog", {
        userId: "system" as Id<"users">,
        action: "MEDICAL_CERTIFICATE_EXPIRING",
        entityType: "member",
        entityId: member._id,
        details: message,
        createdAt: now,
      });
    }

    return { checked: members.length };
  },
});

// Fonction interne: Rappels de paiements en retard
export const checkLatePayments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const members = await ctx.db
      .query("members")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    let latePaymentsCount = 0;

    for (const member of members) {
      const payments = await ctx.db
        .query("payments")
        .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("monthCovered"), currentMonth),
            q.eq(q.field("yearCovered"), currentYear)
          )
        )
        .collect();

      if (payments.length === 0) {
        latePaymentsCount++;
        await ctx.db.insert("auditLog", {
          userId: "system" as Id<"users">,
          action: "LATE_PAYMENT",
          entityType: "member",
          entityId: member._id,
          details: `Paiement en retard pour ${member.firstName} ${member.lastName} - Mois: ${currentMonth}/${currentYear}`,
          createdAt: Date.now(),
        });
      }
    }

    return { latePayments: latePaymentsCount };
  },
});

// Query interne pour récupérer les notifications récentes
export const getRecentMedicalCertificateAlerts = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const alerts = await ctx.db
      .query("auditLog")
      .withIndex("by_entityType_entityId", (q) => q.eq("entityType", "member"))
      .filter((q) => q.eq(q.field("action"), "MEDICAL_CERTIFICATE_EXPIRING"))
      .order("desc")
      .take(limit);
    return alerts;
  },
});

export const getLatePaymentAlerts = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const alerts = await ctx.db
      .query("auditLog")
      .withIndex("by_entityType_entityId", (q) => q.eq("entityType", "member"))
      .filter((q) => q.eq(q.field("action"), "LATE_PAYMENT"))
      .order("desc")
      .take(limit);
    return alerts;
  },
});
