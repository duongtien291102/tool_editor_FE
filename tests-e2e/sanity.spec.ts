import { test, expect } from '@playwright/test';

test('protects the AiVideoStudio shell with production authentication', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('AiVideoStudio');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabel('Username')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('logs in and restores the session through the real API', async ({ page }) => {
  test.skip(
    !process.env.E2E_USERNAME || !process.env.E2E_PASSWORD,
    'Live API credentials are not configured.',
  );

  await page.goto('/');
  await page.getByLabel('Username').fill(process.env.E2E_USERNAME ?? '');
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('AI Video Studio')).toBeVisible();

  await page.evaluate(() => window.sessionStorage.clear());
  await page.reload();
  await expect(page.getByText('AI Video Studio')).toBeVisible();
});

test('creates, renames, and deletes a project through Mongo-backed APIs', async ({ page }) => {
  test.skip(
    !process.env.E2E_USERNAME || !process.env.E2E_PASSWORD,
    'Live API credentials are not configured.',
  );
  const projectName = `E2E ${Date.now()}`;
  const renamedProject = `${projectName} renamed`;

  await page.goto('/');
  await page.getByLabel('Username').fill(process.env.E2E_USERNAME ?? '');
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('AI Video Studio')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept(projectName));
  await page.getByTitle('New project').click();
  await expect(page.getByRole('button', { name: projectName })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept(renamedProject));
  await page.getByTitle('Rename project').click();
  await expect(page.getByRole('button', { name: renamedProject })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByTitle('Delete project').click();
  await expect(page.getByRole('button', { name: renamedProject })).toHaveCount(0);
});

test('uploads, searches, renames, and deletes media through the chunk engine', async ({ page }) => {
  test.setTimeout(60_000);
  test.skip(
    !process.env.E2E_USERNAME || !process.env.E2E_PASSWORD,
    'Live API credentials are not configured.',
  );
  const projectName = `Media E2E ${Date.now()}`;
  const assetName = `asset-${Date.now()}.json`;
  const renamedAsset = `renamed-${assetName}`;

  await page.goto('/');
  await page.getByLabel('Username').fill(process.env.E2E_USERNAME ?? '');
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('AI Video Studio')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept(projectName));
  await page.getByTitle('New project').click();
  await expect(page.getByRole('button', { name: projectName })).toBeVisible();

  await page
    .locator('.flexlayout__tab_button_content:visible')
    .filter({ hasText: /^Media$/ })
    .first()
    .click();
  const mediaListResponse = page.waitForResponse(async (response) => {
    if (
      response.request().method() !== 'GET' ||
      !response.url().includes('/api/v1/projects/') ||
      !response.url().includes('/media') ||
      response.status() !== 200
    )
      return false;

    const payload = (await response.json()) as {
      data?: { items?: Array<{ originalFileName?: string }> };
    };
    return Boolean(payload.data?.items?.some((item) => item.originalFileName === assetName));
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: assetName,
    mimeType: 'application/json',
    buffer: Buffer.from('{"source":"AiVideoStudio media integration"}'),
  });
  await expect(page.getByText(assetName, { exact: true })).toBeVisible({ timeout: 15_000 });

  const mediaPayload = (await (await mediaListResponse).json()) as {
    data?: { items?: Array<{ id?: string; originalFileName?: string }> };
  };
  const uploadedMedia = mediaPayload.data?.items?.find(
    (item) => item.originalFileName === assetName,
  );
  expect(uploadedMedia?.id).toBeTruthy();
  await expect(page.getByLabel('Thumbnail unavailable')).toBeVisible();

  const accessToken = await page.evaluate(() =>
    window.sessionStorage.getItem('aivideostudio.accessToken'),
  );
  expect(accessToken).toBeTruthy();
  const contentHeaders = { Authorization: `Bearer ${accessToken}` };
  const originalResponse = await page.request.get(
    `http://localhost:8080/api/v1/media/${uploadedMedia!.id}/content?variant=original`,
    { headers: contentHeaders },
  );
  expect(originalResponse.status()).toBe(200);
  expect(originalResponse.headers()['content-type']).toContain('application/json');
  expect((await originalResponse.body()).toString()).toBe(
    '{"source":"AiVideoStudio media integration"}',
  );

  const thumbnailResponse = await page.request.get(
    `http://localhost:8080/api/v1/media/${uploadedMedia!.id}/content?variant=thumbnail`,
    { headers: contentHeaders },
  );
  expect(thumbnailResponse.status()).toBe(404);

  await page.getByLabel('Search media').fill(assetName);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText(assetName, { exact: true })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept(renamedAsset));
  await page.getByRole('button', { name: 'Rename' }).click();
  await expect(page.getByText(renamedAsset, { exact: true })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(renamedAsset, { exact: true })).toHaveCount(0);
});

test('persists scripts, scenes, elements, autosave, and version conflicts through the real API', async ({
  page,
}) => {
  test.setTimeout(120_000);
  test.skip(
    !process.env.E2E_USERNAME || !process.env.E2E_PASSWORD,
    'Live API credentials are not configured.',
  );
  const stamp = Date.now();
  const projectName = `Script E2E ${stamp}`;
  const scriptName = `Script ${stamp}`;
  const renamedScript = `${scriptName} renamed`;
  const firstScene = `Opening ${stamp}`;
  const renamedScene = `${firstScene} renamed`;
  const secondScene = `Ending ${stamp}`;
  const description = `Autosaved description ${stamp}`;
  const elementContent = `Persisted prompt ${stamp}`;

  await page.goto('/');
  await page.getByLabel('Username').fill(process.env.E2E_USERNAME ?? '');
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('AI Video Studio')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept(projectName));
  await page.getByTitle('New project').click();
  await expect(page.getByRole('button', { name: projectName })).toBeVisible();
  await page
    .locator('.flexlayout__tab_button_content:visible')
    .filter({ hasText: /^(Script Editor|Soạn thảo kịch bản)$/ })
    .first()
    .click();

  page.once('dialog', (dialog) => dialog.accept(scriptName));
  await page.getByRole('button', { name: 'Create script' }).click();
  await expect(page.getByLabel('Open script')).toContainText(scriptName);

  await page.getByLabel('Script description').fill(description);
  await expect(page.locator('[data-save-status="DIRTY"]')).toBeVisible();
  await expect(page.locator('[data-save-status="SAVED"]')).toBeVisible({ timeout: 15_000 });

  page.once('dialog', (dialog) => dialog.accept(firstScene));
  await page.getByRole('button', { name: 'Add scene' }).click();
  await expect(page.getByText(firstScene, { exact: false })).toBeVisible();

  await page.getByLabel('Scene title').fill(renamedScene);
  await expect(page.locator('[data-save-status="DIRTY"]')).toBeVisible();
  await expect(page.locator('[data-save-status="SAVED"]')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Add element' }).click();
  await page.getByLabel('Element content').fill(elementContent);
  await expect(page.locator('[data-save-status="DIRTY"]')).toBeVisible();
  await expect(page.locator('[data-save-status="SAVED"]')).toBeVisible({ timeout: 15_000 });

  await page.reload();
  await expect(page.getByText('AI Video Studio')).toBeVisible();
  await page.getByRole('button', { name: projectName }).click();
  await page
    .locator('.flexlayout__tab_button_content:visible')
    .filter({ hasText: /^(Script Editor|Soạn thảo kịch bản)$/ })
    .first()
    .click();
  await expect(page.getByLabel('Script description')).toHaveValue(description);
  await expect(page.getByLabel('Scene title')).toHaveValue(renamedScene);
  await expect(page.getByLabel('Element content')).toHaveValue(elementContent);

  const deleteElementButton = page.getByRole('button', { name: /Delete element/ });
  page.once('dialog', (dialog) => dialog.accept());
  await deleteElementButton.click();
  await expect(deleteElementButton).toHaveCount(0);

  page.once('dialog', (dialog) => dialog.accept(secondScene));
  await page.getByRole('button', { name: 'Add scene' }).click();
  await expect(page.getByText(secondScene, { exact: false })).toBeVisible();
  await page.getByRole('button', { name: `Move ${secondScene} up` }).click();
  await expect(page.getByRole('button', { name: `Move ${secondScene} up` })).toBeDisabled();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: `Delete scene ${renamedScene}` }).click();
  await expect(page.getByText(renamedScene, { exact: false })).toHaveCount(0);

  page.once('dialog', (dialog) => dialog.accept(renamedScript));
  await page.getByRole('button', { name: 'Rename script' }).click();
  await expect(page.getByLabel('Open script')).toContainText(renamedScript);

  const concurrentTab = await page.context().newPage();
  await concurrentTab.goto('/');
  const concurrentLogin = concurrentTab.getByLabel('Username');
  if (await concurrentLogin.isVisible()) {
    await concurrentLogin.fill(process.env.E2E_USERNAME ?? '');
    await concurrentTab.getByLabel('Password').fill(process.env.E2E_PASSWORD ?? '');
    await concurrentTab.getByRole('button', { name: 'Sign in' }).click();
  }
  await expect(concurrentTab.getByText('AI Video Studio')).toBeVisible();
  await concurrentTab.getByRole('button', { name: projectName }).click();
  if (!(await concurrentTab.getByLabel('Open script').isVisible())) {
    await concurrentTab
      .getByText(/So.*n th.*o k.*ch b.*n/, { exact: true })
      .first()
      .click();
  }
  await expect(concurrentTab.getByLabel('Open script')).toContainText(renamedScript);
  await concurrentTab.getByLabel('Script description').fill('External version update');
  await expect(concurrentTab.locator('[data-save-status="DIRTY"]')).toBeVisible();
  await expect(concurrentTab.locator('[data-save-status="SAVED"]')).toBeVisible({
    timeout: 15_000,
  });
  await concurrentTab.close();

  await page.getByLabel('Scene title').fill(`${secondScene} conflict`);
  await expect(page.getByRole('alert')).toContainText('changed elsewhere', { timeout: 15_000 });
  await expect(page.locator('[data-save-status="ERROR"]')).toBeVisible();
  await expect(page.getByLabel('Script description')).toHaveValue('External version update');
  await expect(page.getByLabel('Scene title')).toHaveValue(secondScene);

  const resolvedScene = `${secondScene} resolved`;
  await page.getByLabel('Scene title').fill(resolvedScene);
  await expect(page.locator('[data-save-status="DIRTY"]')).toBeVisible();
  await expect(page.locator('[data-save-status="SAVED"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('alert')).toHaveCount(0);

  await page.reload();
  await expect(page.getByText('AI Video Studio')).toBeVisible();
  await page.getByRole('button', { name: projectName }).click();
  if (!(await page.getByLabel('Open script').isVisible())) {
    await page
      .getByText(/So.*n th.*o k.*ch b.*n/, { exact: true })
      .first()
      .click();
  }
  await expect(page.getByLabel('Script description')).toHaveValue('External version update');
  await expect(page.getByLabel('Scene title')).toHaveValue(resolvedScene);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete script' }).click();
  await expect(page.getByLabel('Open script')).not.toContainText(renamedScript);
});
