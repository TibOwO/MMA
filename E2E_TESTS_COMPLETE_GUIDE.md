# Guide Complet des Tests E2E Playwright - MMA Project

## 🎯 État Actuel des Tests

### ✅ Ce qui a été fait :
- **Configuration Playwright complète** avec support multi-navigateurs
- **Scripts npm configurés** pour différents modes de test
- **Variables d'environnement** de test configurées
- **Data-testid ajoutés** aux composants critiques (SportCard, QR Code)
- **Tests d'authentification complets** avec flux réalistes
- **Tests admin et coach** pour les interfaces de gestion
- **Script de création automatique** des comptes de test
- **Script de lancement complet** avec vérifications automatiques

### 📁 Structure des Tests
```
MMA/
├── e2e/
│   ├── app.spec.ts              # Tests pages publiques et navigation
│   ├── admin.spec.ts            # Tests interface admin/coach
│   └── auth-flow.spec.ts        # Tests flux d'authentification complets
├── playwright.config.ts         # Configuration Playwright
├── .env.test                   # Variables d'environnement de test
└── package.json                # Scripts npm configurés

MMA_BACKEND/
└── create_test_users.py        # Script création comptes de test

run_e2e_tests.sh               # Script de lancement complet
```

## 🚀 Lancement Rapide

### 1. Prérequis
```bash
# Activer l'environnement virtuel Python (backend)
cd MMA_BACKEND
source venv/bin/activate  # ou votre méthode d'activation

# Installer les dépendances Node.js (frontend)
cd ../MMA
npm install
```

### 2. Créer les comptes de test
```bash
cd MMA_BACKEND
python3 create_test_users.py
```

### 3. Lancer les tests
```bash
# Depuis la racine du projet
./run_e2e_tests.sh

# Ou manuellement :
cd MMA
npm run test:e2e
```

## 🧪 Modes de Test Disponibles

### Mode Headless (par défaut)
```bash
npm run test:e2e
```

### Mode Interface Utilisateur
```bash
npm run test:e2e:ui
# ou
./run_e2e_tests.sh --ui
```

### Mode Debug
```bash
npm run test:e2e:debug
# ou
./run_e2e_tests.sh --debug
```

### Mode avec Navigateur Visible
```bash
./run_e2e_tests.sh --headed
```

### Rapport HTML
```bash
npm run test:e2e:report
```

## 📋 Tests Implémentés

### 1. Tests d'Authentification (`auth-flow.spec.ts`)
- ✅ Redirection automatique vers login
- ✅ Connexion adhérent valide
- ✅ Connexion admin
- ✅ Connexion coach
- ✅ Affichage QR code (si adhésion active)
- ✅ Gestion erreurs credentials invalides
- ✅ Navigation post-connexion

### 2. Tests Pages Publiques (`app.spec.ts`)
- ✅ Redirection page d'accueil
- ✅ Pages disciplines
- ✅ Processus d'adhésion
- ✅ Formulaire de login
- ✅ Navigation générale
- ✅ Responsive mobile

### 3. Tests Interface Admin (`admin.spec.ts`)
- ✅ Gestion utilisateurs
- ✅ Recherche utilisateurs
- ✅ Statistiques adhésions
- ✅ Gestion sports/disciplines
- ✅ Codes promo
- ✅ Configuration HelloAsso
- ✅ Interface coach

## 🔧 Comptes de Test Créés

Le script `create_test_users.py` crée automatiquement :

| Rôle | Email | Mot de passe | Usage |
|------|-------|--------------|-------|
| Admin | admin@test.com | Admin123! | Tests interface admin |
| Coach | coach@test.com | Coach123! | Tests interface coach |
| Adhérent | adherent@test.com | Adherent123! | Tests profil utilisateur |

## 🎨 Data-testid Ajoutés

Pour faciliter les tests, les data-testid suivants ont été ajoutés :

```tsx
// SportCard.tsx
<div data-testid="sport-card">

// Profil page
<div data-testid="qr-code">
```

## 🔍 Ce qui Reste à Faire

### Tests Manquants à Implémenter :
1. **Tests de formulaires** - Validation des champs
2. **Tests d'upload** - Si applicable
3. **Tests de pagination** - Listes longues
4. **Tests de filtres** - Recherche avancée
5. **Tests d'erreurs réseau** - Gestion hors ligne
6. **Tests de performance** - Temps de chargement

### Améliorations Possibles :
1. **Data-testid supplémentaires** dans les pages admin
2. **Tests de régression** pour les bugs critiques
3. **Tests cross-browser** automatisés
4. **Intégration CI/CD** avec GitHub Actions
5. **Tests de charge** avec Playwright

## 🛠️ Dépannage

### Problème : Backend non accessible
```bash
cd MMA_BACKEND
python3 manage.py runserver
```

### Problème : Frontend non accessible
```bash
cd MMA
npm run dev
```

### Problème : Tests échouent
1. Vérifier que les comptes de test existent
2. Vérifier que les serveurs sont démarrés
3. Consulter le rapport HTML : `npm run test:e2e:report`

### Problème : Navigateurs manquants
```bash
cd MMA
npx playwright install
```

## 📊 Métriques de Couverture

### Pages Testées :
- ✅ Page d'accueil (redirection)
- ✅ Page de login
- ✅ Page profil utilisateur
- ✅ Pages admin (users, sports, codes-promo, etc.)
- ✅ Pages coach
- ⚠️ Pages disciplines (partiellement)
- ⚠️ Pages d'adhésion (partiellement)

### Fonctionnalités Testées :
- ✅ Authentification complète
- ✅ Navigation entre pages
- ✅ Affichage QR codes
- ✅ Interfaces de gestion
- ⚠️ Processus de paiement HelloAsso
- ⚠️ Gestion des erreurs avancées

## 🚀 Prochaines Étapes

1. **Exécuter les tests** pour identifier les problèmes restants
2. **Ajouter les data-testid manquants** dans les pages admin
3. **Implémenter les tests manquants** listés ci-dessus
4. **Configurer l'intégration CI/CD** pour automatiser les tests
5. **Optimiser les performances** des tests

## 📝 Notes Importantes

- Les tests utilisent des **comptes dédiés** qui ne doivent pas être supprimés
- Le **backend Django doit être démarré** avant les tests
- Les tests sont **indépendants** et peuvent être exécutés dans n'importe quel ordre
- Le **script de lancement** gère automatiquement la plupart des prérequis

---

**Prêt à tester !** 🎉

Utilisez `./run_e2e_tests.sh --ui` pour une première exécution avec interface visuelle.