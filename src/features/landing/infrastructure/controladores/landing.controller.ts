import { Request, Response } from 'express';
import { CreateTicketFromLandingUseCase } from '../../application/create-ticket-from-landing.use-case';
import { ValidateLandingFormUseCase } from '../../application/validate-landing-form.use-case';
import { GetLandingFormFieldsUseCase } from '../../application/get-landing-form-fields.use-case';

export class LandingController {
  constructor(
    private readonly createTicketFromLandingUseCase: CreateTicketFromLandingUseCase,
    private readonly validateLandingFormUseCase: ValidateLandingFormUseCase,
    private readonly getLandingFormFieldsUseCase: GetLandingFormFieldsUseCase
  ) {}

  async createTicketFromLanding(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createTicketFromLandingUseCase.execute(req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'error') {
        res.status(500).json({ success: false, error: result.message });
        return;
      }

      res.status(201).json({ success: true, jiraIssue: result.jiraIssue });
    } catch (error) {
      console.error('Error creating ticket from landing page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ticket';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  async validateLandingForm(req: Request, res: Response): Promise<void> {
    try {
      const errors = this.validateLandingFormUseCase.execute(req.body);

      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      res.json({ success: true, message: 'Form validation passed' });
    } catch (error) {
      console.error('Error validating landing form:', error);
      res.status(500).json({ success: false, error: 'Validation failed' });
    }
  }

  async getLandingFormFields(req: Request, res: Response): Promise<void> {
    try {
      const formFields = this.getLandingFormFieldsUseCase.execute();
      res.json({ success: true, formFields });
    } catch (error) {
      console.error('Error getting form fields:', error);
      res.status(500).json({ success: false, error: 'Failed to get form fields' });
    }
  }
}
