import { Locator, Page } from 'playwright';

export function getByTestId(page: Page, id: string): Locator {
  return page.locator(`[data-test-id="${id}"]`);
}
