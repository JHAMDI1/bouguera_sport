import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Mutation pour insérer des données de test
export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const createdIds: {
      disciplines: Id<"disciplines">[];
      users: Id<"users">[];
      groups: Id<"groups">[];
      members: Id<"members">[];
      families: Id<"families">[];
      sessions: Id<"sessions">[];
    } = {
      disciplines: [],
      users: [],
      groups: [],
      members: [],
      families: [],
      sessions: [],
    };

    // 1. Créer les disciplines
    const disciplinesData = [
      { name: "Taekwondo", description: "Art martial coréen", monthlyFee: 450, color: "#EF4444", isActive: true },
      { name: "Kung Fu", description: "Art martial chinois", monthlyFee: 450, color: "#F97316", isActive: true },
      { name: "Krav Maga", description: "Défense personnelle israélienne", monthlyFee: 500, color: "#8B5CF6", isActive: true },
      { name: "Boxe", description: "Art de la boxe anglaise", monthlyFee: 400, color: "#3B82F6", isActive: true },
    ];

    for (const d of disciplinesData) {
      const id = await ctx.db.insert("disciplines", {
        ...d,
        createdAt: now,
      });
      createdIds.disciplines.push(id);
    }

    // 2. Créer les coachs (users)
    const coachesData = [
      { clerkId: "coach_001", email: "coach.tkd@test.com", fullName: "Karim Ben Ali", role: "coach" as const, phone: "06 12 34 56 78", isActive: true },
      { clerkId: "coach_002", email: "coach.kungfu@test.com", fullName: "Li Wei Chen", role: "coach" as const, phone: "06 23 45 67 89", isActive: true },
      { clerkId: "coach_003", email: "coach.krav@test.com", fullName: "David Cohen", role: "coach" as const, phone: "06 34 56 78 90", isActive: true },
    ];

    for (const c of coachesData) {
      const id = await ctx.db.insert("users", {
        ...c,
        createdAt: now,
      });
      createdIds.users.push(id);
    }

    // 3. Créer les groupes
    const groupsData = [
      { name: "Taekwondo - Enfants 6-10 ans", disciplineId: createdIds.disciplines[0], coachId: createdIds.users[0], maxCapacity: 15, isActive: true, schedule: "Lundi/Mercredi 16h-17h30" },
      { name: "Taekwondo - Ados 11-15 ans", disciplineId: createdIds.disciplines[0], coachId: createdIds.users[0], maxCapacity: 20, isActive: true, schedule: "Lundi/Mercredi 18h-19h30" },
      { name: "Kung Fu - Adultes Débutants", disciplineId: createdIds.disciplines[1], coachId: createdIds.users[1], maxCapacity: 12, isActive: true, schedule: "Mardi/Jeudi 19h-20h30" },
      { name: "Krav Maga - Défense Personnelle", disciplineId: createdIds.disciplines[2], coachId: createdIds.users[2], maxCapacity: 10, isActive: true, schedule: "Vendredi 20h-21h30" },
    ];

    for (const g of groupsData) {
      const id = await ctx.db.insert("groups", {
        ...g,
        createdAt: now,
      });
      createdIds.groups.push(id);
    }

    // 4. Créer une famille de test
    const familyId = await ctx.db.insert("families", {
      familyName: "Ben Ahmed",
      primaryContactName: "Mohamed Ben Ahmed",
      primaryContactPhone: "06 55 44 33 22",
      discountPercentage: 10,
      isActive: true,
      createdAt: now,
    });
    createdIds.families.push(familyId);

    // 5. Créer des membres
    const membersData = [
      { firstName: "Youssef", lastName: "Ben Ahmed", familyId, dateOfBirth: Date.now() - 10 * 365 * 24 * 60 * 60 * 1000, gender: "male" as const, phone: undefined, emergencyContactName: "Mohamed Ben Ahmed", emergencyContactPhone: "06 55 44 33 22", medicalCertificateExpiry: now + 180 * 24 * 60 * 60 * 1000 },
      { firstName: "Sarah", lastName: "Ben Ahmed", familyId, dateOfBirth: Date.now() - 12 * 365 * 24 * 60 * 60 * 1000, gender: "female" as const, phone: undefined, emergencyContactName: "Mohamed Ben Ahmed", emergencyContactPhone: "06 55 44 33 22", medicalCertificateExpiry: now + 200 * 24 * 60 * 60 * 1000 },
      { firstName: "Ahmed", lastName: "Hassani", familyId: undefined, dateOfBirth: Date.now() - 25 * 365 * 24 * 60 * 60 * 1000, gender: "male" as const, phone: "06 77 88 99 00", emergencyContactName: "Fatima Hassani", emergencyContactPhone: "06 66 77 88 99", medicalCertificateExpiry: now + 150 * 24 * 60 * 60 * 1000 },
      { firstName: "Leila", lastName: "Morabit", familyId: undefined, dateOfBirth: Date.now() - 8 * 365 * 24 * 60 * 60 * 1000, gender: "female" as const, phone: undefined, emergencyContactName: "Karim Morabit", emergencyContactPhone: "06 11 22 33 44", medicalCertificateExpiry: now + 90 * 24 * 60 * 60 * 1000 },
    ];

    for (const m of membersData) {
      const id = await ctx.db.insert("members", {
        ...m,
        address: "Casablanca, Maroc",
        photoUrl: undefined,
        registrationDate: now,
        isActive: true,
        createdAt: now,
      });
      createdIds.members.push(id);
    }

    // 6. Créer des inscriptions (memberSubscriptions)
    const subscriptionsData = [
      { memberId: createdIds.members[0], disciplineId: createdIds.disciplines[0], groupId: createdIds.groups[0], currentBeltLevel: "Ceinture Blanche", isActive: true },
      { memberId: createdIds.members[1], disciplineId: createdIds.disciplines[0], groupId: createdIds.groups[1], currentBeltLevel: "Ceinture Jaune", isActive: true },
      { memberId: createdIds.members[2], disciplineId: createdIds.disciplines[1], groupId: createdIds.groups[2], isActive: true },
      { memberId: createdIds.members[3], disciplineId: createdIds.disciplines[1], groupId: createdIds.groups[2], isActive: true },
    ];

    for (const s of subscriptionsData) {
      await ctx.db.insert("memberSubscriptions", {
        ...s,
        customMonthlyFee: undefined,
        joinedAt: now,
      });
    }

    // 7. Créer des paiements
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const paymentsData = [
      { familyId, memberId: createdIds.members[0], disciplineId: createdIds.disciplines[0], amount: 450, monthCovered: currentMonth, yearCovered: currentYear, receivedBy: createdIds.users[0], paymentMethod: "cash" as const, notes: "Paiement mensuel" },
      { familyId, memberId: createdIds.members[1], disciplineId: createdIds.disciplines[0], amount: 405, monthCovered: currentMonth, yearCovered: currentYear, receivedBy: createdIds.users[0], paymentMethod: "cash" as const, notes: "Paiement avec réduction famille 10%" },
      { familyId: undefined, memberId: createdIds.members[2], disciplineId: createdIds.disciplines[1], amount: 450, monthCovered: currentMonth, yearCovered: currentYear, receivedBy: createdIds.users[1], paymentMethod: "cash" as const, notes: undefined },
    ];

    for (const p of paymentsData) {
      await ctx.db.insert("payments", {
        ...p,
        paymentDate: now,
        receiptNumber: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: now,
      });
    }

    // 8. Créer des sessions (planning des cours)
    // Semaine courante - Lundi à Samedi
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi
    weekStart.setHours(0, 0, 0, 0);

    const sessionsData = [
      // Taekwondo Enfants - Lundi 16h-17h30
      { groupId: createdIds.groups[0], coachId: createdIds.users[0], title: "TKD Enfants", dayOfWeek: 1, startHour: 16, startMinute: 0, endHour: 17, endMinute: 30, location: "Salle Principale", isRecurring: true },
      // Taekwondo Enfants - Mercredi 16h-17h30
      { groupId: createdIds.groups[0], coachId: createdIds.users[0], title: "TKD Enfants", dayOfWeek: 3, startHour: 16, startMinute: 0, endHour: 17, endMinute: 30, location: "Salle Principale", isRecurring: true },
      // Taekwondo Ados - Lundi 18h-19h30
      { groupId: createdIds.groups[1], coachId: createdIds.users[0], title: "TKD Ados", dayOfWeek: 1, startHour: 18, startMinute: 0, endHour: 19, endMinute: 30, location: "Salle Principale", isRecurring: true },
      // Taekwondo Ados - Mercredi 18h-19h30
      { groupId: createdIds.groups[1], coachId: createdIds.users[0], title: "TKD Ados", dayOfWeek: 3, startHour: 18, startMinute: 0, endHour: 19, endMinute: 30, location: "Salle Principale", isRecurring: true },
      // Kung Fu Adultes - Mardi 19h-20h30
      { groupId: createdIds.groups[2], coachId: createdIds.users[1], title: "Kung Fu Adultes", dayOfWeek: 2, startHour: 19, startMinute: 0, endHour: 20, endMinute: 30, location: "Salle Annexe", isRecurring: true },
      // Kung Fu Adultes - Jeudi 19h-20h30
      { groupId: createdIds.groups[2], coachId: createdIds.users[1], title: "Kung Fu Adultes", dayOfWeek: 4, startHour: 19, startMinute: 0, endHour: 20, endMinute: 30, location: "Salle Annexe", isRecurring: true },
      // Krav Maga - Vendredi 20h-21h30
      { groupId: createdIds.groups[3], coachId: createdIds.users[2], title: "Krav Maga", dayOfWeek: 5, startHour: 20, startMinute: 0, endHour: 21, endMinute: 30, location: "Dojo", isRecurring: true },
    ];

    for (const s of sessionsData) {
      // Calculer le timestamp pour cette semaine
      const sessionDate = new Date(weekStart);
      sessionDate.setDate(sessionDate.getDate() + s.dayOfWeek);
      
      const startTime = new Date(sessionDate);
      startTime.setHours(s.startHour, s.startMinute, 0, 0);
      
      const endTime = new Date(sessionDate);
      endTime.setHours(s.endHour, s.endMinute, 0, 0);

      const id = await ctx.db.insert("sessions", {
        groupId: s.groupId,
        coachId: s.coachId,
        title: s.title,
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        dayOfWeek: s.dayOfWeek,
        location: s.location,
        notes: undefined,
        isRecurring: s.isRecurring,
        createdAt: now,
      });
      createdIds.sessions.push(id);
    }

    // 9. Créer des catégories de dépenses
    const expenseCategories = [
      { name: "Loyer", description: "Loyer local" },
      { name: "Équipement", description: "Achat d'équipements sportifs" },
      { name: "Salaires", description: "Salaires coachs et staff" },
      { name: "Fournitures", description: "Fournitures de bureau" },
      { name: "Marketing", description: "Publicité et promotion" },
    ];

    const categoryIds: Id<"expenseCategories">[] = [];
    for (const c of expenseCategories) {
      const id = await ctx.db.insert("expenseCategories", {
        ...c,
        createdAt: now,
      });
      categoryIds.push(id);
    }

    // 10. Créer des dépenses
    const expensesData = [
      { categoryId: categoryIds[0], description: "Loyer Octobre 2024", amount: 8000, expenseDate: now - 15 * 24 * 60 * 60 * 1000, recordedBy: createdIds.users[0] },
      { categoryId: categoryIds[1], description: "Nouveaux tapis", amount: 2500, expenseDate: now - 10 * 24 * 60 * 60 * 1000, recordedBy: createdIds.users[0] },
      { categoryId: categoryIds[2], description: "Salaire Coach Karim", amount: 5000, expenseDate: now - 5 * 24 * 60 * 60 * 1000, recordedBy: createdIds.users[0] },
    ];

    for (const e of expensesData) {
      await ctx.db.insert("expenses", {
        ...e,
        receiptUrl: undefined,
        createdAt: now,
      });
    }

    return {
      success: true,
      message: "Données de test créées avec succès",
      counts: {
        disciplines: createdIds.disciplines.length,
        users: createdIds.users.length,
        groups: createdIds.groups.length,
        members: createdIds.members.length,
        families: createdIds.families.length,
        sessions: createdIds.sessions.length,
      },
    };
  },
});

// Mutation pour nettoyer toutes les données (sauf users pour garder les auth)
export const clearData = mutation({
  args: {},
  handler: async (ctx) => {
    // Supprimer dans l'ordre inverse des dépendances
    const tables = [
      "expenses",
      "expenseCategories",
      "auditLog",
      "attendance",
      "sessions",
      "payments",
      "memberSubscriptions",
      "members",
      "families",
      "groups",
      "disciplines",
    ] as const;

    const deleted: Record<string, number> = {};

    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
      deleted[table] = items.length;
    }

    return {
      success: true,
      message: "Données nettoyées",
      deleted,
    };
  },
});
