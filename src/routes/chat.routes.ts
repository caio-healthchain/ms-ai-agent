import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { asyncHandler } from '../middleware/error-handler';

const router = Router();
const controller = new ChatController();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Operações relacionadas ao chat gerencial com IA
 */

// Rotas de sessões de chat
router.post('/sessions', asyncHandler(controller.createSession.bind(controller)));
router.get('/sessions/:sessionId', asyncHandler(controller.getSession.bind(controller)));
router.post('/sessions/:sessionId/messages', asyncHandler(controller.sendMessage.bind(controller)));

// Rotas de analytics e dados
router.get('/analytics', asyncHandler(controller.getAnalytics.bind(controller)));
router.get('/suggestions', asyncHandler(controller.getSuggestions.bind(controller)));

// Health check
router.get('/health', asyncHandler(controller.healthCheck.bind(controller)));

export default router;
