import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Page d'accueil (redirection)
 */
test.describe('Page d\'accueil', () => {
  test('devrait rediriger vers login quand non connecté', async ({ page }) => {
    await page.goto('/');
    
    // La page d'accueil redirige automatiquement vers /login si non connecté
    await expect(page).toHaveURL(/\/login/);
    
    // Vérifier le titre de la page de login
    await expect(page).toHaveTitle(/MMA|Arts Martiaux/i);
    
    // Vérifier que le formulaire de login est présent
    await expect(page.locator('h1')).toContainText(/Connexion/i);
  });

  test('devrait rediriger vers profil quand connecté', async ({ page }) => {
    // Se connecter d'abord
    await page.goto('/login');
    await page.fill('input[type="email"]', 'adherent@test.com');
    await page.fill('input[type="password"]', 'Adherent123!');
    await page.click('button[type="submit"]');
    
    // Maintenant aller sur la page d'accueil
    await page.goto('/');
    
    // Devrait rediriger vers le profil
    await expect(page).toHaveURL(/\/profil/);
  });
});

/**
 * Tests E2E - Processus d'adhésion
 */
test.describe('Processus d\'adhésion', () => {
  test('devrait pouvoir accéder à la page d\'adhésion', async ({ page }) => {
    await page.goto('/adhesion');
    
    // Vérifier le titre
    await expect(page.locator('h1')).toContainText(/Adhésion/i);
    
    // Vérifier qu'il y a des options de disciplines
    const disciplines = page.locator('[data-testid="discipline-option"]');
    await expect(disciplines.first()).toBeVisible({ timeout: 5000 });
  });

  test('devrait afficher le widget HelloAsso', async ({ page }) => {
    await page.goto('/adhesion-checkout');
    
    // Vérifier que l'iframe HelloAsso est présente
    const iframe = page.frameLocator('iframe[src*="helloasso"]');
    await expect(iframe.locator('body')).toBeVisible({ timeout: 10000 });
  });
});

/**
 * Tests E2E - Authentification
 */
test.describe('Authentification', () => {
  test('devrait pouvoir accéder à la page de login', async ({ page }) => {
    await page.goto('/login');
    
    // Vérifier les champs du formulaire
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('devrait afficher une erreur avec des credentials invalides', async ({ page }) => {
    await page.goto('/login');
    
    // Remplir le formulaire avec des données invalides
    await page.fill('input[type="email"]', 'test@invalid.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Vérifier le message d'erreur
    await expect(page.locator('text=/Email ou mot de passe incorrect/i')).toBeVisible({ timeout: 5000 });
  });
});

/**
 * Tests E2E - Profil utilisateur (nécessite un compte de test)
 */
test.describe('Profil utilisateur', () => {
  test.skip('devrait afficher le QR code après connexion', async ({ page }) => {
    // Ce test nécessite un compte de test pré-créé
    await page.goto('/login');
    
    // Login avec compte de test
    await page.fill('input[type="email"]', 'test.adherent@example.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Vérifier la redirection vers le profil
    await expect(page).toHaveURL(/\/profil/);
    
    // Vérifier que le QR code est affiché
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible({ timeout: 5000 });
  });
});

/**
 * Tests E2E - Navigation
 */
test.describe('Navigation générale', () => {
  test('devrait pouvoir naviguer entre les pages', async ({ page }) => {
    await page.goto('/');
    
    // Page d'accueil → Adhésion
    await page.click('text=/Adhérer|S\'inscrire/i');
    await expect(page).toHaveURL(/\/adhesion/);
    
    // Retour accueil via logo/header
    await page.click('text=/Accueil|Home/i');
    await expect(page).toHaveURL('/');
  });

  test('devrait être responsive sur mobile', async ({ page }) => {
    // Simuler un viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Vérifier que le contenu est visible
    await expect(page.locator('h1')).toBeVisible();
  });
});
