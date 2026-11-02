import { test, expect } from '@playwright/test';

test.describe('Infos & tarifs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/infos.html');
  });

  test('le prix par cours est juste pour chaque formule', async ({ page }) => {
    const cards = page.locator('.tarif-card');
    await expect(cards).toHaveCount(5);

    // Pack 20 cours : 300 € / 20 = 15 €/cours, affiché et mis en avant.
    const pack20 = cards.filter({ hasText: 'Pack 20 cours' });
    await expect(pack20).toHaveClass(/tarif-card--featured/);
    await expect(pack20.locator('.tarif-card__price')).toContainText('300 €');
    await expect(pack20.locator('.tarif-card__price')).toContainText('15 €/cours');

    // Pack 10 cours : 180 € / 10 = 18 €/cours.
    const pack10 = cards.filter({ hasText: 'Pack 10 cours' });
    await expect(pack10.locator('.tarif-card__price')).toContainText('18 €/cours');
  });

  test('affiche les coordonnées réelles du studio', async ({ page }) => {
    await expect(page.locator('.app-contact')).toContainText('57 chemin de la Speck');
    await expect(page.locator('.app-contact a[href^="tel:"]')).toBeVisible();
  });

  test('le bouton retour ramène à l\'accueil', async ({ page }) => {
    await page.locator('.tool-back').click();
    await expect(page).toHaveURL(/index\.html/);
  });
});
