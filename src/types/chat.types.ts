export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface MessageMetadata {
  type?: MessageType;
  context?: ContextData;
  sources?: DataSource[];
  confidence?: number;
  processingTime?: number;
  tokens?: TokenUsage;
}

export enum MessageType {
  QUESTION = 'question',
  COMMAND = 'command',
  ANALYSIS_REQUEST = 'analysis_request',
  REPORT_REQUEST = 'report_request',
  DATA_QUERY = 'data_query'
}

export interface ContextData {
  hospitalId?: string;
  departmentId?: string;
  userId?: string;
  userRole?: string;
  timeframe?: string;
  filters?: Record<string, any>;
}

export interface DataSource {
  type: SourceType;
  name: string;
  description: string;
  lastUpdated: Date;
  recordCount?: number;
}

export enum SourceType {
  PATIENTS = 'patients',
  PROCEDURES = 'procedures',
  BILLING = 'billing',
  AUDITS = 'audits',
  HOSPITAL_SYSTEMS = 'hospital_systems',
  FINANCIAL_REPORTS = 'financial_reports',
  OPERATIONAL_METRICS = 'operational_metrics'
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  title: string;
  context: ContextData;
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

export interface CreateChatSessionRequest {
  userId: string;
  userName: string;
  userRole: string;
  title?: string;
  context?: ContextData;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  type?: MessageType;
  context?: ContextData;
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
  actions?: SuggestedAction[];
  charts?: ChartData[];
  reports?: ReportData[];
}

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  parameters?: Record<string, any>;
}

export enum ActionType {
  GENERATE_REPORT = 'generate_report',
  EXPORT_DATA = 'export_data',
  SCHEDULE_ANALYSIS = 'schedule_analysis',
  CREATE_ALERT = 'create_alert',
  VIEW_DETAILS = 'view_details'
}

export interface ChartData {
  id: string;
  title: string;
  type: ChartType;
  data: any;
  config?: Record<string, any>;
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  GAUGE = 'gauge'
}

export interface ReportData {
  id: string;
  title: string;
  summary: string;
  sections: ReportSection[];
  generatedAt: Date;
  format: ReportFormat;
}

export interface ReportSection {
  title: string;
  content: string;
  charts?: ChartData[];
  tables?: TableData[];
}

export interface TableData {
  headers: string[];
  rows: any[][];
  summary?: string;
}

export enum ReportFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  PDF = 'pdf',
  JSON = 'json'
}

export interface HospitalAnalytics {
  totalPatients: number;
  activeProcedures: number;
  pendingAudits: number;
  totalRevenue: number;
  averageStayDuration: number;
  occupancyRate: number;
  patientSatisfaction: number;
  operationalEfficiency: number;
  trends: {
    patients: TrendData;
    revenue: TrendData;
    procedures: TrendData;
    audits: TrendData;
  };
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChatSearchFilters {
  userId?: string;
  userRole?: string;
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
  search?: string;
}
