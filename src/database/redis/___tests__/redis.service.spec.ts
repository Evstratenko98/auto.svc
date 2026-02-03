import { RedisService } from '../redis.service';
import Redis from 'ioredis';

// ---- МОКИ ----
jest.mock('ioredis');

describe('WHEN "RedisService" is used', () => {
  let service: RedisService;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(() => {
    redisMock = {
      set: jest.fn(),
      get: jest.fn(),
    } as any;

    service = new RedisService(redisMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AND "set" is called', () => {
    it('MUST stringify object values before saving', async () => {
      const key = 'user:1';
      const value = { name: 'Alice', age: 30 };

      await service.set(key, value);

      expect(redisMock.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'PX',
        expect.any(Number),
      );
    });

    it('MUST store string values as-is', async () => {
      const key = 'test:string';
      const value = 'raw string';

      await service.set(key, value);

      expect(redisMock.set).toHaveBeenCalledWith(
        key,
        value,
        'PX',
        expect.any(Number),
      );
    });

    it('AND not provided MUST use default TTL (1 day)', async () => {
      const key = 'test:ttl';
      await service.set(key, 'value');

      const defaultTtl = 1000 * 60 * 60 * 24;
      expect(redisMock.set).toHaveBeenCalledWith(
        key,
        'value',
        'PX',
        defaultTtl,
      );
    });

    it('MUST allow overriding TTL', async () => {
      const key = 'test:ttl:override';
      const customTtl = 5000;

      await service.set(key, 'value', customTtl);

      expect(redisMock.set).toHaveBeenCalledWith(key, 'value', 'PX', customTtl);
    });
  });

  describe('AND "get" is called', () => {
    it('AND value is valid JSON MUST return parsed JSON', async () => {
      const key = 'user:2';
      const json = JSON.stringify({ id: 42, name: 'Bob' });

      redisMock.get.mockResolvedValueOnce(json);

      const result = await service.get<typeof json>(key);
      expect(result).toEqual({ id: 42, name: 'Bob' });
    });

    it('AND value is not valid JSON MUST return string as-is', async () => {
      const key = 'user:3';
      redisMock.get.mockResolvedValueOnce('not-json');

      const result = await service.get<string>(key);
      expect(result).toBe('not-json');
    });

    it('AND key does not exist MUST return null', async () => {
      const key = 'user:4';
      redisMock.get.mockResolvedValueOnce(null);

      const result = await service.get(key);
      expect(result).toBeNull();
    });

    it('MUST handle malformed JSON gracefully', async () => {
      const key = 'user:5';
      redisMock.get.mockResolvedValueOnce('{bad json');

      const result = await service.get(key);
      expect(result).toBe('{bad json');
    });
  });

  describe('AND "getClient" is called', () => {
    it('MUST return the internal redis client instance', () => {
      const client = service.getClient();
      expect(client).toBe(redisMock);
    });
  });
});
