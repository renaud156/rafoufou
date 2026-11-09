import { test, expect } from '@playwright/test';

test.describe('Écran Cours', () => {
  test('liste les 5 types de cours avec une courte description', async ({ page }) => {
    await page.goto('/cours.html');
    await expect(page.locator('.course-legend__item')).toHaveCount(5);
    for (const item of await page.locator('.course-legend__item').all()) {
      await expect(item.locator('strong')).not.toHaveText('');
      await expect(item.locator('p')).not.toHaveText('');
    }
  });

  test('"Voir les créneaux" renvoie vers le planning de l\'accueil', async ({ page }) => {
    await page.goto('/cours.html');
    await expect(page.locator('.reserve-action a')).toHaveAttribute('href', 'index.html#schedule');
  });
});

test.describe('Fiche d\'un cours', () => {
  test('sans créneau sélectionné, revient au planning', async ({ page }) => {
    await page.goto('/detail.html');
    await expect(page).toHaveURL(/index\.html#schedule/);
  });

  test('avec une donnée corrompue en mémoire, revient au planning sans planter', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => {
      sessionStorage.setItem('pp_selected_class', '{not valid json');
    });
    await page.goto('/detail.html');
    await expect(page).toHaveURL(/index\.html#schedule/);
  });

  test('avec un créneau sélectionné, affiche ses vraies infos', async ({ page }) => {
    await page.goto('/index.html');
    await page.addInitScript(() => {});
    await page.evaluate(() => {
      sessionStorage.setItem(
        'pp_selected_class',
        JSON.stringify({
          type: 'yoga',
          typeLabel: 'Yoga',
          name: 'Yoga',
          level: '',
          desc: 'Souplesse, équilibre et respiration, pour tout public.',
          time: '09h30 – 10h30',
          duration: '60 min',
          dateLabel: 'Jeudi 5 novembre',
        })
      );
    });
    await page.goto('/detail.html');

    await expect(page.locator('#detail-name')).toHaveText('Yoga');
    await expect(page.locator('#detail-date')).toHaveText('Jeudi 5 novembre');
    await expect(page.locator('#detail-time')).toHaveText('09h30 – 10h30 (60 min)');
    await expect(page.locator('#detail-level-row')).toBeHidden();
    await expect(page.locator('.reserve-cta')).toHaveAttribute(
      'href',
      'https://member-app.deciplus.pro/pausepilates/home'
    );
  });
});
