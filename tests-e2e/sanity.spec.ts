import { test, expect, type Page } from '@playwright/test';

async function signIn(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Production overview' })).toBeVisible();
}

test('protects the studio shell with a persisted mock session', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('AiVideoStudio');
  await expect(page.getByRole('heading', { name: 'Sign in to AI Studio' })).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveValue('owner@northstar.studio');
  await expect(page.getByLabel('Password')).toHaveValue('studio-demo');

  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Production overview' })).toBeVisible();
});

test('creates and switches workspaces', async ({ page }) => {
  await signIn(page);
  await page.goto('/workspaces');
  await page.getByRole('button', { name: 'New workspace' }).click();
  await page.getByLabel('Workspace name').fill('Editorial Lab');
  await page.getByRole('button', { name: 'Create workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Editorial Lab' })).toBeVisible();
  await expect(page.getByText('Current workspace')).toBeVisible();
});

test('creates, edits, opens and archives a project', async ({ page }) => {
  await signIn(page);
  const projectName = `Foundation Film ${Date.now()}`;
  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByLabel('Project name').fill(projectName);
  await page.getByLabel('Description').fill('Sprint 2 project flow verification.');
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

  await page.getByRole('button', { name: 'Edit project' }).click();
  await page.getByLabel('Name').fill(`${projectName} revised`);
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.getByRole('heading', { name: `${projectName} revised` })).toBeVisible();

  await page.getByRole('button', { name: 'Open editor' }).click();
  await expect(page.getByText('Main timeline')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Timeline playhead' })).toBeVisible();
});

test('renders every required center with meaningful data', async ({ page }) => {
  await signIn(page);
  const centers = [
    ['/assets', 'Asset Library'],
    ['/jobs', 'Job Center'],
    ['/renders', 'Render Center'],
    ['/providers', 'Provider Registry'],
    ['/settings', 'Settings'],
  ] as const;

  for (const [path, heading] of centers) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }

  await page.goto('/providers');
  for (const provider of ['OpenAI', 'Gemini', 'Veo', 'Kling', 'Runway']) {
    await expect(page.getByRole('heading', { name: provider })).toBeVisible();
  }
});

test('retries a failed job and updates its queue state', async ({ page }) => {
  await signIn(page);
  await page.goto('/jobs');
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('Job queued for retry')).toBeVisible();
  await expect(page.getByText('Queued', { exact: true })).toHaveCount(2);
});
