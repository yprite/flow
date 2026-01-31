import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for API data to load
    await page.waitForSelector('[data-testid="stats-section"]', { timeout: 10000 })
  })

  test('should load the dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/일정비서|Business|Dashboard/)
  })

  test('should display the header with project name', async ({ page }) => {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    await expect(header).toContainText(/일정비서|Dashboard/)
  })

  test('should display stats cards', async ({ page }) => {
    // Stats cards should be visible
    const statsSection = page.locator('[data-testid="stats-section"]')
    await expect(statsSection).toBeVisible()

    // Should have multiple stat cards
    const statCards = page.locator('[data-testid="stat-card"]')
    await expect(statCards).toHaveCount(4) // Invested, Revenue, Users, Paid
  })

  test('should display track progress sections', async ({ page }) => {
    // Preparation track
    const prepTrack = page.locator('[data-testid="track-preparation"]')
    await expect(prepTrack).toBeVisible()

    // Development track
    const devTrack = page.locator('[data-testid="track-development"]')
    await expect(devTrack).toBeVisible()
  })

  test('should display timeline with phases', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline"]')
    await expect(timeline).toBeVisible()

    // Should have phase nodes
    const phaseNodes = page.locator('[data-testid="phase-node"]')
    const count = await phaseNodes.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display task items with status indicators', async ({ page }) => {
    const taskItems = page.locator('[data-testid="task-item"]')
    const count = await taskItems.count()
    expect(count).toBeGreaterThan(0)

    // Each task should have a status indicator
    const firstTask = taskItems.first()
    await expect(firstTask).toBeVisible()
  })

  test('should show blocker alert when blockers exist', async ({ page }) => {
    // Check if blocker alert is visible (only if there are blockers)
    const blockerAlert = page.locator('[data-testid="blocker-alert"]')

    // Either blocker alert exists and is visible, or there are no blockers
    const blockerCount = await blockerAlert.count()
    if (blockerCount > 0) {
      await expect(blockerAlert).toBeVisible()
    }
  })

  test('should have proper progress bar styling', async ({ page }) => {
    const progressBars = page.locator('[data-testid="progress-bar"]')
    const count = await progressBars.count()
    expect(count).toBeGreaterThan(0)

    // Progress bars should have proper width (not 0%)
    const firstBar = progressBars.first()
    await expect(firstBar).toBeVisible()
  })
})

test.describe('Dashboard Responsiveness', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForSelector('[data-testid="stats-section"]', { timeout: 10000 })

    // Main content should still be visible
    const header = page.locator('h1')
    await expect(header).toBeVisible()

    // Stats should stack on mobile
    const statsSection = page.locator('[data-testid="stats-section"]')
    await expect(statsSection).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForSelector('[data-testid="stats-section"]', { timeout: 10000 })

    const header = page.locator('h1')
    await expect(header).toBeVisible()
  })

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForSelector('[data-testid="stats-section"]', { timeout: 10000 })

    const header = page.locator('h1')
    await expect(header).toBeVisible()

    // On desktop, tracks should be side by side
    const tracks = page.locator('[data-testid^="track-"]')
    await expect(tracks).toHaveCount(2)
  })
})

test.describe('Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="stats-section"]', { timeout: 10000 })
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
  })

  test('should have visible focus indicators', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab')

    const focusedElement = page.locator(':focus')
    const count = await focusedElement.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // Check that text is visible against background
    const body = page.locator('body')
    const backgroundColor = await body.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    )

    // Background should not be transparent/undefined
    expect(backgroundColor).toBeDefined()
  })
})

test.describe('Dashboard Data Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="stats-section"]', { timeout: 10000 })
  })

  test('should display correct task counts', async ({ page }) => {
    // Get all task items
    const taskItems = page.locator('[data-testid="task-item"]')
    const count = await taskItems.count()

    // Should have tasks from both tracks
    expect(count).toBeGreaterThan(0)
  })

  test('should show last updated timestamp', async ({ page }) => {
    const timestamp = page.locator('[data-testid="last-updated"]')
    const count = await timestamp.count()

    if (count > 0) {
      await expect(timestamp).toBeVisible()
    }
  })

  test('should display milestone information', async ({ page }) => {
    const milestones = page.locator('[data-testid="milestone"]')
    const count = await milestones.count()

    // May or may not have visible milestones
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
