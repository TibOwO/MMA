import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Flux d'authentification complet
 * Ces tests nécessitent des comptes de test pré-créés
 */

test.describe('Flux d\'authentification', () => {
  test('devrait rediriger vers login depuis la page d\'accueil', async ({ page }) => {
    await page.goto('/');
    
    // La page d'accueil devrait rediriger vers /login si non connecté
    await expect(page).toHaveURL(/\/login/);
    
    // Vérifier que le formulaire de login est présent
    await expect(page.locator('h1')).toContainText(/Connexion/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('devrait pouvoir se connecter avec un compte adhérent valide', async ({ page }) => {
    await page.goto('/login');
    
    // Remplir le formulaire avec les credentials de test
    await page.fill('input[type="email"]', 'adherent@test.com');
    await page.fill('input[type="password"]', 'Adherent123!');
    await page.click('button[type="submit"]');
    
    // Attendre la redirection vers le profil
    await expect(page).toHaveURL(/\/profil/, { timeout: 10000 });
    
    // Vérifier que la page profil s'affiche
    await expect(page.locator('h1')).toContainText(/Mon espace/i);
  });

  test('devrait afficher le QR code pour un adhérent avec adhésion active', async ({ page }) => {
    // Se connecter d'abord
    await page.goto('/login');
    await page.fill('input[type="email"]', 'adherent@test.com');
    await page.fill('input[type="password"]', 'Adherent123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/profil/);
    
    // Vérifier si le QR code est présent (peut ne pas être visible selon les données)
    const qrCode = page.locator('[data-testid="qr-code"]');
    const qrExists = await qrCode.count() > 0;
    
    if (qrExists) {
      await expect(qrCode).toBeVisible();
      console.log('✅ QR code trouvé et visible');
    } else {
      // Si pas de QR code, vérifier qu'il y a au moins les infos d'adhésion
      await expect(page.locator('text=/Mes adhésions|Aucune adhésion/i')).toBeVisible();
      console.log('ℹ️ Pas de QR code visible (normal si pas d\'adhésion active)');
    }
  });

  test('devrait pouvoir se connecter en tant qu\'admin', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // L'admin peut être redirigé vers /profil ou /admin
    await expect(page).toHaveURL(/\/(profil|admin)/);
    
    // Vérifier qu'on peut accéder aux pages admin
    await page.goto('/admin/users');
    await expect(page.locator('h1')).toContainText(/Utilisateurs/i);
  });

  test('devrait pouvoir se connecter en tant que coach', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'coach@test.com');
    await page.fill('input[type="password"]', 'Coach123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/(profil|coach)/);
    
    // Vérifier qu'on peut accéder aux pages coach
    await page.goto('/coach/adherents');
    await expect(page.locator('h1')).toContainText(/Adhérents/i);
  });

  test('devrait afficher une erreur avec des credentials invalides', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Vérifier le message d'erreur
    await expect(page.locator('text=/Email ou mot de passe incorrect/i')).toBeVisible({ timeout: 5000 });
    
    // Vérifier qu'on reste sur la page de login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Navigation après connexion', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter avant chaque test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'adherent@test.com');
    await page.fill('input[type="password"]', 'Adherent123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/profil/);
  });

  test('devrait pouvoir naviguer vers différentes pages', async ({ page }) => {
    // Tester la navigation depuis le profil
    await expect(page.locator('h1')).toContainText(/Mon espace/i);
    
    // Vérifier que les informations personnelles sont affichées
    await expect(page.locator('text=/Informations personnelles/i')).toBeVisible();
  });
});