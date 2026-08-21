import { Request, Response } from 'express';
import { SubmitContactFormUseCase } from '../../application/submit-contact-form.use-case';
import { TestJiraConnectionUseCase } from '../../application/test-jira-connection.use-case';

export class ContactController {
  constructor(
    private readonly submitContactFormUseCase: SubmitContactFormUseCase,
    private readonly testJiraConnectionUseCase: TestJiraConnectionUseCase
  ) {}

  async submitContactForm(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.submitContactFormUseCase.execute(req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'jira_error') {
        // Fallback por email deshabilitado (comentado en el original) — se preserva el comportamiento.
        res.status(500).json({
          success: false,
          error: 'Could not create ticket in Jira. Email fallback is disabled for testing.'
        });
        return;
      }

      res.json({ success: true, jiraIssue: result.jiraIssue });
    } catch (error) {
      console.error('Error processing contact form:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async testJiraConnection(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.testJiraConnectionUseCase.execute();
      res.json({ success: true, project, message: 'Successful connection to Jira' });
    } catch (error) {
      console.error('Error connecting to Jira:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, error: `Jira error: ${errorMessage}` });
    }
  }
}
