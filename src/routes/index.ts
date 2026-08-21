import { Router } from 'express';
import { whatsappRouter } from '../features/whatsapp';
import { ticketsRouter } from '../features/tickets';
import {
  chatbotRouter,
  handleServiceChat,
  handleJiraWebhook,
  setWebSocketServer as setChatbotWebSocketServer
} from '../features/chatbot';
import { adminTicketControlRouter, userTicketControlRouter } from '../features/ticket-control';
import { organizationsRouter } from '../features/organizations';
import { permissionsRouter } from '../features/permissions';
import { serviceConfigRouter, getActiveAssistantForService } from '../features/service-config';
import { projectsRouter, testJiraConnection, testJiraConnectionMiddlewares } from '../features/projects';
import { webhookAdminRouter } from '../features/webhook-admin';
import { dashboardRouter } from '../features/dashboard';
import { healthRouter } from '../features/health';
import { corsRouter } from '../features/cors';
import { contactRouter } from '../features/contact';
import { landingRouter } from '../features/landing';
import { userServiceValidationRouter, adminServiceValidationRouter, validateProtectedToken } from '../features/service-validation';
import { adminWebhooksRouter } from '../features/admin-webhooks';
import { userWebhookRouter, userWebhooksCrudRouter } from '../features/user-webhooks';
import { chatkitSessionRouter, chatkitWidgetRouter, chatkitWebhookRouter } from '../features/chatkit';
import { authRouter } from '../features/auth';
import { userManagementRouter } from '../features/user-management';
import {
  userAuthRouter,
  userInstancesRouter,
  userLegacyServicesRouter,
  userLegacyWebhookRouter,
  userRegistrationRouter,
  userSetupRouter
} from '../features/user-legacy';
import { userServicesRouter } from '../features/user-services';
import { widgetIntegrationRouter } from '../features/widget-integration';
import { JiraService } from '../services/jira_service';
// import { EmailService } from '../services/email_service';
import { authenticateToken, authenticateProtectedToken, requireAdmin, requirePermission, redirectToLoginIfNotAuth } from '../middleware/auth';

// Initialize services
// const emailService = new EmailService();

// Initialize controllers

// Function to set WebSocket server reference
export const setWebSocketServer = (io: any) => {
  setChatbotWebSocketServer(io);
  console.log('🔌 WebSocket server reference set in chatbot controller');
};

const router = Router();

// === AUTH ROUTES (auth montado dentro del propio feature) ===
router.use('/api/auth', authRouter);

// === CHATKIT ROUTES (auth montado dentro del propio feature) ===
// IMPORTANTE: chatkitSessionRouter debe montarse ANTES que chatkitWebhookRouter para preservar
// el shadowing legacy de GET /api/chatkit/session/:id (gana el handler de sesión sobre el del widget).
router.use('/api/chatkit', chatkitSessionRouter);

// === CHATKIT WIDGET & WEBHOOK ROUTES (auth montado dentro del propio feature) ===
router.use('/api/chatkit/widget', chatkitWidgetRouter);
router.use('/api/chatkit', chatkitWebhookRouter);

// === USER MANAGEMENT ROUTES (ADMIN ONLY, auth/permiso montados dentro del propio feature) ===
router.use('/api/admin/users', userManagementRouter);

// === USER SYSTEM ROUTES (auth montado dentro del propio feature user-legacy) ===
router.use('/api/user', userAuthRouter);
router.use('/api/user/instances', userInstancesRouter);
// Configuraciones de servicios del usuario (legacy) — solo ruta raíz, no colisiona con /api/user/services/* de abajo
router.use('/api/user/services', userLegacyServicesRouter);

// === USER SERVICE MANAGEMENT ROUTES (auth montado dentro del propio feature; incluye la ruta
// pública /api/user/services/:serviceId/assistant, sin auth) ===
router.use('/api/user', userServicesRouter);

// === USER TICKETS MANAGEMENT ROUTES ===
router.use('/api/user/tickets', userTicketControlRouter);

// === USER WEBHOOKS MANAGEMENT ROUTES (auth montado dentro del propio feature) ===
router.use('/api/user/webhook', userWebhookRouter);
router.use('/api/user/webhooks', userWebhooksCrudRouter);

// === ADMIN WEBHOOKS ROUTES (auth/permiso montados dentro del propio feature) ===
router.use('/api/admin/webhooks', adminWebhooksRouter);

// === SERVICE VALIDATION ROUTES (auth montado dentro del propio feature) ===
router.use('/api/user/service-validation', userServiceValidationRouter);
router.use('/api/admin/service-validation', adminServiceValidationRouter);

// Validar token protegido (pública, sin auth, prefijo propio)
router.post('/api/service-validation/validate-token', validateProtectedToken);

// Configuración de webhook del usuario (legacy) — solo ruta raíz, no colisiona con /api/user/webhook/* de arriba
router.use('/api/user/webhook', userLegacyWebhookRouter);

// Registro de usuario (solo admin, auth/permiso montados dentro del propio feature)
router.use('/api/user/register', userRegistrationRouter);

// Configuración inicial (auth montado dentro del propio feature)
router.use('/api/user/setup', userSetupRouter);

// Página de login
router.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'public' });
});

// Página de configuración inicial
router.get('/initial-setup', redirectToLoginIfNotAuth, (req, res) => {
  res.sendFile('initial-setup.html', { root: 'public' });
});

// === HEALTH ROUTES (auth no aplica, públicas) ===
router.use('/health', healthRouter);

// === WIDGET ROUTES ===
router.get('/widget', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

router.get('/jira-widget', (req, res) => {
  res.sendFile('jira-widget.html', { root: 'public' });
});

router.get('/test-instructions', (req, res) => {
  res.sendFile('test-instructions.html', { root: 'public' });
});

router.get('/service-desk', (req, res) => {
  res.sendFile('jira-service-desk-widget.html', { root: 'public' });
});

router.get('/jira-chat-test', (req, res) => {
  res.sendFile('jira-chat-test.html', { root: 'public' });
});

router.get('/hybrid-chat', (req, res) => {
  res.sendFile('hybrid-chat-widget.html', { root: 'public' });
});

router.get('/landing-form', (req, res) => {
  res.sendFile('landing-form-example.html', { root: 'public' });
});

router.get('/webhook-monitor', (req, res) => {
  res.sendFile('webhook-monitor.html', { root: 'public' });
});

router.get('/assistant-selector', (req, res) => {
  res.sendFile('assistant-selector.html', { root: 'public' });
});

// Redirigir /ceo-dashboard a la raíz
router.get('/ceo-dashboard', redirectToLoginIfNotAuth, (req, res) => {
  res.redirect('/');
});

router.get('/jira-integrated-widget', (req, res) => {
  res.sendFile('jira-integrated-widget.html', { root: 'public' });
});

// === CONTACT ROUTES (públicas, sin auth) ===
router.use('/api/contact', contactRouter);

// === LANDING PAGE ROUTES (públicas, sin auth) ===
router.use('/api/landing', landingRouter);

// === SERVICE TICKET & JIRA ACCOUNTS ROUTES ===
router.use('/api/service', ticketsRouter);

// === WHATSAPP WEBHOOK (no auth - Meta calls this) ===
router.use('/api/whatsapp', whatsappRouter);

// === CHATBOT ROUTES ===
// (el body del webhook de Jira ya fue parseado en app.ts con middleware específico)
router.use('/api/chatbot', chatbotRouter);

// Endpoint de prueba para webhook - REDIRIGIENDO AL CHATBOT
router.post('/api/webhook/jira', (req, res) => {
  console.log('🔍 WEBHOOK RECIBIDO EN ENDPOINT DE PRUEBA - REDIRIGIENDO AL CHATBOT');
  console.log('📋 Headers:', req.headers);
  console.log('📦 Body:', req.body);

  // Redirigir al chatbot controller
  return handleJiraWebhook(req, res);
});

// Endpoint GET para verificar que el servidor está funcionando
router.get('/api/webhook/jira', (req, res) => {
  console.log('🔍 WEBHOOK GET TEST ENDPOINT HIT');
  res.json({
    success: true,
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    serverInfo: {
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    }
  });
});

// === ADMIN ROUTES (CEO Dashboard) - PROTECTED (auth montado dentro del propio feature) ===
router.use('/api/admin/dashboard', dashboardRouter);

// Gestión de configuraciones de servicios (auth/permiso montados dentro del propio feature)
router.use('/api/admin/services', serviceConfigRouter);

// === PROJECT MANAGEMENT ROUTES - PROTECTED (auth/permiso montados dentro del propio feature) ===
router.use('/api/admin/projects', projectsRouter);

// Probar conexión con Jira (prefijo propio, no comparte /api/admin/projects)
router.get('/api/admin/jira/test-connection', ...testJiraConnectionMiddlewares, testJiraConnection);

// === ORGANIZATIONS (ADMIN USER 1 ONLY, auth/permiso montados dentro del propio feature) ===
router.use('/api/admin/organizations', organizationsRouter);

// Endpoint público para obtener asistente activo de un servicio
router.get('/api/services/:serviceId/assistant', getActiveAssistantForService);

// === TICKET CONTROL ROUTES - PROTECTED (auth/permiso montados dentro del propio feature) ===
router.use('/api/admin/tickets', adminTicketControlRouter);

// Chat específico por servicio (prefijo /api/services compartido con adminController, no puede
// montarse como sub-router exclusivo del feature chatbot)
router.post('/api/services/:serviceId/chat', handleServiceChat);

// === WIDGET INTEGRATION ROUTES (auth montado dentro del propio feature) ===
router.use('/api/widget', widgetIntegrationRouter);

// === WEBHOOK-ADMIN / STATUS-BASED-DISABLE ROUTES - PROTECTED (auth/permiso montados dentro del propio feature) ===
router.use('/api/admin', webhookAdminRouter);

// === USER PERMISSIONS MANAGEMENT ROUTES - PROTECTED (auth/permiso montados dentro del propio feature) ===
router.use('/api/admin/users', permissionsRouter);

// === CORS MANAGEMENT ROUTES - PROTECTED (auth/permiso montados dentro del propio feature) ===
router.use('/api/admin/cors', corsRouter);

export default router;