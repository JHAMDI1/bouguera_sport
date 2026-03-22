"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  Wallet
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function DashboardPage() {
  const { user } = useUser();
  const stats = useQuery(api.dashboard.getDashboardStats);
  const analytics = useQuery(api.dashboard.getAdvancedAnalytics);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader title="Tableau de Bord">
        <div className="flex flex-col items-end">
          <p className="text-sm font-medium text-foreground">
            Bienvenue, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </p>
          <p className="text-xs text-foreground-tertiary hidden sm:block">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </PageHeader>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats === undefined ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-foreground-secondary">Chargement...</div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Members */}
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-primary-subtle text-primary-text">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground-secondary">Adhérents Actifs</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalActiveMembers || 0}</p>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-success-subtle text-success">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground-secondary">Revenus du Mois</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(stats?.monthlyRevenue || 0).toLocaleString('fr-FR')} TND
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${(stats?.netProfit || 0) >= 0 ? 'bg-success-subtle text-success' : 'bg-error-subtle text-error'}`}>
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground-secondary">Bénéfice Net</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(stats?.netProfit || 0).toLocaleString('fr-FR')} TND
                    </p>
                  </div>
                </div>
              </div>

              {/* Unpaid Count */}
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-warning-subtle text-warning">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground-secondary">Impayés</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.unpaidCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Actions Rapides</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/members"
                  className="flex items-center p-4 border border-border rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer shadow-sm"
                >
                  <Users className="h-5 w-5 text-primary-text mr-3" />
                  <span className="font-medium text-foreground">Gestion Adhérents</span>
                </a>
                <a
                  href="/payments"
                  className="flex items-center p-4 border border-border rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer shadow-sm"
                >
                  <Wallet className="h-5 w-5 text-primary-text mr-3" />
                  <span className="font-medium text-foreground">Nouveau Paiement</span>
                </a>
                <a
                  href="/disciplines"
                  className="flex items-center p-4 border border-border rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer shadow-sm"
                >
                  <Activity className="h-5 w-5 text-primary-text mr-3" />
                  <span className="font-medium text-foreground">Disciplines</span>
                </a>
                <a
                  href="/expenses"
                  className="flex items-center p-4 border border-border rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer shadow-sm"
                >
                  <DollarSign className="h-5 w-5 text-primary-text mr-3" />
                  <span className="font-medium text-foreground">Dépenses</span>
                </a>
              </div>
            </div>

            {/* Recharts Analytics Section */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Revenue Chart */}
                <div className="card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Évolution des Revenus (6 derniers mois)</h2>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.revenueHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--color-foreground-secondary)', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--color-foreground-secondary)', fontSize: 12 }}
                          tickFormatter={(value) => `${value} TND`}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number | string | readonly (number | string)[] | undefined) => [`${value} TND`, 'Revenus']}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-primary-500)"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "var(--color-primary-500)", strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Discipline Distribution */}
                <div className="card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Répartition par Discipline</h2>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    {analytics.disciplineDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.disciplineDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                          >
                            {analytics.disciplineDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number | string | readonly (number | string)[] | undefined) => [`${value} adhérents`, 'Inscrits']}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-foreground-secondary flex flex-col items-center">
                        <Activity className="h-10 w-10 mb-2 opacity-50" />
                        <p>Aucune donnée disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
