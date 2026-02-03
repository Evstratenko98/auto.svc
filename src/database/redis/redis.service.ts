import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { CustomLoggerService } from '@sravni/creditselection-utils/modules/custom-logger';

@Injectable()
export class RedisService {
  private readonly ttlForDay = 1000 * 60 * 60 * 24; // 1 сутки
  constructor(
      private readonly logger: CustomLoggerService,
      @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async set(key: string, value: unknown, ttlMilliseconds: number = this.ttlForDay) {
    try {
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.set(key, val, 'PX', ttlMilliseconds);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await this.redis.get(key);
      if (!val) {
        return null;
      }

      return this.getJsonParse(val);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  getClient() {
    return this.redis;
  }

  private getJsonParse(val: string) {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
}
