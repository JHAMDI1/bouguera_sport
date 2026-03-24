# 🛡️ Analyse & Checklist : Gestion des Rôles (RBAC)

## 📊 Analyse Actuelle
Actuellement, votre application comporte 4 rôles dans la base de données (`superadmin`, `admin`, `cashier`, `coach`), mais :
1. **L'interface (Sidebar)** affiche tous les liens pour tout le monde, peu importe le rôle.
2. **La gestion de l'équipe** (page `/coaches`) ne permet d'ajouter que des coachs, avec un rôle forcé à `"coach"`.
3. **Les permissions backend** (`requireAdmin`) n'autorisent que `superadmin` et `admin`, ce qui bloque potentiellement le `cashier` pour faire son travail (ajouter des paiements).

## ✅ Checklist des actions à faire (Solution 2)

### 1. 🔗 Restauration de la Fusion (Backend)
- [ ] Dans `convex/users.ts`, remettre la logique `by_email` pour que lorsqu'un *Admin* ou *Cashier* se connecte la première fois, son compte soit lié correctement à son rôle prédéfini par le SuperAdmin, au lieu de retomber par défaut sur "coach".

### 2. 🔐 Hooks & Permissions Globales
- [ ] Créer un hook React `useUserRole()` dans le frontend pour récupérer facilement le rôle de l'utilisateur connecté depuis Convex.
- [ ] Détailler les permissions backend dans `convex/auth.ts` :
  - `requireSuperAdmin` (Gérer l'équipe, Supprimer, Paramètres SaaS)
  - `requireAdmin` (CRUD global, Gestion Groupes/Disciplines)
  - `requireCashier` (Accès Paiements, Dépenses, Membres)
  - `requireCoach` (Accès uniquement à ses Propres Groupes/Présences)

### 3. 🧭 Navigation Dynamique (Sidebar)
- [ ] Modifier `src/lib/navigation.ts` pour associer chaque lien à une liste de rôles permis.
  - *Ex: `/settings` -> `["superadmin"]`*
  - *Ex: `/payments` -> `["superadmin", "admin", "cashier"]`*
  - *Ex: `/coaches(staff)` -> `["superadmin", "admin"]`*
- [ ] Modifier `Sidebar.tsx` et `AppLayout.tsx` pour cacher les liens non autorisés selon le rôle détecté via `useUserRole()`.

### 4. 👥 Transformer "Coaches" en "Gestion du Staff"
- [ ] Modifier la mutation `createCoach` (qui deviendra `createStaff`) dans `convex/coaches.ts` pour accepter un attribut `role` (Admin, Cashier, Coach).
- [ ] Modifier l'interface `/coaches` (ou la renommer `/staff`) pour ajouter un **Menu Déroulant** (Dropdown) "Rôle" dans le formulaire de création.
- [ ] Afficher des badges de couleur différents dans le tableau (ex: 🔴 Admin, 🔵 Coach, 🟢 Cashier).

---

🚀 *Si cette analyse vous convient, nous pouvons démarrer le développement de la première étape !*
