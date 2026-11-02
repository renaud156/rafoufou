import { test, expect } from '@playwright/test';

test.describe('Accueil — planning de la semaine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    // Laisse l'écran de chargement se résorber (médaillon + halo).
    await expect(page.locator('#app-loader')).toHaveCount(0, { timeout: 5000 });
  });

  test('affiche la photo, la marque et les 3 raccourcis', async ({ page }) => {
    await expect(page.locator('.home-hero__photo')).toBeVisible();
    await expect(page.locator('.home-hero__name')).toHaveText('Pause Pilates');
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

  test('changer de jour met à jour la liste des créneaux', async ({ page }) => {
    const dateLabel = page.locator('#selected-date-label');
    const firstLabel = await dateLabel.textContent();

    // Choisit un autre jour que celui actif.
    const activeIndex = await page.locator('.day-chip.is-active').getAttribute('data-index');
    const otherIndex = activeIndex === '0' ? '1' : '0';
    await page.locator(`.day-chip[data-index="${otherIndex}"]`).click();

    await expect(dateLabel).not.toHaveText(firstLabel ?? '');
    await expect(page.locator(`.day-chip[data-index="${otherIndex}"]`)).toHaveClass(/is-active/);
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

  test('le filtre Yoga ne montre que des créneaux de Yoga', async ({ page }) => {
    // Cherche une semaine qui contient au moins un cours de Yoga pour un test fiable.
    let found = false;
    for (let i = 0; i < 2 && !found; i++) {
      for (let d = 0; d < 7; d++) {
        await page.locator(`.day-chip[data-index="${d}"]`).click();
        const count = await page.locator('.slot-card-v2[data-type="yoga"]').count();
        if (count > 0) {
          found = true;
          break;
        }
      }
      if (!found) await page.locator('#week-next').click();
    }
    expect(found).toBeTruthy();

    await page.locator('.filter-chip', { hasText: 'Yoga' }).click();
    const cards = page.locator('.slot-card-v2');
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);
    for (let i = 0; i < total; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-type', 'yoga');
    }
  });

  test('toucher un créneau ouvre sa fiche avec les bonnes infos', async ({ page }) => {
    const firstCard = page.locator('.slot-card-v2').first();
    const name = (await firstCard.locator('.slot-card-v2__body strong').textContent())?.trim();

    await firstCard.locator('.slot-card-v2__link').click();
    await expect(page).toHaveURL(/detail\.html/);
    await expect(page.locator('#detail-name')).not.toHaveText('');

    if (name) {
      const detailName = await page.locator('#detail-name').textContent();
      expect(name).toContain((detailName ?? '').trim());
    }
  });

  test('le bouton Réserver inline renvoie vers le vrai espace Deciplus', async ({ page }) => {
    const reserveLink = page.locator('.slot-card-v2__reserve').first();
    await expect(reserveLink).toHaveAttribute('href', 'https://member-app.deciplus.pro/pausepilates/home');
  });

  test('la barre d\'onglets mène à Cours et Infos', async ({ page }) => {
    await page.locator('.tab-bar__item', { hasText: 'Cours' }).click();
    await expect(page).toHaveURL(/cours\.html/);

    await page.locator('.tab-bar__item', { hasText: 'Infos' }).click();
    await expect(page).toHaveURL(/infos\.html/);
  });
});
