/**
 * Public surface of the whatsapp feature. Other features must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

import { notifyFromJiraUseCase } from './infrastructure/dependency-injection';

export { whatsappRouter } from './infrastructure/dependency-injection';

export async function notifyFromJira(issueKey: string, text: string): Promise<void> {
  return notifyFromJiraUseCase.execute(issueKey, text);
}
