import { test, expect } from '@playwright/test';

test.describe('Accueil — planning de la semaine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    // Laisse l'écran de chargement se résorber (médaillon + halo).
    await expect(page.locator('#app-loader')).toHaveCount(0, { timeout: 8000 });
  });

  test('affiche le logo, le message d\'accueil et les 3 raccourcis', async ({ page }) => {
    await expect(page.locator('.home-topbar__logo')).toBeVisible();
    await expect(page.locator('.home-greeting h1')).toHaveText('Bonjour !');
    await expect(page.locator('.home-tile')).toHaveCount(3);
  });

  test('calcule et affiche un vrai "prochain cours"', async ({ page }) => {
    const card = page.locator('#next-class-card');
    await expect(card).toBeVisible();
    await expect(card.locator('.next-class__name')).not.toHaveText('');
    await expect(card.locator('.next-class__meta')).not.toHaveText('');
  });

  test('le sélecteur de semaine a 7 jours, un seul actif', async ({ page }) => {
    const chips = page.locator('.day-chip');
    await expect(chips).toHaveCount(7);
    await expect(page.locator('.day-chip.is-active')).toHaveCount(1);
    await expect(page.locator('#week-range-label')).toContainText('Semaine du');
  });

  test('toucher un jour fait défiler jusqu\'à sa section et le met en valeur', async ({ page }) => {
    // Toute la semaine est visible d'un coup : il doit y avoir une section par jour.
    await expect(page.locator('.day-section')).toHaveCount(7);

    const activeIndex = await page.locator('.day-chip.is-active').getAttribute('data-index');
    const otherIndex = activeIndex === '0' ? '1' : '0';
    await page.locator(`.day-chip[data-index="${otherIndex}"]`).click();

    await expect(page.locator(`.day-chip[data-index="${otherIndex}"]`)).toHaveClass(/is-active/);
    await expect(page.locator(`#day-${otherIndex}`)).toBeInViewport();
  });

  test('la navigation semaine précédente/suivante change bien de semaine', async ({ page }) => {
    const rangeLabel = page.locator('#week-range-label');
    const before = await rangeLabel.textContent();

    await page.locator('#week-next').click();
    const afterNext = await rangeLabel.textContent();
    expect(afterNext).not.toEqual(before);

    await page.locator('#week-prev').click();
    const afterPrev = await rangeLabel.textContent();
    expect(afterPrev).toEqual(before);
  });

  test('le filtre Yoga ne montre que des créneaux de Yoga, sur toute la semaine', async ({ page }) => {
    // La vraie semaine contient toujours au moins un cours de Yoga.
    await expect(page.locator('.day-row[data-type="yoga"]').first()).toBeVisible();

    await page.locator('.filter-chip', { hasText: 'Yoga' }).click();
    const rows = page.locator('.day-row');
    const total = await rows.count();
    expect(total).toBeGreaterThan(0);
    for (let i = 0; i < total; i++) {
      await expect(rows.nth(i)).toHaveAttribute('data-type', 'yoga');
    }
  });

  test('toucher un créneau ouvre sa fiche avec les bonnes infos', async ({ page }) => {
    const firstRow = page.locator('.day-row').first();
    const name = (await firstRow.locator('.day-row__body strong').textContent())?.trim();

    await firstRow.locator('.day-row__link').click();
    await expect(page).toHaveURL(/detail\.html/);
    await expect(page.locator('#detail-name')).not.toHaveText('');

    if (name) {
      const detailName = await page.locator('#detail-name').textContent();
      expect(name).toContain((detailName ?? '').trim());
    }
  });

  test('le bouton Réserver inline renvoie vers le vrai espace Deciplus', async ({ page }) => {
    const reserveLink = page.locator('.day-row__reserve').first();
    await expect(reserveLink).toHaveAttribute('href', 'https://member-app.deciplus.pro/pausepilates/home');
  });

  test('la barre d\'onglets mène à Cours et Infos', async ({ page }) => {
    await page.locator('.tab-bar__item', { hasText: 'Cours' }).click();
    await expect(page).toHaveURL(/cours\.html/);

    await page.locator('.tab-bar__item', { hasText: 'Infos' }).click();
    await expect(page).toHaveURL(/infos\.html/);
  });
});
