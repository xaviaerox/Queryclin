import { test, expect } from '@playwright/test';

test('debe cargar la página de inicio correctamente', async ({ page }) => {
  await page.goto('http://localhost:5173/Queryclin/');
  
  // Verificar que el título principal contiene "Queryclin"
  const title = page.locator('h1');
  await expect(title).toContainText('HCE Intelligence Dashboard');
  
  // Verificar que el botón de carga está presente
  const uploadButton = page.locator('button:has-text("Seleccionar Archivos")');
  await expect(uploadButton).toBeVisible();
});
