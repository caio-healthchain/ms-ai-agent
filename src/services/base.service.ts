import { logger } from '@/config/logger';

export class BaseService {
  protected logInfo(message: string, data?: any): void {
    logger.info(message, data);
  }

  protected logError(message: string, error?: any): void {
    logger.error(message, error);
  }
}
