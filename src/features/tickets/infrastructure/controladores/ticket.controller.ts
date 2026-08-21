import { Request, Response } from 'express';
import '../../../../middleware/auth'; // Importar para cargar las definiciones de tipos
import { CreateTicketForServiceUseCase } from '../../application/create-ticket-for-service.use-case';
import { GetServiceInfoUseCase } from '../../application/get-service-info.use-case';
import { CustomerInfo } from '../../domain/modelos/ticket.model';
import { JiraCredentials } from '../../domain/modelos/jira-account.model';

interface ServiceTicketRequest {
  customerInfo: CustomerInfo;
  serviceId: string;
  userId?: number;
}

export class TicketController {
  constructor(
    private readonly createTicketForService: CreateTicketForServiceUseCase,
    private readonly getServiceInfo: GetServiceInfoUseCase
  ) {}

  /** POST /api/service/create-ticket */
  createTicketForServiceHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { customerInfo, serviceId } = req.body as ServiceTicketRequest;
      const userId = req.user?.id;

      if (!customerInfo || !serviceId) {
        res.status(400).json({ success: false, error: 'customerInfo and serviceId are required' });
        return;
      }

      if (!customerInfo.name || !customerInfo.email) {
        res.status(400).json({ success: false, error: 'customerInfo.name and customerInfo.email are required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ success: false, error: 'User authentication required' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerInfo.email)) {
        res.status(400).json({ success: false, error: 'Invalid email format' });
        return;
      }

      console.log(`🎫 Creating ticket for service ${serviceId} for user ${userId}:`, {
        name: customerInfo.name,
        email: customerInfo.email,
        company: customerInfo.company || 'N/A',
        serviceId,
        userId
      });

      const ownCredentials: JiraCredentials | null =
        req.user?.email && req.user?.jiraToken
          ? { email: req.user.email, token: req.user.jiraToken, url: req.user.jiraUrl || '' }
          : null;

      const result = await this.createTicketForService.execute(userId, serviceId, customerInfo, ownCredentials);

      if (!result.ok) {
        res.status(result.status).json({ success: false, error: result.error });
        return;
      }

      console.log(`✅ Ticket created successfully for service ${serviceId}:`, result.issueKey);

      res.status(201).json({
        success: true,
        issueKey: result.issueKey,
        jiraIssue: {
          id: result.jiraIssueId,
          key: result.issueKey,
          url: `${result.jiraBaseUrl}/browse/${result.issueKey}`
        },
        service: {
          serviceId,
          serviceName: result.serviceName,
          projectKey: result.projectKey
        },
        message: `Ticket created successfully for service ${serviceId}`
      });
    } catch (error) {
      console.error('Error creating ticket for service:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /** GET /api/service/:serviceId/info */
  getServiceInfoHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const { userId } = req.query;

      if (!serviceId) {
        res.status(400).json({ success: false, error: 'serviceId is required' });
        return;
      }

      const info = await this.getServiceInfo.execute(serviceId, userId ? parseInt(userId as string) : undefined);

      if (!info) {
        res.status(404).json({ success: false, error: `Service '${serviceId}' not found` });
        return;
      }

      res.json({ success: true, data: info });
    } catch (error) {
      console.error('Error getting service info:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
}
