import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Interface Admin
 * Ces tests nécessitent un compte admin de test
 */

// Helper pour se connecter en tant qu'admin
async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.ADMIN_EMAIL);
  await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin|\/profil/);
}

test.describe('Admin - Gestion des utilisateurs', () => {
  test('devrait afficher la liste des utilisateurs', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    
    // Vérifier le titre
    await expect(page.locator('h1')).toContainText(/Utilisateurs/i);
    
    // Vérifier qu'il y a un tableau d'utilisateurs
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 5000 });
    
    // Vérifier les colonnes
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Nom")')).toBeVisible();
  });

  test('devrait pouvoir rechercher un utilisateur', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    
    // Utiliser le champ de recherche
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('Dupont');
    
    // Attendre les résultats filtrés
    await page.waitForTimeout(500);
    
    // Vérifier que les résultats contiennent "Dupont"
    const rows = page.locator('tbody tr');
    const firstRow = rows.first();
    await expect(firstRow).toContainText(/Dupont/i);
  });
});

test.describe('Admin - Gestion des adhésions', () => {
  test('devrait afficher les statistiques d\'adhésions', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    
    // Vérifier les cartes de stats
    await expect(page.locator('text=/Adhésions actives/i')).toBeVisible();
    await expect(page.locator('text=/Total adhérents/i')).toBeVisible();
  });
});

test.describe('Admin - Gestion des sports/disciplines', () => {
  test('devrait afficher la liste des sports', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/sports');
    
    // Vérifier le titre
    await expect(page.locator('h1')).toContainText(/Sports|Disciplines/i);
    
    // Vérifier qu'il y a des cartes de sports
    const sportCards = page.locator('[data-testid="discipline-card"]');
    await expect(sportCards.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin - Codes promo', () => {
  test('devrait pouvoir accéder à la gestion des codes promo', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/codes-promo');
    
    // Vérifier le titre
    await expect(page.locator('h1')).toContainText(/Codes promo/i);
    
    // Vérifier le bouton de création
    await expect(page.locator('button:has-text("Créer")')).toBeVisible();
  });
});

test.describe('Admin - Configuration HelloAsso', () => {
  test('devrait afficher la page de config HelloAsso', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/helloasso-config');
    
    // Vérifier le titre
    await expect(page.locator('h1')).toContainText(/HelloAsso/i);
    
    // Vérifier les champs de configuration
    await expect(page.locator('text=/Client ID/i')).toBeVisible();
    await expect(page.locator('text=/Client Secret/i')).toBeVisible();
  });
});

test.describe('Coach - Interface coach', () => {
  test('devrait afficher la liste des adhérents pour un coach', async ({ page }) => {
    // Note: nécessite un compte coach de test
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.COACH_EMAIL || 'coach@test.com');
    await page.fill('input[type="password"]', process.env.COACH_PASSWORD || 'Coach123!');
    await page.click('button[type="submit"]');
    
    await page.goto('/coach/adherents');
    
    // Vérifier le titre
    await expect(page.locator('h1')).toContainText(/Adhérents/i);
    
    // Vérifier qu'il y a une liste
    const adherents = page.locator('[data-testid="adherent-card"]');
    await expect(adherents.first()).toBeVisible({ timeout: 5000 });
  });
});
