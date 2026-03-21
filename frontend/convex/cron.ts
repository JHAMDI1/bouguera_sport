import { v } from "convex/values";
import { internalQuery, internalMutation, cron } from "./_generated/server";

// Cron job: Vérification quotidienne des certificats médicaux expirants
// S'exécute tous les jours à 8h du matin
export const checkExpiredMedicalCertificates = cron({
  name: "Check expired medical certificates",
  schedule: "0 8 * * *", // Tous les jours à 8h00
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000; // 30 jours

    // Récupérer les membres avec certificats expirants (dans les 30 jours ou déjà expirés)
    const members = await ctx.db
      .query("members")
      .filter((q) =>
        q.and(
          q.neq(q.field("medicalCertificateExpiry"), null),
          q.lte(q.field("medicalCertificateExpiry"), thirtyDaysFromNow)
        )
      )
      .collect();

    // Créer des notifications pour chaque certificat expirant
    for (const member of members) {
      const expiryDate = member.medicalCertificateExpiry!;
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (24 * 60 * 60 * 1000));

      let message: string;
      let priority: string;

      if (daysUntilExpiry < 0) {
        message = `Certificat médical EXPIRÉ depuis ${Math.abs(daysUntilExpiry)} jours pour ${member.firstName} ${member.lastName}`;
        priority = "high";
      } else if (daysUntilExpiry === 0) {
        message = `Certificat médical expire AUJOURD'HUI pour ${member.firstName} ${member.lastName}`;
        priority = "high";
      } else if (daysUntilExpiry <= 7) {
        message = `Certificat médical expire dans ${daysUntilExpiry} jours pour ${member.firstName} ${member.lastName}`;
        priority = "high";
      } else {
        message = `Certificat médical expire dans ${daysUntilExpiry} jours pour ${member.firstName} ${member.lastName}`;
        priority = "medium";
      }

      // Créer une entrée dans l'audit log comme notification
      await ctx.db.insert("auditLog", {
        userId: member._id, // Référence au membre concerné
        action: "MEDICAL_CERTIFICATE_EXPIRING",
        entityType: "member",
        entityId: member._id,
        details: message,
        ipAddress: null,
        createdAt: now,
      });
    }

    console.log(`Checked ${members.length} medical certificates`);
    return { checked: members.length };
  },
});

// Cron job: Rappels de paiements en retard (fin de mois)
// S'exécute le 25 de chaque mois à 9h du matin
export const checkLatePayments = cron({
  name: "Check late payments",
  schedule: "0 9 25 * *", // Le 25 de chaque mois à 9h00
  handler: async (ctx) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Récupérer tous les membres actifs
    const members = await ctx.db
      .query("members")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    let latePaymentsCount = 0;

    for (const member of members) {
      // Vérifier si le membre a un paiement pour le mois en cours
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

      // Si aucun paiement ce mois-ci, c'est un retard
      if (payments.length === 0) {
        latePaymentsCount++;

        // Créer une notification dans l'audit log
        await ctx.db.insert("auditLog", {
          userId: member._id,
          action: "LATE_PAYMENT",
          entityType: "member",
          entityId: member._id,
          details: `Paiement en retard pour ${member.firstName} ${member.lastName} - Mois: ${currentMonth}/${currentYear}`,
          ipAddress: null,
          createdAt: Date.now(),
        });
      }
    }

    console.log(`Found ${latePaymentsCount} late payments`);
    return { latePayments: latePaymentsCount };
  },
});

// Query interne pour récupérer les notifications récentes (certificats)
export const getRecentMedicalCertificateAlerts = internalQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("auditLog"),
      _creationTime: v.number(),
      action: v.string(),
      details: v.string(),
      entityId: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const alerts = await ctx.db
      .query("auditLog")
      .withIndex("by_entityType_entityId", (q) =>
        q.eq("entityType", "member")
      )
      .filter((q) => q.eq(q.field("action"), "MEDICAL_CERTIFICATE_EXPIRING"))
      .order("desc")
      .take(limit);

    return alerts;
  },
});

// Query interne pour récupérer les rappels de paiement
export const getLatePaymentAlerts = internalQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("auditLog"),
      _creationTime: v.number(),
      action: v.string(),
      details: v.string(),
      entityId: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const alerts = await ctx.db
      .query("auditLog")
      .withIndex("by_entityType_entityId", (q) =>
        q.eq("entityType", "member")
      )
      .filter((q) => q.eq(q.field("action"), "LATE_PAYMENT"))
      .order("desc")
      .take(limit);

    return alerts;
  },
});
