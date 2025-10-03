import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { ApiResponse, PaginatedResponse } from '@/types';
import { errorMessage, asError } from '../utils/error-utils';

/**
 * @swagger
 * components:
 *   schemas:
 *     AIAgent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do aiagent
 *         name:
 *           type: string
 *           description: Nome do aiagent
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: Status do aiagent
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *       required:
 *         - id
 *         - name
 *         - status
 *     CreateAIAgentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do aiagent
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: Status inicial
 *       required:
 *         - name
 *     UpdateAIAgentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do aiagent
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: Status do aiagent
 */

export class AIAgentController extends BaseController {
  
  /**
   * @swagger
   * /api/v1/aiagents:
   *   get:
   *     summary: Listar aiagents
   *     description: Retorna uma lista paginada de aiagents
   *     tags:
   *       - AIAgents
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Itens por página
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Termo de busca
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, inactive, pending]
   *         description: Filtrar por status
   *     responses:
   *       200:
   *         description: Lista de aiagents recuperada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/PaginatedResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const status = req.query.status as string;

      // Simular dados para demonstração
      const mockData = Array.from({ length: limit }, (_, i) => ({
        id: `aiagent-${(page - 1) * limit + i + 1}`,
        name: `AIAgent ${(page - 1) * limit + i + 1}`,
        status: ['active', 'inactive', 'pending'][i % 3],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const response: ApiResponse<PaginatedResponse<any>> = {
        success: true,
        message: 'AIAgents retrieved successfully',
        data: {
          items: mockData,
          pagination: {
            page,
            limit,
            total: 100,
            totalPages: Math.ceil(100 / limit),
            hasNext: page < Math.ceil(100 / limit),
            hasPrev: page > 1,
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'Failed to retrieve aiagents', 500);
}
  }

  /**
   * @swagger
   * /api/v1/aiagents/{id}:
   *   get:
   *     summary: Obter aiagent por ID
   *     description: Retorna um aiagent específico pelo ID
   *     tags:
   *       - AIAgents
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do aiagent
   *     responses:
   *       200:
   *         description: AIAgent recuperado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AIAgent'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Simular busca por ID
      const mockData = {
        id,
        name: `AIAgent ${id}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.sendResponse(res, mockData, 'AIAgent retrieved successfully');
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'AIAgent not found', 404);
}
  }

  /**
   * @swagger
   * /api/v1/aiagents:
   *   post:
   *     summary: Criar novo aiagent
   *     description: Cria um novo aiagent
   *     tags:
   *       - AIAgents
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateAIAgentRequest'
   *     responses:
   *       201:
   *         description: AIAgent criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AIAgent'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, status } = req.body;

      // Simular criação
      const mockData = {
        id: `aiagent-${Date.now()}`,
        name,
        status: status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      res.status(201);
      this.sendResponse(res, mockData, 'AIAgent created successfully');
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'Failed to create aiagent', 500);
}
  }

  /**
   * @swagger
   * /api/v1/aiagents/{id}:
   *   put:
   *     summary: Atualizar aiagent
   *     description: Atualiza um aiagent existente
   *     tags:
   *       - AIAgents
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do aiagent
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateAIAgentRequest'
   *     responses:
   *       200:
   *         description: AIAgent atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AIAgent'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, status } = req.body;

      // Simular atualização
      const mockData = {
        id,
        name: name || `AIAgent ${id}`,
        status: status || 'active',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString(),
      };

      this.sendResponse(res, mockData, 'AIAgent updated successfully');
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'Failed to update aiagent', 500);
}
  }

  /**
   * @swagger
   * /api/v1/aiagents/{id}:
   *   delete:
   *     summary: Excluir aiagent
   *     description: Exclui um aiagent existente
   *     tags:
   *       - AIAgents
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do aiagent
   *     responses:
   *       200:
   *         description: AIAgent excluído com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Simular exclusão
      this.sendResponse(res, null, 'AIAgent deleted successfully');
    } catch (error: unknown) {
  const message = errorMessage(error);
this.sendError(res, 'Failed to delete aiagent', 500);
}
  }
}