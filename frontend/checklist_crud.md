# Audit Complet : Boutons et Fonctionnalités CRUD Manquantes

Voici l'analyse ligne par ligne de toutes les pages de l'application pour identifier les actions manquantes (CRUD : Create, Read, Update, Delete). Ce fichier servira de checklist séquentielle pour corriger l'application.

## 🔴 1. Dépenses (`expenses/page.tsx`)
_État actuel : On peut créer et lire les dépenses, mais on ne peut ni les modifier ni les supprimer._
- [ ] **Actions Column** : Ajouter une colonne "Actions" dans le tableau `DataTable`.
- [ ] **Modifier (Update)** : Ajouter un bouton et une modale pour modifier une dépense existante.
- [ ] **Supprimer (Delete)** : Ajouter un bouton de suppression (avec confirmation) pour effacer une erreur de saisie.

## 🔴 2. Paiements (`payments/page.tsx`)
_État actuel : On peut créer, lire et imprimer un reçu. Pas de modification ou suppression possible._
- [ ] **Modifier (Update)** : Ajouter un bouton d'édition (par exemple, si le montant ou le mois couvert a été mal saisi).
- [ ] **Annuler/Supprimer (Delete)** : Ajouter un bouton pour annuler ou supprimer un paiement erroné (très important en gestion de club).

## 🔴 3. Disciplines (`disciplines/page.tsx`)
_État actuel : Page en lecture seule. Impossible de gérer les disciplines depuis l'interface._
- [ ] **Créer (Create)** : Ajouter un bouton "Nouvelle Discipline" et un formulaire.
- [ ] **Modifier (Update)** : Permettre l'édition d'une discipline existante (nom, tarif, description).
- [ ] **Supprimer (Delete) / Désactiver** : Ajouter une fonction pour supprimer ou archiver une discipline.

## 🟠 4. Adhérents (`members/page.tsx`)
_État actuel : On peut créer, lire, modifier et basculer le statut. Suppression impossible._
- [ ] **Supprimer (Delete)** : Ajouter un bouton de suppression (avec `ConfirmModal`) pour respecter le droit à l'oubli (RGPD) ou supprimer les fiches créées par erreur.

## 🟠 5. Groupes (`groups/page.tsx`)
_État actuel : Create, Read, Update et Status Toggle présents. Suppression impossible._
- [ ] **Supprimer (Delete)** : Ajouter un bouton de suppression de groupe.

## 🟠 6. Familles (`families/page.tsx`)
_État actuel : Create, Read, Update et Export CSV présents. Suppression impossible._
- [ ] **Supprimer (Delete)** : Ajouter un bouton de suppression de famille.

## 🟠 7. Coachs (`coaches/page.tsx`)
_État actuel : Create, Read, Update et Status Toggle présents. Suppression impossible._
- [ ] **Supprimer (Delete)** : Ajouter un bouton de suppression pour retirer définitivement un coach de la base.

## 🟢 8. Dashboard (`dashboard/page.tsx`)
_État actuel : Composant de visualisation correct, mais contient du CSS Brutaliste hérité._
- [ ] **UI Polish** : Retirer `rounded-none border-2 border-border` dans les boutons d'Actions Rapides pour s'aligner sur la nouvelle DA "SaaS Modern".

## 🟢 9. Planning (`schedule/page.tsx`)
_État actuel : Parfait_
- [x] CRUD complètement implémenté (la suppression est gérée dans la modale d'édition).
