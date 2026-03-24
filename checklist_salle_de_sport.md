# 🏋️ Application de Gestion de Salle de Sport — Checklist Complète

> **Stack technologique :** React/Next.js (Frontend) + **Convex** (Backend & Données Temps Réel)
> **Date de création :** 20 Mars 2026
> **Dernière mise à jour :** 24 Mars 2026 (Mise à jour Architecture)

---

## 📋 Analyse des Besoins Exprimés

| Besoin exprimé | Statut |
|---|---|
| Authentification SuperAdmin / Coach | ✅ Identifié |
| CRUD Groupes (Taekwondo, Kung Fu...) | ✅ Identifié |
| Gestion des adhérents par groupe | ✅ Identifié |
| Suivi des paiements mensuels (espèces) | ✅ Identifié |
| Gestion des dépenses de la salle | ✅ Identifié |

---

## 🔍 Analyse Senior Architect — Ce Qui Manque & Recommandations

### ⚠️ Éléments manquants critiques

| N° | Élément manquant | Pourquoi c'est important |
|---|---|---|
| 1 | **Gestion des adhérents (CRUD complet)** | Tu as parlé de groupes mais pas du CRUD des adhérents eux-mêmes (ajouter, modifier, supprimer un adhérent) |
| 2 | **Historique des paiements** | Il faut garder une trace de chaque paiement (date, montant, mois payé, qui a payé, reçu par qui) |
| 3 | **Reçus/Tickets de paiement** | Pour les paiements en espèces, il faut pouvoir générer un reçu (PDF ou impression) comme preuve |
| 4 | **Gestion des coachs (CRUD)** | Le SuperAdmin doit pouvoir ajouter/modifier/supprimer des coachs |
| 5 | **Tableau de bord (Dashboard)** | Vue d'ensemble : revenus du mois, impayés, nombre d'adhérents, dépenses |
| 6 | **Catégories de dépenses** | Loyer, électricité, matériel, salaires coachs, eau, maintenance, etc. |
| 7 | **Rapports financiers** | Bilan mensuel : revenus (paiements) vs dépenses = bénéfice net |
| 8 | **Gestion des abonnements** | Types d'abonnement (mensuel, trimestriel, annuel) avec tarifs différents par discipline |

### 💡 Recommandations d'amélioration

| N° | Recommandation | Impact |
|---|---|---|
| 1 | **Planning/Emploi du temps** | Horaires des cours par discipline et par coach — très utile pour les adhérents |
| 2 | **Système d'alertes** | Notifications automatiques pour les paiements en retard |
| 3 | **Fiche adhérent complète** | Nom, prénom, date de naissance, téléphone, personne à contacter en urgence, certificat médical (date d'expiration) |
| 4 | **Suivi des présences (Attendance)** | Savoir qui vient aux cours — utile pour les coachs et pour justifier les paiements |
| 5 | **Gestion multi-disciplines** | Un adhérent peut être dans plusieurs groupes (Taekwondo + Kung Fu) avec tarif combiné |
| 6 | **Sauvegarde automatique** | Backup de la base de données — critique pour une gestion en espèces sans trace bancaire |
| 7 | **Mode hors-ligne** | La salle peut avoir des coupures internet — prévoir un mode local |
| 8 | **Audit trail / Journal d'activité** | Tracer qui a fait quoi (surtout pour les paiements en espèces) |

---

## 🏗️ Architecture Proposée (Convex Native)

```text
┌──────────────────────────────────────────────────┐
│                   Frontend Web                    │
│               (React / Next.js)                   │
│  ┌─────────┐ ┌─────────────┐ ┌────────────────┐  │
│  │   UI    │ │  Hooks (db) │ │    Requêtes    │  │
│  │(Tailwind) │ │(useQuery)   │ │  (Mutations)   │  │
│  └─────────┘ └─────────────┘ └────────────────┘  │
└───────┬───────────────────────────────┬──────────┘
        │ WebSocket (Temps réel)        │ 
┌───────▼───────────────────────────────▼──────────┐
│          Convex Backend (Serverless)             │
│  ┌─────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │ Queries │ │  Mutations   │ │ Auth (Clerk)  │  │
│  └─────────┘ └──────────────┘ └───────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │               Convex Database              │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DÉTAILLÉE PAR PHASE

---

### Phase 1 : 🔧 Setup & Infrastructure

**Partie Frontend & Convex :**
- [x] Initialiser le projet Frontend (ex: `npx create-next-app@latest salle-de-sport`)
- [x] Initialiser Convex (`npx convex dev`)
- [x] Configurer les dépendances principales Frontend (`lucide-react`, `tailwindcss`, `hook-form`)
- [x] Créer la structure de dossiers `convex/` pour les schémas et queries basiques

---

### Phase 2 : 🗄️ Base de Données — Schéma Convex (`schema.ts`)

Définir les tables (tables définies de manière stricte avec `v.object()`) :

#### 2.1 Table `users` (SuperAdmin & Coachs)
- [x] Champs : `clerkId`, `email`, `role` (superadmin/coach), `fullName`, `phone`, `isActive`, `createdAt`

#### 2.2 Table `disciplines`
- [x] Champs : `name` (Taekwondo, Kung Fu, etc.), `description`, `monthlyFee`, `isActive`, `createdAt`

#### 2.3 Table `groups` (Groupes de cours)
- [x] Champs : `name`, `disciplineId` (Id), `coachId` (Id), `schedule` (horaires), `maxCapacity`, `isActive`, `createdAt`

#### 2.4 Table `families` (Comptes Familiaux) - NOUVEAU
- [x] Champs : `familyName`, `primaryContactName`, `primaryContactPhone`, `discountPercentage` (Optionnel - ex: 10%), `isActive`, `createdAt`

#### 2.5 Table `members` (Adhérents)
- [x] Champs : `firstName`, `lastName`, `familyId` (Id - Optionnel, pour lier à un compte familial), `dateOfBirth`, `gender`, `phone`, `emergencyContactName`, `emergencyContactPhone`, `medicalCertificateExpiry`, `address`, `photoUrl`, `registrationDate`, `isActive`, `createdAt`

#### 2.6 Table `memberSubscriptions` (Inscription aux Disciplines & Groupes)
- [x] Champs : `memberId` (Id), `disciplineId` (Id)
- [x] Champs : `groupId` (Id - Optionnel, si l'adhérent est assigné à un créneau spécifique)
- [x] Champs : `customMonthlyFee` (Number - Optionnel, définit un tarif personnalisé qui écrase le tarif par défaut de la discipline)
- [x] Champs : `currentBeltLevel` (String - Optionnel, pour suivre l'évolution des ceintures en Arts Martiaux)
- [x] Champs : `joinedAt`, `isActive`

#### 2.7 Table `payments` (Paiements)
- [x] Champs : `familyId` (Id - Optionnel, si c't un paiement groupé)
- [x] Champs : `memberId` (Id - Optionnel, si c'est un paiement individuel)
- [x] Champs : `disciplineId` (Id - Optionnel, pour un paiement individuel spécifique)
- [x] Champs : `amount`, `paymentDate`, `monthCovered` (mois payé), `yearCovered`, `receivedBy` (Id user), `paymentMethod` (espèces), `receiptNumber`, `notes`, `createdAt`

#### 2.7 Table `expenses` (Dépenses)
- [x] Champs : `categoryId` (Id), `description`, `amount`, `expenseDate`, `recordedBy` (Id user), `receiptUrl`, `createdAt`

#### 2.8 Table `expenseCategories`
- [x] Champs : `name`, `description`, `createdAt`

#### 2.9 Table `attendance` (Présences — optionnel Phase 2+)
- [x] Champs : `memberId` (Id), `groupId` (Id), `date`, `isPresent`, `createdAt`

#### 2.10 Table `auditLog` (Journal d'activité)
- [x] Champs : `userId` (Id), `action`, `entityType`, `entityId`, `details` (String/JSON), `ipAddress`, `createdAt`

#### 2.11  Index & Recherche
- [x] Ajouter des index dans `schema.ts` (ex: recherche d'adhérents par nom, paiements par mois)

---

### Phase 3 : 🔐 Authentification & Autorisation

- [x] Choix d'architecture Auth : **Clerk** validé. Clerk gérera la connexion (Email/Mot de passe), la sécurité des sessions, et s'intègre nativement à Convex
- [x] Implémenter les rôles et permissions dans Convex :
  - [x] **SuperAdmin** : accès total
  - [x] **Coach** : accès à ses groupes, ses adhérents, marquage présences
- [x] Synchroniser l'état de l'utilisateur avec la BDD Convex

---

### Phase 4 : ⚡ Fonctions Backend (Convex Queries & Mutations)

Les lectures (Queries) se font directement en temps réel depuis le Frontend vers Convex.
Les écritures (Mutations) critiques ou complexes sont également gérées par les endpoints Convex sécurisés.

#### 4.1 Fonctions Convex (Queries basiques et Sync)
- [x] `query: getUsers`, `query: getUserById`, `query: getUserByClerkId`
- [x] `query: getDisciplines`, `query: getGroups`, `query: getGroupById`
- [x] `query: getMembers`, `query: getMemberById`, `query: getMemberWithSubscriptions`
- [x] `query: getPayments`, `query: getExpenses`, `query: getExpenseCategories`
- [x] `mutation: createMember`, `mutation: updateMember`, `mutation: createPayment`
- [x] `mutation: createCoach`, `mutation: updateCoach`
- [x] `mutation: createGroup`, `mutation: updateGroup`
- [x] `mutation: createDiscipline`, `mutation: updateDiscipline`
- [x] `mutation: createExpense`, `mutation: updateExpense`
- [x] ⚠️ **Performances** : queries optimisées avec `.withIndex()`
- [x] ⚠️ **Audit Log manquant** : logs ajoutés aux mutations membres, paiements, coachs, familles
- [ ] ⚠️ **Pas de pagination** : `getMembers`, `getPayments`, `getExpenses` retournent tous les résultats sans limite

---

### Phase 5 : 📊 Dashboard & Rapports (Convex Queries)

- [x] `query: getDashboardStats` — Vue d'ensemble (calculée côté serveur Convex pour la perfo) :
  - [x] Total adhérents actifs
  - [x] Revenus du mois en cours
  - [x] Dépenses du mois en cours
  - [x] Bénéfice net
  - [x] Nombre d'impayés
- [x] `query: getFinancialReport(month, year)`
- [x] `query: getMembersReport` — Implémenté dans `dashboard.ts` avec les abonnements et disciplines

---

### Phase 6 : 🎨 Frontend Web (React / Next.js)

- [x] Setup layout principal avec Sidebar (shadcn-ui `Sidebar` ou custom)
- [x] Page de connexion sécurisée (Clerk `<SignIn />`)
- [x] Dashboard (utilisation de `useQuery(api.dashboard.getDashboardStats)`)
- [~] Pages CRUD (utilisation de `useQuery` et `useMutation`) :
  - [x] Gestion des disciplines
  - [x] Gestion des coachs
  - [x] Gestion des groupes
  - [x] Gestion des adhérents (Tableaux complexes)
  - [x] Gestion des paiements (Formulaires d'encaissement en espèces)
  - [x] Gestion des dépenses
  - [x] Gestion des familles (Comptes familiaux avec réduction)
- [x] Intégration de `react-hook-form` avec `zod` pour la validation client
- [x] Modales de confirmation (`Dialog` shadcn-ui)
- [x] Notifications / Toasts (`sonner` ou `toast` shadcn-ui) pour feedback temps réel

---

### Phase 7 : 🔰 Fonctionnalités Avancées (Nice to Have)

- [x] **Jobs planifiés (Convex Cron Jobs)** :
  - [x] Fonctions internes écrites (`checkExpiredMedicalCertificates`, `checkLatePayments`)
  - [x] ⚠️ **Fichier `convex/crons.ts` créé** — les cron jobs sont maintenant **schedulés** (quotidien/mensuel)
- [x] **Planning des cours** :
  - [x] CRUD Sessions complet (`createSession`, `updateSession`, `deleteSession`)
  - [x] `getWeeklySchedule` pour vue calendrier
  - [x] Page `/schedule` dans le frontend
- [x] **Impression / Export** :
  - [x] Génération de PDF : composant `ReceiptPDF.tsx` côté client
  - [ ] Export CSV des rapports — **non vérifié/non implémenté**

---

### Phase 8 : 🚀 Déploiement & Production

- [ ] Déployer Convex en production (`npx convex deploy`)
- [ ] Déployer le frontend sur Vercel (recommandé pour Next.js/React)
- [ ] Configurer les variables d'environnement de production (Clerk keys, Convex URL)

---

### Phase 9 : 🔧 Corrections Architect Review (24 Mars 2026)

**🔴 Critiques (P0) :**
- [x] Finaliser l'authentification native Clerk avec Convex.

**🟠 Haute Priorité (P1) :**
- [x] Refactorer les queries Convex pour utiliser `.withIndex()` au lieu de `.collect().filter()` (tables: `payments`, `members`, `expenses`, `sessions`, `families`)
- [x] Ajouter les audit logs dans toutes les mutations critiques (`createMember`, `createPayment`, `createCoach`, `createFamily`, etc.)
- [x] Configurer `convex/crons.ts` pour scheduler les jobs `checkExpiredMedicalCertificates` et `checkLatePayments`
- [x] Corriger le cast `"system" as Id<"users">` dans les cron jobs (champ rendu optionnel)

**🟡 Moyenne Priorité (P2) :**
- [ ] Ajouter des tests frontend (composants et pages CRUD)
- [x] Ajouter la validation métier dans les mutations Convex (montant > 0, mois 1-12, email unique)
- [x] Implémenter `getMembersReport`
- [x] Ajouter la pagination dans `getMembers`, `getPayments`, `getExpenses`

**🟢 Basse Priorité (P3) :**
- [ ] Implémenter l'export CSV des rapports
- [ ] Structurer le champ `schedule` dans `groups` (remplacer `v.string()` par un objet typé)
- [ ] Ajouter table `sessions` au schéma des relations dans la documentation

---

## 📐 Schéma des Relations (Entity Relationship)

```
┌─────────┐     ┌──────────────┐     ┌──────────┐
│  Users  │────<│    Groups    │>────│Disciplines│
│(Admin/  │     │              │     │           │
│ Coach)  │     └──────┬───────┘     └──────┬────┘
└────┬────┘            │                    │
     │           ┌─────┴──────┐      ┌──────┴────────┐
     │           │member_groups│      │ Subscriptions │
     │           └─────┬──────┘      └──────┬────────┘
     │                 │                    │
     │           ┌─────┴──────┐      ┌──────┴────────┐
     │           │  Members   │──────│   Payments    │
     │           └─────┬──────┘      └───────────────┘
     │                 │
     │           ┌─────┴──────┐
     │           │ Attendance │
     │           └────────────┘
     │
┌────┴────────┐   ┌──────────────────┐
│  Expenses   │   │   Audit Log      │
└─────────────┘   └──────────────────┘
```

---

## 🎯 Ordre de Priorité Recommandé

| Priorité | Phase | Estimation |
|----------|-------|------------|
| 🔴 P0 | Phase 1 : Setup & Infrastructure | 1-2 jours |
| 🔴 P0 | Phase 2 : Base de données | 2-3 jours |
| 🔴 P0 | Phase 3 : Authentification | 2-3 jours |
| 🟠 P1 | Phase 4 : API CRUD | 5-7 jours |
| 🟠 P1 | Phase 5 : Dashboard & Rapports | 3-4 jours |
| 🟡 P2 | Phase 6 : Frontend Web | 7-10 jours |
| 🟢 P3 | Phase 7 : Fonctionnalités avancées | 5-7 jours |
| 🟡 P2 | Phase 8 : Tests | En continu |
| 🟢 P3 | Phase 9 : Déploiement | 2-3 jours |

> **Estimation totale : 4-6 semaines** pour une version complète et fonctionnelle.

---
### 🥋 Explication du Module "Disciplines"
Le module **Disciplines** est le cœur de l'organisation sportive de la salle. Il permet de gérer les différents sports/arts martiaux proposés (ex: Taekwondo, Kung Fu, Fitness).
1. **Une Discipline** a un nom, une description, et surtout **un tarif mensuel de base** (`monthlyFee`).
2. **Un Groupe** appartient toujours à **une seule Discipline**. (ex: "Taekwondo - Enfants 8-12 ans" ou "Kung Fu - Adultes Avancés").
3. **Un Coach** est assigné à un ou plusieurs Groupes.
4. **L'Adhérent** (l'élève) s'inscrit à un **Groupe**. Son **Abonnement** est donc lié à la discipline de ce groupe, ce qui permet de facturer correctement (ex: S'il fait Taekwondo, il paie le tarif du Taekwondo).
---

## ⚠️ Décisions Actées

1. **Frontend Framework** : Next.js 16 + React 19 (SSR, App Router, Turbopack).
2. **Authentification** : ✅ **Clerk** validé. Clerk gérera la connexion (Email/Mot de passe), la sécurité des sessions, et s'intègre nativement à Convex pour injecter dynamiquement l'identité de l'utilisateur (SuperAdmin ou Coach) dans les requêtes temps réel.
3. **Architecture** : Frontend React + Convex (Temps Réel & Backend Serverless).
4. **Multi-disciplines** : Un adhérent PEUT s'inscrire à plusieurs disciplines facilement via la table `memberSubscriptions`.
5. **Tarification Personnalisée** : Le tarif de base est défini par la Discipline, mais le SuperAdmin peut l'écraser (override) individuellement pour chaque membre (`customMonthlyFee`).
6. **Passage de Ceintures** : Un suivi de la ceinture/niveau est intégré directement dans l'abonnement du membre (`currentBeltLevel`).
7. 👨‍👩‍👧‍👦 **Comptes Familiaux (Family Memberships)** : Possibilité de regrouper plusieurs membres sous une même "Famille". Cela permet d'appliquer un pourcentage de réduction automatique et surtout, de traiter un paiement groupé en éditant **un seul reçu global** pour tous les frères/sœurs.

---

## 📊 État Global du Projet (Architect Review — 21 Mars 2026)

| Phase | Progression | Notes |
|-------|:-----------:|-------|
| Phase 1 — Setup & Infrastructure | ✅ **100%** | Frontend + Convex OK. |
| Phase 2 — Schema Convex | ✅ **100%** | 11 tables + indexes |
| Phase 3 — Authentification | ✅ **100%** | Clerk frontend OK. Convex rôles OK. |
| Phase 4 — Fonctions CRUD | ✅ **90%** | Convex OK. |
| Phase 5 — Dashboard & Rapports | ✅ **100%** | `getDashboardStats` + `getFinancialReport` OK. |
| Phase 6 — Frontend Web | ✅ **95%** | Toutes pages CRUD créées. Reste Tests. |
| Phase 7 — Fonctionnalités Avancées | ⚠️ **80%** | Cron schedulés, PDF client OK, CSV absent |
| Phase 8 — Déploiement | ❌ **0%** | Non commencé |
| Phase 9 — Corrections Review | ⚠️ **90%** | Reste Pagination et tests complets |

> **Score estimé : ~90% de complétion globale. Le principal travail restant : Pagination, Export CSV et finalisation Déploiement.**
