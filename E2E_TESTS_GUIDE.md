# Guide des Tests E2E (End-to-End)

## Installation

```bash
cd /home/tibo/Desktop/Workspace/mma_project/MMA

# Installer Playwright
npm install -D @playwright/test

# Installer les navigateurs
npx playwright install
```

## Configuration

1. **Créer les comptes de test dans votre DB** :
```bash
cd ../MMA_BACKEND
python manage.py shell
```

```python
from main.models import User
from django.contrib.auth.hashers import make_password

# Créer un admin de test
User.objects.create(
    email='admin@test.com',
    nom='Test',
    prenom='Admin',
    password=make_password('Admin123!'),
    role='admin'
)

# Créer un coach de test
User.objects.create(
    email='coach@test.com',
    nom='Test',
    prenom='Coach',
    password=make_password('Coach123!'),
    role='coach'
)

# Créer un adhérent de test
User.objects.create(
    email='adherent@test.com',
    nom='Test',
    prenom='Adherent',
    password=make_password('Adherent123!'),
    role='membre'
)
```

2. **Configurer les variables d'environnement** :
```bash
cd ../MMA
cp .env.test.example .env.test
# Éditer .env.test avec vos credentials de test
```

## Lancer les tests

### Mode interactif (avec interface visuelle)
```bash
npm run test:e2e:ui
```

### Mode headless (en ligne de commande)
```bash
npm run test:e2e
```

### Lancer un seul fichier de test
```bash
npx playwright test e2e/app.spec.ts
```

### Lancer avec un navigateur spécifique
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Mode debug (avec pause automatique)
```bash
npx playwright test --debug
```

### Voir le rapport HTML
```bash
npx playwright show-report
```

## Ajouter les scripts dans package.json

Ajoutez ces lignes dans votre `package.json` :

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Structure des tests

```
MMA/
├── e2e/                          # Dossier des tests E2E
│   ├── app.spec.ts              # Tests pages publiques
│   └── admin.spec.ts            # Tests interface admin/coach
├── playwright.config.ts          # Configuration Playwright
└── .env.test.example            # Variables d'environnement
```

## Avant de lancer les tests

1. **Démarrer le backend Django** :
```bash
cd MMA_BACKEND
python manage.py runserver
```

2. **Démarrer le frontend Next.js** :
```bash
cd MMA
npm run dev
```

3. **Lancer les tests** :
```bash
npm run test:e2e
```

> Note : Playwright peut démarrer automatiquement le serveur Next.js grâce à la config `webServer` dans `playwright.config.ts`

## Bonnes pratiques

### 1. Utiliser des data-testid
```tsx
// Dans vos composants React
<div data-testid="sport-card">MMA</div>
<div data-testid="qr-code">...</div>
```

```typescript
// Dans vos tests
await page.locator('[data-testid="sport-card"]').click();
```

### 2. Attendre les éléments
```typescript
// Mauvais
await page.click('button');

// Bon
await page.locator('button').waitFor({ state: 'visible' });
await page.click('button');

// Ou avec expect
await expect(page.locator('button')).toBeVisible();
```

### 3. Isoler les tests
Chaque test doit être indépendant :
```typescript
test.beforeEach(async ({ page }) => {
  // Reset l'état avant chaque test
  await page.goto('/');
});
```

### 4. Nettoyer les données de test
```typescript
test.afterAll(async () => {
  // Supprimer les données créées pendant les tests
});
```

## Exemples de scénarios à tester

### Scénario 1 : Parcours adhérent complet
```typescript
test('parcours complet adhérent', async ({ page }) => {
  // 1. Visiter la page d'accueil
  await page.goto('/');
  
  // 2. Cliquer sur une discipline
  await page.click('text=MMA');
  
  // 3. Cliquer sur "S'inscrire"
  await page.click('text=S\'inscrire');
  
  // 4. Vérifier l'iframe HelloAsso
  await expect(page.frameLocator('iframe[src*="helloasso"]')).toBeVisible();
});
```

### Scénario 2 : Login et affichage QR
```typescript
test('login et QR code', async ({ page }) => {
  // 1. Se connecter
  await page.goto('/login');
  await page.fill('input[type="email"]', 'adherent@test.com');
  await page.fill('input[type="password"]', 'Adherent123!');
  await page.click('button[type="submit"]');
  
  // 2. Vérifier la redirection
  await expect(page).toHaveURL(/\/profil/);
  
  // 3. Vérifier le QR code
  await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
});
```

### Scénario 3 : Admin gère un adhérent
```typescript
test('admin consulte la liste des adhérents', async ({ page }) => {
  // 1. Login admin
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  
  // 2. Aller sur la page users
  await page.goto('/admin/users');
  
  // 3. Vérifier la liste
  await expect(page.locator('table')).toBeVisible();
  
  // 4. Chercher un utilisateur
  await page.fill('input[placeholder*="Rechercher"]', 'Test');
  await expect(page.locator('tbody tr').first()).toContainText('Test');
});
```

## Debugging

### Voir ce que voit le navigateur
```typescript
test('debug visuel', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Pause le test ici
  // Le navigateur reste ouvert pour inspection
});
```

### Prendre des screenshots
```typescript
test('screenshot', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'homepage.png', fullPage: true });
});
```

### Tracer l'exécution
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## CI/CD (GitHub Actions)

Créer `.github/workflows/e2e.yml` :
```yaml
name: Tests E2E

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test:e2e
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Best practices](https://playwright.dev/docs/best-practices)
- [Exemples](https://playwright.dev/docs/test-components)
