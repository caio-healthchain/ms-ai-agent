import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { 
  ChatSession,
  ChatMessage,
  ChatResponse,
  CreateChatSessionRequest,
  SendMessageRequest,
  MessageRole,
  MessageType,
  HospitalAnalytics,
  TrendData,
  ChartData,
  ChartType,
  SuggestedAction,
  ActionType,
  DataSource,
  SourceType
} from '../types/chat.types';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

const prisma = new PrismaClient();

export class ChatService {

  async createSession(request: CreateChatSessionRequest): Promise<ApiResponse<ChatSession>> {
    try {
      const sessionId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const session: ChatSession = {
        id: sessionId,
        userId: request.userId,
        userName: request.userName,
        userRole: request.userRole,
        title: request.title || 'Nova Conversa',
        context: request.context || {},
        messages: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivity: new Date()
      };

      // Adicionar mensagem de boas-vindas
      const welcomeMessage = await this.generateWelcomeMessage(session);
      session.messages.push(welcomeMessage);

      logger.info('Chat session created:', { sessionId, userId: request.userId });

      return {
        success: true,
        data: session,
        message: 'Chat session created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to create chat session:', error);
      throw error;
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<ChatResponse>> {
    try {
      // Simular busca da sessão (em produção seria do banco)
      const session = await this.getSessionById(request.sessionId);
      
      // Criar mensagem do usuário
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        sessionId: request.sessionId,
        role: MessageRole.USER,
        content: request.content,
        timestamp: new Date(),
        metadata: {
          type: request.type || MessageType.QUESTION,
          context: request.context
        }
      };

      // Processar mensagem e gerar resposta
      const assistantResponse = await this.processMessage(userMessage, session);

      // Criar resposta do assistente
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sessionId: request.sessionId,
        role: MessageRole.ASSISTANT,
        content: assistantResponse.content,
        timestamp: new Date(),
        metadata: {
          type: MessageType.QUESTION,
          sources: assistantResponse.sources,
          confidence: assistantResponse.confidence,
          processingTime: assistantResponse.processingTime,
          tokens: assistantResponse.tokens
        }
      };

      const response: ChatResponse = {
        message: assistantMessage,
        suggestions: assistantResponse.suggestions,
        actions: assistantResponse.actions,
        charts: assistantResponse.charts,
        reports: assistantResponse.reports
      };

      logger.info('Message processed:', { 
        sessionId: request.sessionId, 
        messageLength: request.content.length,
        processingTime: assistantResponse.processingTime 
      });

      return {
        success: true,
        data: response,
        message: 'Message processed successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to process message:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<ApiResponse<ChatSession>> {
    try {
      const session = await this.getSessionById(sessionId);
      
      return {
        success: true,
        data: session,
        message: 'Chat session retrieved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get chat session:', error);
      throw error;
    }
  }

  async getHospitalAnalytics(context?: any): Promise<ApiResponse<HospitalAnalytics>> {
    try {
      // Buscar dados reais do banco
      const [patients, procedures, audits] = await Promise.all([
        prisma.patient.count(),
        prisma.procedure.count({ where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } } }),
        prisma.auditLog.count({ where: { entityId: 'AUDIT_ITEM' } })
      ]);

      // Simular dados analíticos (em produção seria calculado dos dados reais)
      const analytics: HospitalAnalytics = {
        totalPatients: patients,
        activeProcedures: procedures,
        pendingAudits: Math.floor(audits * 0.3), // 30% pendentes
        totalRevenue: 2450000, // R$ 2.45M
        averageStayDuration: 4.2, // dias
        occupancyRate: 0.78, // 78%
        patientSatisfaction: 4.3, // 4.3/5
        operationalEfficiency: 0.85, // 85%
        trends: {
          patients: { current: patients, previous: patients - 15, change: 15, changePercent: 8.2, trend: 'up' },
          revenue: { current: 2450000, previous: 2280000, change: 170000, changePercent: 7.5, trend: 'up' },
          procedures: { current: procedures, previous: procedures - 8, change: 8, changePercent: 12.1, trend: 'up' },
          audits: { current: Math.floor(audits * 0.3), previous: Math.floor(audits * 0.35), change: -Math.floor(audits * 0.05), changePercent: -14.3, trend: 'down' }
        }
      };

      return {
        success: true,
        data: analytics,
        message: 'Hospital analytics retrieved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get hospital analytics:', error);
      throw error;
    }
  }

  private async getSessionById(sessionId: string): Promise<ChatSession> {
    // Simular busca da sessão (em produção seria do banco)
    return {
      id: sessionId,
      userId: 'user-1',
      userName: 'Gestor Principal',
      userRole: 'MANAGER',
      title: 'Análise Gerencial',
      context: {},
      messages: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date()
    };
  }

  private async generateWelcomeMessage(session: ChatSession): Promise<ChatMessage> {
    const welcomeContent = `Olá, ${session.userName}! 👋

Sou seu assistente de gestão hospitalar. Posso ajudá-lo com:

📊 **Análises e Relatórios**
- Métricas operacionais e financeiras
- Análise de tendências e performance
- Relatórios personalizados

🏥 **Gestão Hospitalar**
- Status de pacientes e procedimentos
- Análise de ocupação e recursos
- Indicadores de qualidade

💰 **Análise Financeira**
- Receitas e custos
- Análise de rentabilidade
- Projeções e orçamentos

🔍 **Auditoria e Compliance**
- Status de auditorias pendentes
- Indicadores de conformidade
- Análise de riscos

Como posso ajudá-lo hoje?`;

    return {
      id: `msg-${Date.now()}-welcome`,
      sessionId: session.id,
      role: MessageRole.ASSISTANT,
      content: welcomeContent,
      timestamp: new Date(),
      metadata: {
        type: MessageType.QUESTION,
        sources: [
          {
            type: SourceType.HOSPITAL_SYSTEMS,
            name: 'Sistema HealthChain',
            description: 'Dados em tempo real do sistema hospitalar',
            lastUpdated: new Date()
          }
        ]
      }
    };
  }

  private async processMessage(message: ChatMessage, session: ChatSession): Promise<any> {
    const startTime = Date.now();
    const content = message.content.toLowerCase();

    let responseContent = '';
    let charts: ChartData[] = [];
    let suggestions: string[] = [];
    let actions: SuggestedAction[] = [];

    // Análise de intenção baseada em palavras-chave
    if (content.includes('paciente') || content.includes('internação')) {
      responseContent = await this.generatePatientsAnalysis();
      charts = await this.generatePatientsCharts();
      suggestions = [
        'Mostrar detalhes de ocupação por setor',
        'Analisar tempo médio de internação',
        'Verificar satisfação dos pacientes'
      ];
    } else if (content.includes('procedimento') || content.includes('cirurgia')) {
      responseContent = await this.generateProceduresAnalysis();
      charts = await this.generateProceduresCharts();
      suggestions = [
        'Analisar procedimentos por complexidade',
        'Verificar taxa de sucesso cirúrgico',
        'Mostrar agenda de cirurgias'
      ];
    } else if (content.includes('financeiro') || content.includes('receita') || content.includes('custo')) {
      responseContent = await this.generateFinancialAnalysis();
      charts = await this.generateFinancialCharts();
      suggestions = [
        'Detalhar receitas por departamento',
        'Analisar custos operacionais',
        'Projeção de receitas'
      ];
    } else if (content.includes('auditoria') || content.includes('pendência')) {
      responseContent = await this.generateAuditAnalysis();
      charts = await this.generateAuditCharts();
      suggestions = [
        'Listar auditorias urgentes',
        'Analisar tempo de resolução',
        'Verificar conformidade'
      ];
    } else {
      responseContent = await this.generateGeneralAnalysis();
      charts = await this.generateDashboardCharts();
      suggestions = [
        'Mostrar resumo executivo',
        'Analisar indicadores principais',
        'Gerar relatório gerencial'
      ];
    }

    // Adicionar ações sugeridas
    actions = [
      {
        id: 'generate-report',
        title: 'Gerar Relatório',
        description: 'Criar relatório detalhado sobre este tópico',
        type: ActionType.GENERATE_REPORT
      },
      {
        id: 'export-data',
        title: 'Exportar Dados',
        description: 'Exportar dados em formato Excel ou PDF',
        type: ActionType.EXPORT_DATA
      }
    ];

    const processingTime = Date.now() - startTime;

    return {
      content: responseContent,
      sources: await this.getDataSources(),
      confidence: 0.92,
      processingTime,
      tokens: { prompt: 150, completion: 300, total: 450 },
      suggestions,
      actions,
      charts
    };
  }

  private async generatePatientsAnalysis(): Promise<string> {
    const analytics = await this.getHospitalAnalytics();
    const data = analytics.data!;

    return `📊 **Análise de Pacientes**

**Situação Atual:**
- Total de pacientes: **${data.totalPatients}**
- Taxa de ocupação: **${(data.occupancyRate * 100).toFixed(1)}%**
- Tempo médio de internação: **${data.averageStayDuration} dias**
- Satisfação dos pacientes: **${data.patientSatisfaction}/5**

**Tendências:**
- Pacientes: ${data.trends.patients.trend === 'up' ? '📈' : '📉'} **${data.trends.patients.changePercent > 0 ? '+' : ''}${data.trends.patients.changePercent.toFixed(1)}%** vs período anterior
- Novos pacientes este mês: **${data.trends.patients.change}**

**Insights:**
- A ocupação está em nível ótimo (78%), permitindo flexibilidade para emergências
- O tempo médio de internação está dentro do esperado para o perfil de casos
- A satisfação dos pacientes está acima da média nacional (4.0)`;
  }

  private async generateProceduresAnalysis(): Promise<string> {
    const analytics = await this.getHospitalAnalytics();
    const data = analytics.data!;

    return `⚕️ **Análise de Procedimentos**

**Situação Atual:**
- Procedimentos ativos: **${data.activeProcedures}**
- Eficiência operacional: **${(data.operationalEfficiency * 100).toFixed(1)}%**

**Tendências:**
- Procedimentos: ${data.trends.procedures.trend === 'up' ? '📈' : '📉'} **${data.trends.procedures.changePercent > 0 ? '+' : ''}${data.trends.procedures.changePercent.toFixed(1)}%** vs período anterior
- Novos procedimentos: **${data.trends.procedures.change}**

**Insights:**
- Aumento significativo na demanda por procedimentos (+12.1%)
- Alta eficiência operacional (85%) indica boa gestão de recursos
- Recomenda-se monitorar capacidade para atender crescimento da demanda`;
  }

  private async generateFinancialAnalysis(): Promise<string> {
    const analytics = await this.getHospitalAnalytics();
    const data = analytics.data!;

    return `💰 **Análise Financeira**

**Situação Atual:**
- Receita total: **R$ ${(data.totalRevenue / 1000000).toFixed(2)}M**
- Crescimento: **${data.trends.revenue.changePercent > 0 ? '+' : ''}${data.trends.revenue.changePercent.toFixed(1)}%**

**Tendências:**
- Receita: ${data.trends.revenue.trend === 'up' ? '📈' : '📉'} **R$ ${(data.trends.revenue.change / 1000).toFixed(0)}K** vs período anterior
- Receita média por paciente: **R$ ${(data.totalRevenue / data.totalPatients).toFixed(0)}**

**Insights:**
- Crescimento sólido de receita (+7.5%) indica boa performance
- Receita por paciente está alinhada com benchmarks do setor
- Oportunidade de otimização em procedimentos de maior valor agregado`;
  }

  private async generateAuditAnalysis(): Promise<string> {
    const analytics = await this.getHospitalAnalytics();
    const data = analytics.data!;

    return `🔍 **Análise de Auditoria**

**Situação Atual:**
- Auditorias pendentes: **${data.pendingAudits}**
- Tendência: ${data.trends.audits.trend === 'down' ? '✅' : '⚠️'} **${data.trends.audits.changePercent.toFixed(1)}%**

**Performance:**
- Redução de pendências: **${Math.abs(data.trends.audits.change)}** itens resolvidos
- Melhoria no processo: **${Math.abs(data.trends.audits.changePercent).toFixed(1)}%**

**Insights:**
- Excelente progresso na redução de pendências (-14.3%)
- Processo de auditoria está mais eficiente
- Manter foco em auditorias de alto valor para maximizar impacto`;
  }

  private async generateGeneralAnalysis(): Promise<string> {
    const analytics = await this.getHospitalAnalytics();
    const data = analytics.data!;

    return `🏥 **Resumo Executivo - HealthChain**

**Indicadores Principais:**
- 👥 Pacientes: **${data.totalPatients}** (${data.trends.patients.changePercent > 0 ? '+' : ''}${data.trends.patients.changePercent.toFixed(1)}%)
- ⚕️ Procedimentos ativos: **${data.activeProcedures}** (${data.trends.procedures.changePercent > 0 ? '+' : ''}${data.trends.procedures.changePercent.toFixed(1)}%)
- 💰 Receita: **R$ ${(data.totalRevenue / 1000000).toFixed(2)}M** (${data.trends.revenue.changePercent > 0 ? '+' : ''}${data.trends.revenue.changePercent.toFixed(1)}%)
- 🔍 Auditorias pendentes: **${data.pendingAudits}** (${data.trends.audits.changePercent.toFixed(1)}%)

**Performance Geral:**
- 📊 Taxa de ocupação: **${(data.occupancyRate * 100).toFixed(1)}%**
- ⭐ Satisfação: **${data.patientSatisfaction}/5**
- 🎯 Eficiência: **${(data.operationalEfficiency * 100).toFixed(1)}%**

**Status:** 🟢 **Operação Normal** - Todos os indicadores dentro dos parâmetros esperados.`;
  }

  private async generatePatientsCharts(): Promise<ChartData[]> {
    return [
      {
        id: 'patients-trend',
        title: 'Tendência de Pacientes',
        type: ChartType.LINE,
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Pacientes',
            data: [180, 195, 210, 185, 220, 235],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }]
        }
      },
      {
        id: 'occupancy-rate',
        title: 'Taxa de Ocupação',
        type: ChartType.GAUGE,
        data: {
          value: 78,
          max: 100,
          color: '#10B981'
        }
      }
    ];
  }

  private async generateProceduresCharts(): Promise<ChartData[]> {
    return [
      {
        id: 'procedures-by-type',
        title: 'Procedimentos por Tipo',
        type: ChartType.PIE,
        data: {
          labels: ['Porte 1', 'Porte 2', 'Porte 3', 'Porte 4', 'Especial'],
          datasets: [{
            data: [45, 30, 15, 8, 2],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
          }]
        }
      }
    ];
  }

  private async generateFinancialCharts(): Promise<ChartData[]> {
    return [
      {
        id: 'revenue-trend',
        title: 'Evolução da Receita',
        type: ChartType.BAR,
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Receita (R$ mil)',
            data: [380, 420, 450, 390, 480, 520],
            backgroundColor: '#10B981'
          }]
        }
      }
    ];
  }

  private async generateAuditCharts(): Promise<ChartData[]> {
    return [
      {
        id: 'audit-status',
        title: 'Status das Auditorias',
        type: ChartType.PIE,
        data: {
          labels: ['Aprovadas', 'Pendentes', 'Rejeitadas'],
          datasets: [{
            data: [65, 25, 10],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
          }]
        }
      }
    ];
  }

  private async generateDashboardCharts(): Promise<ChartData[]> {
    return [
      {
        id: 'kpi-overview',
        title: 'Indicadores Principais',
        type: ChartType.BAR,
        data: {
          labels: ['Pacientes', 'Procedimentos', 'Receita (k)', 'Satisfação'],
          datasets: [{
            label: 'Valores',
            data: [235, 45, 2450, 4.3],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
          }]
        }
      }
    ];
  }

  private async getDataSources(): Promise<DataSource[]> {
    return [
      {
        type: SourceType.PATIENTS,
        name: 'Base de Pacientes',
        description: 'Dados de pacientes internados e ambulatoriais',
        lastUpdated: new Date()
      },
      {
        type: SourceType.PROCEDURES,
        name: 'Sistema de Procedimentos',
        description: 'Registro de procedimentos e cirurgias',
        lastUpdated: new Date()
      },
      {
        type: SourceType.BILLING,
        name: 'Sistema de Faturamento',
        description: 'Dados financeiros e de cobrança',
        lastUpdated: new Date()
      },
      {
        type: SourceType.AUDITS,
        name: 'Sistema de Auditoria',
        description: 'Logs e resultados de auditorias',
        lastUpdated: new Date()
      }
    ];
  }
}
