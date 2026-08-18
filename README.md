<p align="center">
  <img src="public/preview/preview.png" alt="Aperçu WorkSphere" width="100%" />
</p>

# WorkSphere — Gestion des employés (RH)

> Un dashboard SaaS moderne, premium et entièrement responsive de **gestion des ressources humaines**,
> construit avec **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**,
> **Lucide Icons**, **Recharts** et **React Hook Form + Zod**.

Toutes les données sont **fictives et locales** (mockées) — aucune base de données ni backend réel.
Les données sont centralisées dans `data/` et persistées côté client (localStorage), ce qui facilite
le remplacement futur par une vraie API.

---

## 🚀 Installation & démarrage

Prérequis : **Node.js ≥ 20.9**.

```bash
# 1. Cloner le projet (ou copier le dossier)
git clone <votre-dépôt> work-sphere
cd work-sphere

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

Puis ouvrez [http://localhost:3000](http://localhost:3000) 🎉

### Scripts disponibles

| Commande              | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Serveur de développement (Hot Reload)          |
| `npm run build`       | Build de production (vérifie la compilation)   |
| `npm run start`       | Serveur de production                          |
| `npm run lint`        | ESLint                                         |
| `npx tsc --noEmit`    | Vérification des types TypeScript              |

---

## ✨ Fonctionnalités

- **Dashboard** : cartes statistiques (effectifs, actifs, congés, recrues, masse salariale),
  graphique d'évolution des effectifs, répartition par département (donut), présences du jour,
  derniers employés ajoutés et activité récente (timeline).
- **Employés** : tableau + vue cartes, recherche instantanée, filtres avancés, tri par colonnes,
  pagination, sélection multiple, actions groupées (changer le statut / supprimer), ajout /
  modification via formulaire validé **Zod**, suppression avec confirmation.
- **Fiche employé** (`/employees/[id]`) : onglets Informations, Présence, Congés, Salaire,
  Documents, Évaluations.
- **Départements** : cartes avec responsable, effectifs, budget, progression et membres.
- **Congés** : calendrier interactif, demandes avec approbation / refus, création de demande.
- **Présences** : taux de présence, absences, retards, télétravail, graphique hebdomadaire et
  tableau de pointage quotidien.
- **Salaires** : masse salariale, moyennes, min/max, évolution mensuelle et détail par employé.
- **Évaluations** : note moyenne, objectifs, progression, graphique de performance et tableau.
- **Documents** : contrats, fiches de paie, certificats, administratifs, téléversement et suppression.
- **Paramètres** : profil, organisation, notifications, sécurité, apparence (thème) et préférences.

## 🎨 Interface

- **Dark mode par défaut** avec bascule clair / sombre (persistée).
- Sidebar fixe et **collapsible** sur desktop, **drawer** sur mobile.
- Topbar avec recherche globale (**Ctrl/Cmd + K**), notifications, thème et menu utilisateur.
- Design sobre et élégant : cartes à bordures subtiles, coins arrondis, animations légères,
  hover states soignés, **100 % responsive mobile-first sans scroll horizontal**.

## ♿ Accessibilité & UX

- Skeleton loading, empty states et error states avec bouton réessayer.
- Toasts (sonner), confirmations avant suppression, modales, dropdowns, tooltips.
- Navigation clavier, rôles/attributs ARIA, focus visibles, tables scrollables sur mobile.

---

## 🗂 Architecture

```
app/                     # App Router (pages + layouts)
  (dashboard)/           # route group : layout applicatif (sidebar + topbar)
    employees/[id]/      # fiche employé (route dynamique)
components/
  ui/                    # primitives réutilisables (button, card, table, dialog, …)
  shared/                # composants transverses (page-header, search-input, …)
  dashboard/ employees/  # composants par feature
  departments/ leaves/
  attendance/ payroll/   # … etc.
  evaluations/ documents/
  settings/
data/                    # données fictives centralisées (mocks)
lib/                     # store client, utils, formatage, stats
types/                   # types TypeScript globaux
```

Les données fictives sont regroupées dans `data/` et chargées via un store client
(`lib/store.tsx`) : il suffit de remplacer les importations de `data/` par des appels API pour
brancher un vrai backend.

---

## 🧰 Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Radix UI · Lucide · Recharts ·
React Hook Form · Zod · Sonner · date-fns · class-variance-authority · tailwind-merge

---

📘 Une version anglaise de cette documentation est disponible : [`README.en.md`](./README.en.md).
