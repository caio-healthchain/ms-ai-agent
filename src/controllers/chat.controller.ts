import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { ChatService } from '../services/chat.service';
import { 
  CreateChatSessionRequest,
  SendMessageRequest,
  MessageType,
  ChatSearchFilters
} from '../types/chat.types';
import { PaginationParams } from '../types/common.types';
import { errorMessage, asError } from '../utils/error-utils';

export class ChatController extends BaseController {
  private chatService: ChatService;

  constructor() {
    super();
    this.chatService = new ChatService();
  }

  /**
   * @swagger
   * /api/v1/chat/sessions:
   *   post:
   *     summary: Criar nova sessão de chat
   *     description: Cria uma nova sessão de chat para o usuário
   *     tags:
   *       - Chat
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - userName
   *               - userRole
   *             properties:
   *               userId:
   *                 type: string
   *                 description: ID do usuário
   *               userName:
   *                 type: string
   *                 description: Nome do usuário
   *               userRole:
   *                 type: string
   *                 description: Papel do usuário (MANAGER, AUDITOR, etc.)
   *               title:
   *                 type: string
   *                 description: Título da sessão (opcional)
   *               context:
   *                 type: object
   *                 description: Contexto adicional (opcional)
   *     responses:
   *       201:
   *         description: Sessão de chat criada com sucesso
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateChatSessionRequest = {
        userId: req.body.userId,
        userName: req.body.userName,
        userRole: req.body.userRole,
        title: req.body.title,
        context: req.body.context
      };

      const result = await this.chatService.createSession(request);
      res.status(201).json(result);
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'Failed to create chat session', 500);
}
  }

  /**
   * @swagger
   * /api/v1/chat/sessions/{sessionId}:
   *   get:
   *     summary: Obter sessão de chat
   *     description: Retorna uma sessão de chat específica com histórico de mensagens
   *     tags:
   *       - Chat
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID da sessão de chat
   *     responses:
   *       200:
   *         description: Sessão de chat recuperada com sucesso
   *       404:
   *         description: Sessão de chat não encontrada
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const result = await this.chatService.getSession(sessionId);
      res.json(result);
    } catch (error: unknown) {
  const message = errorMessage(error);
if (message === 'Chat session not found') {
        this.sendError(res, 'Chat session not found', 404);
} else {
        this.sendError(res, 'Failed to retrieve chat session', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/chat/sessions/{sessionId}/messages:
   *   post:
   *     summary: Enviar mensagem
   *     description: Envia uma mensagem para o assistente de IA e recebe uma resposta
   *     tags:
   *       - Chat
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID da sessão de chat
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *                 description: Conteúdo da mensagem
   *               type:
   *                 type: string
   *                 enum: [question, command, analysis_request, report_request, data_query]
   *                 description: Tipo da mensagem (opcional)
   *               context:
   *                 type: object
   *                 description: Contexto adicional (opcional)
   *     responses:
   *       200:
   *         description: Mensagem processada com sucesso
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const request: SendMessageRequest = {
        sessionId,
        content: req.body.content,
        type: req.body.type as MessageType,
        context: req.body.context
      };

      const result = await this.chatService.sendMessage(request);
      res.json(result);
    } catch (error: unknown) {
  const message = errorMessage(error);
if (message === 'Chat session not found') {
        this.sendError(res, 'Chat session not found', 404);
} else {
        this.sendError(res, 'Failed to process message', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/chat/analytics:
   *   get:
   *     summary: Obter analytics hospitalares
   *     description: Retorna dados analíticos do hospital para o dashboard gerencial
   *     tags:
   *       - Chat
   *     parameters:
   *       - in: query
   *         name: hospitalId
   *         schema:
   *           type: string
   *         description: ID do hospital (opcional)
   *       - in: query
   *         name: departmentId
   *         schema:
   *           type: string
   *         description: ID do departamento (opcional)
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, week, month, quarter, year]
   *         description: Período de análise (opcional)
   *     responses:
   *       200:
   *         description: Analytics recuperados com sucesso
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const context = {
        hospitalId: req.query.hospitalId as string,
        departmentId: req.query.departmentId as string,
        timeframe: req.query.timeframe as string
      };

      const result = await this.chatService.getHospitalAnalytics(context);
      res.json(result);
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'Failed to retrieve analytics', 500);
}
  }

  /**
   * @swagger
   * /api/v1/chat/health:
   *   get:
   *     summary: Health check do serviço de chat
   *     description: Verifica se o serviço de chat está funcionando
   *     tags:
   *       - Chat
   *     responses:
   *       200:
   *         description: Serviço funcionando normalmente
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        service: 'ms-ai-agent-chat',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
          chatSessions: true,
          hospitalAnalytics: true,
          aiProcessing: true,
          dataVisualization: true
        }
      };

      res.json({
        success: true,
        data: health,
        message: 'Chat service is healthy',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'Chat service health check failed', 500);
}
  }

  /**
   * @swagger
   * /api/v1/chat/suggestions:
   *   get:
   *     summary: Obter sugestões de perguntas
   *     description: Retorna sugestões de perguntas baseadas no contexto do usuário
   *     tags:
   *       - Chat
   *     parameters:
   *       - in: query
   *         name: userRole
   *         schema:
   *           type: string
   *         description: Papel do usuário
   *       - in: query
   *         name: context
   *         schema:
   *           type: string
   *         description: Contexto atual
   *     responses:
   *       200:
   *         description: Sugestões recuperadas com sucesso
   */
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.query.userRole as string;
      const context = req.query.context as string;

      let suggestions: string[] = [];

      if (userRole === 'MANAGER') {
        suggestions = [
          'Qual é o resumo executivo de hoje?',
          'Como está a performance financeira este mês?',
          'Quantos pacientes temos internados?',
          'Qual é a taxa de ocupação atual?',
          'Há auditorias pendentes urgentes?',
          'Como está a satisfação dos pacientes?',
          'Quais são os procedimentos mais realizados?',
          'Preciso de um relatório gerencial completo'
        ];
      } else if (userRole === 'AUDITOR') {
        suggestions = [
          'Quantas auditorias estão pendentes?',
          'Quais são as auditorias de maior prioridade?',
          'Como está o tempo médio de resolução?',
          'Há procedimentos aguardando aprovação?',
          'Qual é a taxa de aprovação este mês?'
        ];
      } else {
        suggestions = [
          'Como posso ajudá-lo hoje?',
          'Precisa de algum relatório específico?',
          'Gostaria de ver os indicadores principais?'
        ];
      }

      res.json({
        success: true,
        data: { suggestions },
        message: 'Suggestions retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'Failed to retrieve suggestions', 500);
}
  }
}