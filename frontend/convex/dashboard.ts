import { v } from "convex/values";
import { query } from "./_generated/server";

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getDashboardStats = query({
  handler: async (ctx) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).getTime();
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59).getTime();

    // Total membres actifs (index)
    const activeMembers = await ctx.db
      .query("members")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Paiements du mois (index paymentDate)
    const currentMonthPayments = await ctx.db
      .query("payments")
      .withIndex("by_paymentDate", (q) =>
        q.gte("paymentDate", startOfMonth).lte("paymentDate", endOfMonth)
      )
      .collect();

    // Filtrer par mois/année couverts (en mémoire sur un jeu déjà réduit)
    const relevantPayments = currentMonthPayments.filter(
      (p) => p.monthCovered === currentMonth && p.yearCovered === currentYear
    );
    const totalRevenue = relevantPayments.reduce((sum, p) => sum + p.amount, 0);

    // Dépenses du mois (index expenseDate)
    const currentMonthExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_expenseDate", (q) =>
        q.gte("expenseDate", startOfMonth).lte("expenseDate", endOfMonth)
      )
      .collect();
    const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Impayés (membres actifs sans paiement ce mois)
    const paidMemberIds = new Set(
      relevantPayments.map((p) => p.memberId?.toString()).filter(Boolean)
    );
    const unpaidCount = activeMembers.filter(
      (m) => !paidMemberIds.has(m._id.toString())
    ).length;

    return {
      totalActiveMembers: activeMembers.length,
      monthlyRevenue: totalRevenue,
      monthlyExpenses: totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      unpaidCount,
    };
  },
});

// ─── Rapport Financier Mensuel ────────────────────────────────────────────────

export const getFinancialReport = query({
  args: { month: v.number(), year: v.number() },
  handler: async (ctx, args) => {
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime();
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59).getTime();

    // Paiements via index date
    const allMonthPayments = await ctx.db
      .query("payments")
      .withIndex("by_paymentDate", (q) =>
        q.gte("paymentDate", startOfMonth).lte("paymentDate", endOfMonth)
      )
      .collect();

    const monthPayments = allMonthPayments.filter(
      (p) => p.monthCovered === args.month && p.yearCovered === args.year
    );

    // Dépenses via index date
    const monthExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_expenseDate", (q) =>
        q.gte("expenseDate", startOfMonth).lte("expenseDate", endOfMonth)
      )
      .collect();

    const totalRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      month: args.month,
      year: args.year,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      paymentCount: monthPayments.length,
      expenseCount: monthExpenses.length,
    };
  },
});

// ─── Rapport Adhérents ────────────────────────────────────────────────────────

export const getMembersReport = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const isActive = args.isActive ?? true;

    const members = await ctx.db
      .query("members")
      .withIndex("by_isActive", (q) => q.eq("isActive", isActive))
      .collect();

    // Enrichir avec les abonnements de chaque membre
    const report = await Promise.all(
      members.map(async (member) => {
        const subscriptions = await ctx.db
          .query("memberSubscriptions")
          .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        // Récupérer les disciplines
        const disciplines = await Promise.all(
          subscriptions.map((s) => ctx.db.get(s.disciplineId))
        );

        return {
          _id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          phone: member.phone,
          isActive: member.isActive,
          registrationDate: member.registrationDate,
          medicalCertificateExpiry: member.medicalCertificateExpiry,
          familyId: member.familyId,
          disciplines: disciplines
            .filter(Boolean)
            .map((d) => ({ name: d!.name, monthlyFee: d!.monthlyFee })),
          subscriptionCount: subscriptions.length,
        };
      })
    );

    return {
      total: report.length,
      members: report,
    };
  },
});

// ─── Analytics Avancées (Charts) ──────────────────────────────────────────────

export const getAdvancedAnalytics = query({
  handler: async (ctx) => {
    // 1. Revenus des 6 derniers mois
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const sixMonthsAgoDate = new Date(currentYear, currentMonth - 6, 1);
    const sixMonthsAgo = sixMonthsAgoDate.getTime();

    const recentPayments = await ctx.db
      .query("payments")
      .withIndex("by_paymentDate", (q) => q.gte("paymentDate", sixMonthsAgo))
      .collect();

    const recentExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_expenseDate", (q) => q.gte("expenseDate", sixMonthsAgo))
      .collect();

    // Initialize the last 6 months array
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthName = d.toLocaleDateString("fr-FR", { month: "short" });
      monthlyData.push({
        name: `${monthName} ${y.toString().slice(2)}`,
        month: m,
        year: y,
        revenue: 0,
        expenses: 0,
      });
    }

    // Populate revenue
    for (const p of recentPayments) {
      const target = monthlyData.find(
        (md) => md.month === p.monthCovered && md.year === p.yearCovered
      );
      if (target) target.revenue += p.amount;
    }
    // Populate expenses
    for (const e of recentExpenses) {
      const date = new Date(e.expenseDate);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const target = monthlyData.find((md) => md.month === m && md.year === y);
      if (target) target.expenses += e.amount;
    }

    // 2. Répartition par Discipline (Abonnements actifs)
    const activeMembers = await ctx.db
      .query("members")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    const subscriptions = await ctx.db
      .query("memberSubscriptions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const disciplines = await ctx.db.query("disciplines").collect();

    const disciplineDistribution = disciplines.map((d) => {
      const count = subscriptions.filter((s) => s.disciplineId === d._id).length;
      return {
        name: d.name,
        count,
        color: d.color || "#6366F1" // fallback modern indigo
      };
    }).filter(d => d.count > 0);

    // 3. Répartition par Genre
    let male = 0;
    let female = 0;
    let other = 0;
    for (const m of activeMembers) {
      if (m.gender === "male") male++;
      else if (m.gender === "female") female++;
      else other++;
    }
    const genderDistribution = [
      { name: "Hommes", value: male, color: "#3B82F6" },
      { name: "Femmes", value: female, color: "#EC4899" }
    ];
    if (other > 0) genderDistribution.push({ name: "Autres", value: other, color: "#8B5CF6" });

    return {
      revenueHistory: monthlyData,
      disciplineDistribution,
      genderDistribution
    };
  },
});
