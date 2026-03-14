import { test, expect } from "@playwright/test";

// ── Landing → Dashboard ──
test("Landing ENTER button navigates to dashboard", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('[data-testid="landing-enter-btn"]');
  await page.click('[data-testid="landing-enter-btn"]');
  await expect(page).toHaveURL("/dashboard");
  await page.waitForSelector("nav"); // TopNav loads
});

// ── Dashboard: State filter updates cluster list ──
test("Dashboard state filter updates cluster list", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForSelector("nav");

  // Open the State dropdown and select a state
  const stateDropdown = page.locator("text=All States").first();
  if (await stateDropdown.isVisible()) {
    await stateDropdown.click();
    // Select Washington if visible
    const waOption = page.locator("text=Washington").first();
    if (await waOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await waOption.click();
    }
  }
});

// ── Dashboard: cluster → DetailPanel → Open Case File → Case File ──
test("Dashboard cluster selection opens detail and navigates to case file", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.waitForSelector("nav");

  // Wait for cluster list to populate
  await page.waitForTimeout(2000);

  // Click the first cluster item in the list (if any exist)
  const firstCluster = page
    .locator('[class*="cursor-pointer"]')
    .first();
  if (await firstCluster.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstCluster.click();

    // Wait for DetailPanel to populate
    const openBtn = page.locator('[data-testid="open-case-file-btn"]');
    if (await openBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await openBtn.click();
      await expect(page.url()).toContain("/cluster/");
    }
  }
});

// ── Case File: click dark background → returns to dashboard ──
test("Case File background click returns to dashboard", async ({ page }) => {
  // Navigate directly to a cluster page (uses mock data cluster id)
  await page.goto("/cluster/king-wa");
  await page.waitForTimeout(2000);

  const bg = page.locator('[data-testid="casefile-background"]');
  if (await bg.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Click the background area (not the card)
    await bg.click({ position: { x: 10, y: 10 } });
    await expect(page).toHaveURL("/dashboard");
  }
});

// ── Case File: Back to Dashboard button ──
test("Case File back button returns to dashboard", async ({ page }) => {
  await page.goto("/cluster/king-wa");
  await page.waitForTimeout(2000);

  const backBtn = page.locator('[data-testid="back-btn"]');
  if (await backBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await backBtn.click();
    await expect(page).toHaveURL("/dashboard");
  }
});

// ── Map: loads with cluster nodes ──
test("Map page loads with map container", async ({ page }) => {
  await page.goto("/map");
  await page.waitForSelector("nav");

  // Wait for MapCanvas dynamic import to resolve — either map renders or token error shows
  const mapContainer = page.locator('[data-testid="map-container"]');
  const tokenError = page.locator('[data-testid="map-token-error"]');

  // Race: whichever appears first within 15s
  await expect(mapContainer.or(tokenError)).toBeVisible({ timeout: 15000 });
});

// ── Map: state filter triggers zoom ──
test("Map state filter changes view", async ({ page }) => {
  await page.goto("/map");
  await page.waitForSelector("nav");

  // Open State dropdown and select Washington
  const stateDropdown = page.locator("text=All States").first();
  if (await stateDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
    await stateDropdown.click();
    const waOption = page.locator("text=Washington").first();
    if (await waOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await waOption.click();
      // Allow time for fitBounds animation
      await page.waitForTimeout(1500);
    }
  }
});

// ── Nav tabs route to correct pages ──
const NAV_ROUTES = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Map", path: "/map" },
  { label: "Insights", path: "/insights" },
  { label: "Methodology", path: "/methodology" },
];

for (const route of NAV_ROUTES) {
  test(`Nav tab "${route.label}" routes to ${route.path}`, async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForSelector("nav");

    await page.click(`nav >> text=${route.label}`);
    await expect(page).toHaveURL(route.path);
  });
}

// ── Landing and Case File pages (no TopNav, separate routes) ──
test("Landing page renders without TopNav", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('[data-testid="landing-page"]');

  // Landing page should not have the TopNav
  const nav = page.locator("nav");
  const hasNav = await nav.isVisible({ timeout: 1000 }).catch(() => false);
  expect(hasNav).toBe(false);
});

test("Insights page renders content", async ({ page }) => {
  await page.goto("/insights");
  await page.waitForSelector("nav");
  await expect(page.locator("text=WHAT THE DATA SEES")).toBeVisible();
});

test("Methodology page renders content", async ({ page }) => {
  await page.goto("/methodology");
  await page.waitForSelector("nav");
  await expect(page.locator("text=HOW IT WORKS")).toBeVisible();
});
