# 🎭 Guide Complet Playwright - Comprendre les Tests E2E

## 🎯 Qu'est-ce que Playwright ?

Playwright est un framework de test automatisé qui permet de tester des applications web en simulant un utilisateur réel. Il peut :
- **Ouvrir des navigateurs** (Chrome, Firefox, Safari)
- **Naviguer sur des pages web**
- **Cliquer sur des boutons**
- **Remplir des formulaires**
- **Vérifier que le contenu s'affiche correctement**

## 🚀 Ce qui s'est passé quand vous avez fait `npx playwright test`

### 1. Exécution des Tests
```bash
npx playwright test
```

Playwright a :
1. **Lancé votre serveur Next.js** automatiquement (grâce à `webServer` dans `playwright.config.ts`)
2. **Ouvert des navigateurs** en mode "headless" (invisible)
3. **Exécuté tous vos tests** dans les fichiers `e2e/*.spec.ts`
4. **Généré un rapport HTML** avec les résultats

### 2. Le Rapport HTML
```
Serving HTML report at http://localhost:9323
```

Ce message signifie que Playwright a créé un **rapport interactif** accessible à cette adresse. Ce rapport contient :
- ✅ **Tests réussis** (en vert)
- ❌ **Tests échoués** (en rouge)
- 📊 **Statistiques** (temps d'exécution, navigateurs testés)
- 🎬 **Captures d'écran** des échecs
- 📹 **Vidéos** des tests (si activées)

## 📁 Structure de vos Tests

Vos tests sont dans le dossier `MMA/e2e/` :

```
MMA/e2e/
├── app.spec.ts          # Tests des pages publiques
├── admin.spec.ts        # Tests interface admin
└── auth-flow.spec.ts    # Tests d'authentification
```

## 🧪 Anatomie d'un Test Playwright

Voici un exemple de test avec explications :

```typescript
import { test, expect } from '@playwright/test';

test.describe('Connexion utilisateur', () => {
  test('devrait pouvoir se connecter', async ({ page }) => {
    // 1. Aller sur la page de login
    await page.goto('/login');
    
    // 2. Remplir le formulaire
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    // 3. Cliquer sur le bouton
    await page.click('button[type="submit"]');
    
    // 4. Vérifier le résultat
    await expect(page).toHaveURL(/\/profil/);
    await expect(page.locator('h1')).toContainText('Mon espace');
  });
});
```

### Explication ligne par ligne :

- `test.describe()` : **Groupe de tests** (comme un dossier)
- `test()` : **Un test individuel**
- `{ page }` : **L'objet navigateur** fourni par Playwright
- `await page.goto()` : **Naviguer** vers une URL
- `await page.fill()` : **Remplir** un champ de formulaire
- `await page.click()` : **Cliquer** sur un élément
- `await expect()` : **Vérifier** que quelque chose est correct

## 🎮 Modes d'Exécution des Tests

### 1. Mode Headless (par défaut)
```bash
npx playwright test
```
- Tests **invisibles** (rapides)
- Idéal pour l'**intégration continue**

### 2. Mode Interface Utilisateur
```bash
npx playwright test --ui
```
- **Interface graphique** pour voir et contrôler les tests
- Parfait pour **déboguer** et **apprendre**

### 3. Mode Headed (navigateur visible)
```bash
npx playwright test --headed
```
- Voir le **navigateur s'ouvrir** et les actions se dérouler
- Utile pour **comprendre** ce qui se passe

### 4. Mode Debug
```bash
npx playwright test --debug
```
- Tests en **mode pas-à-pas**
- Possibilité de **mettre en pause** et **inspecter**

## 🔍 Comment Voir un Test s'Exécuter

### Option 1 : Mode UI (Recommandé pour apprendre)
```bash
cd MMA
npx playwright test --ui
```

Dans l'interface :
- 📋 **Liste des tests** à gauche
- ▶️ **Bouton Play** pour lancer un test
- 👁️ **Visualisation** du navigateur à droite
- 🐛 **Outils de debug** en bas

### Option 2 : Mode Headed
```bash
npx playwright test --headed --project=chromium
```
- Le navigateur **s'ouvre physiquement**
- Vous voyez **chaque action** en temps réel

### Option 3 : Un seul test
```bash
npx playwright test auth-flow.spec.ts --headed
```

## ⏸️ Mettre un Test en Pause

### Méthode 1 : `page.pause()`
```typescript
test('test avec pause', async ({ page }) => {
  await page.goto('/login');
  
  // ⏸️ PAUSE ICI - Le navigateur s'arrête
  await page.pause();
  
  await page.fill('input[type="email"]', 'test@example.com');
});
```

### Méthode 2 : Mode Debug
```bash
npx playwright test --debug
```
- **Pause automatique** au début
- **Boutons** pour avancer pas-à-pas

### Méthode 3 : Breakpoints dans VS Code
1. Installer l'extension **Playwright Test for VS Code**
2. Mettre des **points d'arrêt** dans le code
3. Lancer en mode debug depuis VS Code

## 📊 Comprendre le Rapport HTML

Quand vous ouvrez `http://localhost:9323` :

### 🏠 Page d'Accueil
- **Résumé global** : X tests passés, Y échoués
- **Temps d'exécution** total
- **Navigateurs testés** (Chrome, Firefox, Safari)

### 📋 Liste des Tests
- **Statut** de chaque test (✅❌)
- **Temps d'exécution** individuel
- **Navigateur** utilisé

### 🔍 Détails d'un Test Échoué
- **Message d'erreur** exact
- **Capture d'écran** au moment de l'échec
- **Trace** des actions effectuées
- **Code source** du test

## 🛠️ Commandes Utiles

### Lancer tous les tests
```bash
npx playwright test
```

### Lancer un fichier spécifique
```bash
npx playwright test auth-flow.spec.ts
```

### Lancer avec un navigateur spécifique
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
```

### Générer le rapport
```bash
npx playwright show-report
```

### Installer les navigateurs
```bash
npx playwright install
```

## 🎯 Vos Tests Actuels

### 1. Tests d'Authentification (`auth-flow.spec.ts`)
- ✅ Connexion admin/coach/adhérent
- ✅ Gestion des erreurs
- ✅ Redirections automatiques

### 2. Tests Pages Publiques (`app.spec.ts`)
- ✅ Navigation entre pages
- ✅ Responsive mobile
- ✅ Formulaires

### 3. Tests Interface Admin (`admin.spec.ts`)
- ✅ Gestion utilisateurs
- ✅ Recherche et filtres
- ✅ Modification des rôles

## 🚨 Pourquoi Certains Tests Échouent

D'après notre session précédente, les tests échouaient car :

1. **Comptes de test manquants** dans la base de données
2. **Backend Django non démarré**
3. **Sélecteurs incorrects** (cherchaient `<table>` au lieu de `<div>`)

## 🔧 Résoudre les Problèmes

### 1. Créer les comptes de test
```bash
cd MMA_BACKEND
# Activer l'environnement virtuel Python
source venv/bin/activate  # ou votre méthode
python3 create_test_users.py
```

### 2. Démarrer le backend
```bash
cd MMA_BACKEND
python3 manage.py runserver
```

### 3. Lancer les tests
```bash
cd MMA
npx playwright test --ui
```

## 🎓 Conseils pour Apprendre

### 1. Commencez par le Mode UI
```bash
npx playwright test --ui
```
- **Visualisez** ce qui se passe
- **Expérimentez** avec les contrôles

### 2. Utilisez les Pauses
```typescript
await page.pause(); // Arrête le test ici
```

### 3. Inspectez les Éléments
```typescript
// Voir tous les éléments qui matchent
await page.locator('button').count(); // Nombre de boutons
await page.locator('button').all(); // Liste de tous les boutons
```

### 4. Captures d'Écran pour Déboguer
```typescript
await page.screenshot({ path: 'debug.png' });
```

## 🎯 Prochaines Étapes

1. **Ouvrir le rapport** : `http://localhost:9323`
2. **Analyser les échecs** dans le rapport
3. **Corriger les problèmes** (comptes de test, backend)
4. **Relancer en mode UI** pour voir les tests réussir
5. **Expérimenter** avec `page.pause()` pour comprendre

---

**🎭 Playwright est votre assistant robot qui teste votre site comme un utilisateur réel !**