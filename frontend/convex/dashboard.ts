import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Total membres actifs
    const activeMembers = await ctx.db.query("members")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    
    // Revenus du mois en cours
    const monthPayments = await ctx.db.query("payments").collect();
    const currentMonthPayments = monthPayments.filter(
      (p) => p.monthCovered === currentMonth && p.yearCovered === currentYear
    );
    const totalRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Dépenses du mois en cours
    const allExpenses = await ctx.db.query("expenses").collect();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).getTime();
    const endOfMonth = new Date(currentYear, currentMonth, 0).getTime();
    const currentMonthExpenses = allExpenses.filter(
      (e) => e.expenseDate >= startOfMonth && e.expenseDate <= endOfMonth
    );
    const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Nombre d'impayés (membres actifs sans paiement ce mois)
    const paidMemberIds = new Set(currentMonthPayments.map((p) => p.memberId).filter(Boolean));
    const unpaidCount = activeMembers.filter((m) => !paidMemberIds.has(m._id)).length;
    
    return {
      totalActiveMembers: activeMembers.length,
      monthlyRevenue: totalRevenue,
      monthlyExpenses: totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      unpaidCount,
    };
  },
});

export const getFinancialReport = query({
  args: { month: v.number(), year: v.number() },
  handler: async (ctx, args) => {
    const payments = await ctx.db.query("payments").collect();
    const monthPayments = payments.filter(
      (p) => p.monthCovered === args.month && p.yearCovered === args.year
    );
    
    const allExpenses = await ctx.db.query("expenses").collect();
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime();
    const endOfMonth = new Date(args.year, args.month, 0).getTime();
    const monthExpenses = allExpenses.filter(
      (e) => e.expenseDate >= startOfMonth && e.expenseDate <= endOfMonth
    );
    
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
