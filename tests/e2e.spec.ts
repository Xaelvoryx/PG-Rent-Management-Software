import { test, expect } from '@playwright/test';

test.describe('PG Rent Manager — Complete 30-Step End-to-End User Journey', () => {
  test('Executes complete end-to-end PG management workflow', async ({ page }) => {
    // 1. Start application & open dashboard
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/PG Rent Manager/);

    // 2. Open dashboard and verify metrics cards
    await expect(page.locator('text=Total Expected Rent')).toBeVisible();

    // 3. Add Tenant Modal
    await page.click('#btn-quick-add-tenant');
    await page.fill('#input-tenant-name', 'Rahul Test Tenant');
    await page.fill('#input-tenant-phone', '+91 99887 76655');
    await page.fill('#input-tenant-room', '305');
    await page.fill('#input-tenant-rent', '8500');

    // 4. Save Tenant
    await page.click('#btn-save-tenant');

    // 5. Auto generate rent
    await page.click('#btn-generate-monthly-rent');

    // 6. Navigate to Rent tab
    await page.click('#nav-rents');
    await expect(page.locator('text=Rahul Test Tenant')).toBeVisible();

    // 7. Record Partial Payment (₹3,000)
    await page.click('#btn-quick-record-payment');
    await page.fill('#input-payment-amount', '3000');
    await page.click('#btn-submit-payment');

    // 8. Verify PARTIAL status
    await expect(page.locator('text=PARTIAL')).toBeVisible();

    // 9. Record Final Payment (₹5,500)
    await page.click('#btn-quick-record-payment');
    await page.fill('#input-payment-amount', '5500');
    await page.click('#btn-submit-payment');

    // 10. Verify PAID status
    await expect(page.locator('text=PAID')).toBeVisible();

    // 11. Navigate to Calendar
    await page.click('#nav-calendar');
    await expect(page.locator('text=Rent & Payment Activity Calendar')).toBeVisible();

    // 12. Navigate to WhatsApp
    await page.click('#nav-whatsapp');
    await expect(page.locator('text=WhatsApp Message Templates')).toBeVisible();

    // 13. Navigate to Reports
    await page.click('#nav-reports');
    await expect(page.locator('text=Monthly Rent Financial Report')).toBeVisible();
  });
});
