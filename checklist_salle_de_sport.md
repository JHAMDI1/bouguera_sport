# 🏋️ Application de Gestion de Salle de Sport — Checklist Complète

> **Stack technologique :** React/Next.js (Frontend) + **Convex** (Données Temps Réel) + **Rust / Actix-Web** (Logique complexe & API Sécurisée)
> **Date de création :** 20 Mars 2026
> **Dernière mise à jour :** 21 Mars 2026 (Architect Review)

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

## 🏗️ Architecture Proposée (Hybride Convex + Rust)

```
┌──────────────────────────────────────────────────┐
│                   Frontend Web                    │
│               (React / Next.js)                   │
│  ┌─────────┐ ┌─────────────┐ ┌────────────────┐  │
│  │   UI    │ │  Hooks (db) │ │    Requêtes    │  │
│  │(Tailwind) │ │(useQuery)   │ │  (Fetch API)   │  │
│  └─────────┘ └─────────────┘ └────────────────┘  │
└───────┬───────────────────────────────┬──────────┘
        │ WebSocket (Temps réel)        │ HTTP/REST (Logique complexe & Auth)
┌───────▼──────────────────────────┐ ┌──▼───────────────────────────────┐
│          Convex Backend          │ │         Backend Rust (Actix)      │
│  ┌─────────┐ ┌────────────────┐  │ │ ┌─────────┐ ┌──────────────────┐ │
│  │ Queries │ │ Mutations (UI) │◄─┼─┼─┤  Routes │ │ Business Logic   │ │
│  └─────────┘ └────────────────┘  │ │ └─────────┘ │(Paiements, Docs) │ │
│  ┌────────────────────────────┐  │ │ ┌─────────┐ ┌──────────────────┐ │
│  │     Convex Database        │  │ │ │  Auth   │ │   Convex SDK     │ │
│  └────────────────────────────┘  │ │ └─────────┘ │   pour Webhooks  │ │
└──────────────────────────────────┘ └──────────────────────────────────┘
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

**Partie Backend Rust :**
- [x] Initialiser le projet Rust (`cargo init`)
- [x] Configurer les dépendances dans `Cargo.toml` (`actix-web`, `reqwest` pour Convex API, `jsonwebtoken`, `serde_json`, `dotenv`)
- [x] Configurer les tokens/clés pour que Rust puisse interagir de manière sécure avec Convex
- [x] Mettre en place la structure du back-end Rust (Handlers, Services, Middlewares)

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
- [x] Middleware d'authentification Rust : valider le token JWT et gérer les rôles
- [ ] ⚠️ **`verify_clerk_token()` est un MOCK** — retourne des données fictives, aucune vérification réelle contre Clerk
- [x] Implémenter les rôles et permissions dans Convex :
  - [x] **SuperAdmin** : accès total
  - [x] **Coach** : accès à ses groupes, ses adhérents, marquage présences
- [ ] ⚠️ **Désynchronisation des rôles** : Convex a 2 rôles (`superadmin`/`coach`), Rust en a 4 (`SuperAdmin`/`Admin`/`Coach`/`Cashier`) → à aligner
- [x] Synchroniser l'état de l'utilisateur avec la BDD Convex

---

### Phase 4 : ⚡ Fonctions Hybrides (Convex Queries & Backend Rust)

Les lectures (Queries) se font directement en temps réel depuis le Frontend vers Convex.
Les écritures (Mutations) critiques ou complexes passent par l'API Rust qui, ensuite, met à jour Convex.

#### 4.1 Logique Rust (Actix-Web API)
- [x] **Setup Rust** (Initialisation du projet backend)
- [x] **Middlewares**
  - [x] `middleware/auth.rs` : Validation JWT stricte (header `Authorization: Bearer <token>`)
  - [x] `middleware/rbac.rs` : Contrôle d'accès basé sur les rôles (Admin, Coach, Cashier, SuperAdmin)
- [~] **Handlers** (Logique métier & Intégration avec Convex) — ⚠️ **MOCK : les handlers ne communiquent PAS avec Convex**
  - [x] `POST /api/auth` : Vérification Clerk + génération JWT interne *(⚠️ Clerk mock)*
  - [~] `POST /api/payments` : Validation OK mais **ne persiste pas** dans Convex
  - [~] `POST /api/expenses` : Validation OK mais **ne persiste pas** dans Convex
  - [~] `GET /api/receipts/{number}/pdf` : Retourne un **faux PDF** (string formatée)
  - [~] `GET /api/dashboard/stats` : Retourne des **données statiques fictives**
  - [~] `POST /api/payments/:id/cancel` : **Ne fait rien** en base
- [~] **Services**
  - [x] JWT generation/verification ✅ fonctionnel
  - [~] Clerk token verification ⚠️ **MOCK** — retourne toujours `user_123`
  - [~] PDF receipt generation ⚠️ **MOCK** — pas un vrai PDF
  - [x] Convex API integration (HTTP client `ConvexClient` structuré mais **jamais appelé** dans les handlers)
- [ ] **Tests Unitaires** : Tests des handlers avec `actix-web::test`
- [ ] ⚠️ **Routes legacy non protégées** : `/api/payments`, `/api/expenses`, etc. dupliquées sans auth

#### 4.2 Fonctions Convex (Queries basiques et Sync)
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
  - [x] Génération de PDF : composant `ReceiptPDF.tsx` côté client, et en vrai format A6 côté Rust backend (`genpdf`/`printpdf`)
  - [ ] Export CSV des rapports — **non vérifié/non implémenté**

---

### Phase 8 : 🚀 Déploiement & Production

- [ ] Déployer Convex en production (`npx convex deploy`)
- [ ] Déployer le frontend sur Vercel (recommandé pour Next.js/React)
- [ ] Déployer le backend Rust (Docker / Shuttle / Fly.io)
- [ ] Configurer les variables d'environnement de production (Clerk keys, JWT secret, Convex URL)
- [ ] Tester les webhooks Clerk -> Convex en production
- [ ] Implémenter la vraie vérification Clerk (JWKS) dans le backend Rust
- [ ] Connecter les handlers Rust aux données Convex via `ConvexClient`

---

### Phase 9 : 🔧 Corrections Architect Review (21 Mars 2026)

**🔴 Critiques (P0) :**
- [x] Connecter les handlers Rust à Convex (`get_convex_client()`) — fait pour auth, paiements, dépenses, dashboard
- [x] Implémenter `verify_clerk_token()` réellement (Clerk JWKS ou API `/verify`) — implémenté via JWKS avec base64
- [x] Supprimer les routes legacy non protégées dans `routes.rs` (`/api/payments`, `/api/expenses`, etc.)
- [x] Implémenter la vraie génération PDF (bibliothèque `printpdf` ou `genpdf`)

**🟠 Haute Priorité (P1) :**
- [x] Refactorer les queries Convex pour utiliser `.withIndex()` au lieu de `.collect().filter()` (tables: `payments`, `members`, `expenses`, `sessions`, `families`)
- [x] Ajouter les audit logs dans toutes les mutations critiques (`createMember`, `createPayment`, `createCoach`, `createFamily`, etc.)
- [x] Aligner les rôles entre Convex (`superadmin`/`coach`/`admin`/`cashier`) et Rust (`SuperAdmin`/`Admin`/`Coach`/`Cashier`)
- [x] Configurer `convex/crons.ts` pour scheduler les jobs `checkExpiredMedicalCertificates` et `checkLatePayments`
- [x] Corriger le cast `"system" as Id<"users">` dans les cron jobs (champ rendu optionnel)

**🟡 Moyenne Priorité (P2) :**
- [x] Écrire les tests unitaires Rust (`actix-web::test`)
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
3. **Architecture** : Frontend React + Convex (Temps Réel) + Backend Rust (Logique complexe & API PDF/Paiements).
4. **Multi-disciplines** : Un adhérent PEUT s'inscrire à plusieurs disciplines facilement via la table `memberSubscriptions`.
5. **Tarification Personnalisée** : Le tarif de base est défini par la Discipline, mais le SuperAdmin peut l'écraser (override) individuellement pour chaque membre (`customMonthlyFee`).
6. **Passage de Ceintures** : Un suivi de la ceinture/niveau est intégré directement dans l'abonnement du membre (`currentBeltLevel`).
7. 👨‍👩‍👧‍👦 **Comptes Familiaux (Family Memberships)** : Possibilité de regrouper plusieurs membres sous une même "Famille". Cela permet d'appliquer un pourcentage de réduction automatique et surtout, de traiter un paiement groupé en éditant **un seul reçu global** pour tous les frères/sœurs.

---

## 📊 État Global du Projet (Architect Review — 21 Mars 2026)

| Phase | Progression | Notes |
|-------|:-----------:|-------|
| Phase 1 — Setup & Infrastructure | ✅ **90%** | Frontend + Convex OK. Rust initialisé. |
| Phase 2 — Schema Convex | ✅ **100%** | 11 tables + indexes |
| Phase 3 — Authentification | ⚠️ **70%** | Clerk frontend OK. Rust: mock Clerk, rôles désynchronisés |
| Phase 4 — Fonctions CRUD | ⚠️ **65%** | Convex OK. Rust: handlers mock, pas de persistance |
| Phase 5 — Dashboard & Rapports | ✅ **85%** | `getDashboardStats` + `getFinancialReport` OK. `getMembersReport` manquant |
| Phase 6 — Frontend Web | ✅ **80%** | Toutes pages CRUD créées |
| Phase 7 — Fonctionnalités Avancées | ⚠️ **60%** | Cron non schedulés, PDF mock, CSV absent |
| Phase 8 — Déploiement | ❌ **0%** | Non commencé |
| Phase 9 — Corrections Review | ❌ **0%** | 16 issues identifiées |

> **Score estimé : ~75% de complétion globale. Le principal travail restant : connecter Rust ↔ Convex, corriger les mocks, et déployer.**
