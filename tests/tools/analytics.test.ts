import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAnalyticsTools } from '../../src/tools/analytics.js';
import { YandexWebmasterClient } from '../../src/client/yandex-webmaster-client.js';

// Create a mock client with stubs for all analytics methods
function createMockClient() {
  return {
    resolveHostId: vi.fn((hostId?: string) => hostId ?? 'default-host'),
    getSearchQueries: vi.fn().mockResolvedValue({ count: 1, queries: [{ query_text: 'test', indicators: {} }] }),
    getPopularQueries: vi.fn().mockResolvedValue({ count: 2, queries: [{ query_text: 'popular', indicators: {} }] }),
    getExternalLinks: vi.fn().mockResolvedValue({ count: 5, links: [{ source_url: 'https://a.com', destination_url: 'https://b.com' }] }),
    getExternalLinksHistory: vi.fn().mockResolvedValue({ history: [{ date: '2024-01-01', count: 50 }] }),
    getSQIHistory: vi.fn().mockResolvedValue({ history: [{ date: '2024-01-01', sqi: 40 }] }),
    getQueryHistory: vi.fn().mockResolvedValue({ history: [{ date: '2024-01-01', value: 10 }] }),
    queryAnalytics: vi.fn().mockResolvedValue({ text_indicator_queries: [], count: 0 }),
  } as unknown as YandexWebmasterClient;
}

describe('Analytics MCP Tools', () => {
  let client: Client;
  let mockWmClient: ReturnType<typeof createMockClient>;

  beforeAll(async () => {
    const mcpServer = new McpServer({ name: 'test', version: '1.0.0' });
    mockWmClient = createMockClient();
    registerAnalyticsTools(mcpServer, mockWmClient);

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    client = new Client({ name: 'test-client', version: '1.0.0' });

    await Promise.all([
      client.connect(clientTransport),
      mcpServer.connect(serverTransport),
    ]);
  });

  afterAll(async () => {
    await client.close();
  });

  // --- ywm_get_search_queries ---

  describe('ywm_get_search_queries', () => {
    it('returns search query analytics', async () => {
      const result = await client.callTool({
        name: 'ywm_get_search_queries',
        arguments: {
          host_id: 'h1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
          query_indicator: 'TOTAL_CLICKS',
        },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.count).toBe(1);
      expect(parsed.queries[0].query_text).toBe('test');
    });

    it('passes all params to the client', async () => {
      await client.callTool({
        name: 'ywm_get_search_queries',
        arguments: {
          host_id: 'h1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
          query_indicator: 'TOTAL_SHOWS',
          device_type_indicator: 'DESKTOP',
          offset: 10,
          limit: 50,
        },
      });

      const mock = mockWmClient.getSearchQueries as ReturnType<typeof vi.fn>;
      expect(mock).toHaveBeenCalledWith('h1', {
        date_from: '2024-01-01',
        date_to: '2024-02-01',
        query_indicator: 'TOTAL_SHOWS',
        device_type_indicator: 'DESKTOP',
        offset: 10,
        limit: 50,
      });
    });

    it('returns error on failure', async () => {
      const mock = mockWmClient.getSearchQueries as ReturnType<typeof vi.fn>;
      mock.mockRejectedValueOnce(new Error('API failure'));

      const result = await client.callTool({
        name: 'ywm_get_search_queries',
        arguments: {
          host_id: 'h1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
          query_indicator: 'TOTAL_CLICKS',
        },
      });

      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain('API failure');
    });
  });

  // --- ywm_get_popular_queries ---

  describe('ywm_get_popular_queries', () => {
    it('returns popular queries', async () => {
      const result = await client.callTool({
        name: 'ywm_get_popular_queries',
        arguments: {
          host_id: 'h1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
          query_indicator: 'TOTAL_CLICKS',
        },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.count).toBe(2);
      expect(parsed.queries[0].query_text).toBe('popular');
    });

    it('passes params to client', async () => {
      await client.callTool({
        name: 'ywm_get_popular_queries',
        arguments: {
          host_id: 'h2',
          date_from: '2024-03-01',
          date_to: '2024-04-01',
          query_indicator: 'AVG_SHOW_POSITION',
          device_type_indicator: 'MOBILE',
        },
      });

      const mock = mockWmClient.getPopularQueries as ReturnType<typeof vi.fn>;
      expect(mock).toHaveBeenCalledWith('h2', {
        date_from: '2024-03-01',
        date_to: '2024-04-01',
        query_indicator: 'AVG_SHOW_POSITION',
        device_type_indicator: 'MOBILE',
        offset: undefined,
        limit: undefined,
      });
    });
  });

  // --- ywm_get_external_links ---

  describe('ywm_get_external_links', () => {
    it('returns external links', async () => {
      const result = await client.callTool({
        name: 'ywm_get_external_links',
        arguments: { host_id: 'h1' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.count).toBe(5);
      expect(parsed.links[0].source_url).toBe('https://a.com');
    });

    it('passes pagination params', async () => {
      await client.callTool({
        name: 'ywm_get_external_links',
        arguments: { host_id: 'h1', offset: 5, limit: 20 },
      });

      expect(mockWmClient.getExternalLinks).toHaveBeenCalledWith('h1', {
        offset: 5,
        limit: 20,
      });
    });
  });

  // --- ywm_get_sqi_history ---

  describe('ywm_get_sqi_history', () => {
    it('returns SQI history', async () => {
      const result = await client.callTool({
        name: 'ywm_get_sqi_history',
        arguments: { host_id: 'h1' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.history).toHaveLength(1);
      expect(parsed.history[0].sqi).toBe(40);
    });

    it('passes date range params', async () => {
      await client.callTool({
        name: 'ywm_get_sqi_history',
        arguments: {
          host_id: 'h1',
          date_from: '2024-01-01',
          date_to: '2024-06-01',
        },
      });

      expect(mockWmClient.getSQIHistory).toHaveBeenCalledWith('h1', {
        date_from: '2024-01-01',
        date_to: '2024-06-01',
      });
    });
  });

  // --- ywm_get_external_links_history ---

  describe('ywm_get_external_links_history', () => {
    it('returns external links history', async () => {
      const result = await client.callTool({
        name: 'ywm_get_external_links_history',
        arguments: { host_id: 'h1', date_from: '2024-01-01', date_to: '2024-06-01' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.history[0].count).toBe(50);
    });

    it('passes date range params', async () => {
      await client.callTool({
        name: 'ywm_get_external_links_history',
        arguments: { host_id: 'h1', date_from: '2024-01-01', date_to: '2024-06-01' },
      });

      expect(mockWmClient.getExternalLinksHistory).toHaveBeenCalledWith('h1', {
        date_from: '2024-01-01',
        date_to: '2024-06-01',
      });
    });
  });

  // --- ywm_get_query_history ---

  describe('ywm_get_query_history', () => {
    it('returns query history', async () => {
      const result = await client.callTool({
        name: 'ywm_get_query_history',
        arguments: {
          host_id: 'h1',
          query_id: 'q1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
          query_indicator: 'TOTAL_CLICKS',
        },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.history[0].value).toBe(10);
    });

    it('passes all params to client', async () => {
      await client.callTool({
        name: 'ywm_get_query_history',
        arguments: {
          host_id: 'h1',
          query_id: 'q1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
          query_indicator: 'TOTAL_SHOWS',
          device_type_indicator: 'DESKTOP',
        },
      });

      expect(mockWmClient.getQueryHistory).toHaveBeenCalledWith('h1', 'q1', {
        date_from: '2024-01-01',
        date_to: '2024-02-01',
        query_indicator: 'TOTAL_SHOWS',
        device_type_indicator: 'DESKTOP',
      });
    });

    it('returns error on failure', async () => {
      const mock = mockWmClient.getQueryHistory as ReturnType<typeof vi.fn>;
      mock.mockRejectedValueOnce(new Error('Query not found'));

      const result = await client.callTool({
        name: 'ywm_get_query_history',
        arguments: {
          host_id: 'h1',
          query_id: 'bad',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
          query_indicator: 'TOTAL_CLICKS',
        },
      });

      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain('Query not found');
    });
  });

  // --- ywm_query_analytics ---

  describe('ywm_query_analytics', () => {
    it('returns query analytics', async () => {
      const result = await client.callTool({
        name: 'ywm_query_analytics',
        arguments: {
          host_id: 'h1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
        },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.count).toBe(0);
    });

    it('passes all params to client', async () => {
      await client.callTool({
        name: 'ywm_query_analytics',
        arguments: {
          host_id: 'h1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
          device_type_indicator: 'MOBILE',
          text_indicator: 'URL',
          region_ids: [1, 2],
          limit: 50,
          offset: 10,
        },
      });

      expect(mockWmClient.queryAnalytics).toHaveBeenCalledWith('h1', {
        date_from: '2024-01-01',
        date_to: '2024-02-01',
        device_type_indicator: 'MOBILE',
        text_indicator: 'URL',
        region_ids: [1, 2],
        filters: undefined,
        sort_by_date: undefined,
        limit: 50,
        offset: 10,
      });
    });

    it('returns error on failure', async () => {
      const mock = mockWmClient.queryAnalytics as ReturnType<typeof vi.fn>;
      mock.mockRejectedValueOnce(new Error('Analytics failed'));

      const result = await client.callTool({
        name: 'ywm_query_analytics',
        arguments: {
          host_id: 'h1',
          date_from: '2024-01-01',
          date_to: '2024-02-01',
        },
      });

      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain('Analytics failed');
    });
  });
});
