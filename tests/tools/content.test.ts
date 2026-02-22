import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerContentTools } from '../../src/tools/content.js';

function createMockClient() {
  return {
    resolveHostId: vi.fn((id?: string) => id ?? 'default-host'),
    listSitemaps: vi.fn(),
    getSitemap: vi.fn(),
    addSitemap: vi.fn(),
    deleteSitemap: vi.fn(),
    getIndexingHistory: vi.fn(),
    getIndexingSamples: vi.fn(),
    getSearchUrls: vi.fn(),
    getSearchUrlsHistory: vi.fn(),
    getSearchEventsSamples: vi.fn(),
    getSearchEventsHistory: vi.fn(),
    getImportantUrls: vi.fn(),
    getImportantUrlsHistory: vi.fn(),
    getBrokenInternalLinks: vi.fn(),
    getBrokenLinksHistory: vi.fn(),
    listUserSitemaps: vi.fn(),
    getUserSitemap: vi.fn(),
  };
}

type MockClient = ReturnType<typeof createMockClient>;

async function setupTestServer(mockClient: MockClient) {
  const server = new McpServer({ name: 'test', version: '1.0.0' });
  registerContentTools(server, mockClient as any);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test-client', version: '1.0.0' });

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return { client, server };
}

describe('Content Tools', () => {
  let mockClient: MockClient;

  beforeEach(() => {
    mockClient = createMockClient();
  });

  // --- ywm_list_sitemaps ---

  describe('ywm_list_sitemaps', () => {
    it('returns sitemaps list', async () => {
      const mockData = { sitemaps: [{ sitemap_id: 's1', sitemap_url: 'https://ex.com/sitemap.xml' }] };
      mockClient.listSitemaps.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_list_sitemaps', arguments: {} });

      expect(result.content).toHaveLength(1);
      expect((result.content as any)[0].type).toBe('text');
      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.resolveHostId).toHaveBeenCalledWith(undefined);
      expect(mockClient.listSitemaps).toHaveBeenCalledWith('default-host');
    });

    it('passes host_id parameter', async () => {
      mockClient.listSitemaps.mockResolvedValue({ sitemaps: [] });

      const { client } = await setupTestServer(mockClient);
      await client.callTool({ name: 'ywm_list_sitemaps', arguments: { host_id: 'my-host' } });

      expect(mockClient.resolveHostId).toHaveBeenCalledWith('my-host');
      expect(mockClient.listSitemaps).toHaveBeenCalledWith('my-host');
    });

    it('returns error on failure', async () => {
      mockClient.listSitemaps.mockRejectedValue(new Error('API error'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_list_sitemaps', arguments: {} });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('API error');
    });
  });

  // --- ywm_get_sitemap ---

  describe('ywm_get_sitemap', () => {
    it('returns sitemap details', async () => {
      const mockData = { sitemap_id: 's1', sitemap_url: 'https://ex.com/sitemap.xml' };
      mockClient.getSitemap.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_sitemap',
        arguments: { sitemap_id: 's1' },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getSitemap).toHaveBeenCalledWith('default-host', 's1');
    });

    it('returns error on failure', async () => {
      mockClient.getSitemap.mockRejectedValue(new Error('Not found'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_sitemap',
        arguments: { sitemap_id: 'bad' },
      });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Not found');
    });
  });

  // --- ywm_add_sitemap ---

  describe('ywm_add_sitemap', () => {
    it('adds sitemap and returns result', async () => {
      const mockData = { sitemap_id: 's2', sitemap_url: 'https://ex.com/new-sitemap.xml' };
      mockClient.addSitemap.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_add_sitemap',
        arguments: { url: 'https://ex.com/new-sitemap.xml' },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.addSitemap).toHaveBeenCalledWith('default-host', 'https://ex.com/new-sitemap.xml');
    });

    it('returns error on failure', async () => {
      mockClient.addSitemap.mockRejectedValue(new Error('Duplicate'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_add_sitemap',
        arguments: { url: 'https://ex.com/dup.xml' },
      });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Duplicate');
    });
  });

  // --- ywm_delete_sitemap ---

  describe('ywm_delete_sitemap', () => {
    it('deletes sitemap and returns success', async () => {
      mockClient.deleteSitemap.mockResolvedValue(undefined);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_delete_sitemap',
        arguments: { sitemap_id: 's1' },
      });

      expect((result.content as any)[0].text).toBe('Sitemap deleted successfully');
      expect(result.isError).toBeUndefined();
      expect(mockClient.deleteSitemap).toHaveBeenCalledWith('default-host', 's1');
    });

    it('returns error on failure', async () => {
      mockClient.deleteSitemap.mockRejectedValue(new Error('Forbidden'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_delete_sitemap',
        arguments: { sitemap_id: 's1' },
      });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Forbidden');
    });
  });

  // --- ywm_get_indexing_history ---

  describe('ywm_get_indexing_history', () => {
    it('returns indexing history with date params', async () => {
      const mockData = { history: [{ date: '2024-01-01', indexed: 50 }] };
      mockClient.getIndexingHistory.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_indexing_history',
        arguments: { date_from: '2024-01-01', date_to: '2024-02-01' },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getIndexingHistory).toHaveBeenCalledWith('default-host', {
        date_from: '2024-01-01',
        date_to: '2024-02-01',
      });
    });

    it('works without optional date params', async () => {
      mockClient.getIndexingHistory.mockResolvedValue({ history: [] });

      const { client } = await setupTestServer(mockClient);
      await client.callTool({ name: 'ywm_get_indexing_history', arguments: {} });

      expect(mockClient.getIndexingHistory).toHaveBeenCalledWith('default-host', {
        date_from: undefined,
        date_to: undefined,
      });
    });

    it('returns error on failure', async () => {
      mockClient.getIndexingHistory.mockRejectedValue(new Error('Server error'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_indexing_history', arguments: {} });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Server error');
    });
  });

  // --- ywm_get_search_urls ---

  describe('ywm_get_search_urls', () => {
    it('returns search URLs with pagination', async () => {
      const mockData = { samples: [{ url: 'https://ex.com/page1' }] };
      mockClient.getSearchUrls.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_search_urls',
        arguments: { offset: 10, limit: 50 },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getSearchUrls).toHaveBeenCalledWith('default-host', {
        offset: 10,
        limit: 50,
      });
    });

    it('works without optional pagination', async () => {
      mockClient.getSearchUrls.mockResolvedValue({ samples: [] });

      const { client } = await setupTestServer(mockClient);
      await client.callTool({ name: 'ywm_get_search_urls', arguments: {} });

      expect(mockClient.getSearchUrls).toHaveBeenCalledWith('default-host', {
        offset: undefined,
        limit: undefined,
      });
    });

    it('returns error on failure', async () => {
      mockClient.getSearchUrls.mockRejectedValue(new Error('Unauthorized'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_search_urls', arguments: {} });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Unauthorized');
    });
  });

  // --- ywm_get_important_urls ---

  describe('ywm_get_important_urls', () => {
    it('returns important URLs with pagination', async () => {
      const mockData = { urls: [{ url: 'https://ex.com/important', issues: ['slow'] }] };
      mockClient.getImportantUrls.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_important_urls',
        arguments: { offset: 0, limit: 25 },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getImportantUrls).toHaveBeenCalledWith('default-host', {
        offset: 0,
        limit: 25,
      });
    });

    it('works without optional pagination', async () => {
      mockClient.getImportantUrls.mockResolvedValue({ urls: [] });

      const { client } = await setupTestServer(mockClient);
      await client.callTool({ name: 'ywm_get_important_urls', arguments: {} });

      expect(mockClient.getImportantUrls).toHaveBeenCalledWith('default-host', {
        offset: undefined,
        limit: undefined,
      });
    });

    it('returns error on failure', async () => {
      mockClient.getImportantUrls.mockRejectedValue(new Error('Rate limited'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_important_urls', arguments: {} });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Rate limited');
    });
  });

  // --- ywm_get_search_events_samples ---

  describe('ywm_get_search_events_samples', () => {
    it('returns search event samples', async () => {
      const mockData = { count: 1, samples: [{ url: 'https://ex.com/excluded', excluded_url_status: 'DUPLICATE' }] };
      mockClient.getSearchEventsSamples.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_search_events_samples',
        arguments: { offset: 0, limit: 10 },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getSearchEventsSamples).toHaveBeenCalledWith('default-host', { offset: 0, limit: 10 });
    });

    it('returns error on failure', async () => {
      mockClient.getSearchEventsSamples.mockRejectedValue(new Error('Failed'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_search_events_samples', arguments: {} });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Failed');
    });
  });

  // --- ywm_get_search_events_history ---

  describe('ywm_get_search_events_history', () => {
    it('returns search events history', async () => {
      const mockData = { history: [{ date: '2024-01-01', count: 5 }] };
      mockClient.getSearchEventsHistory.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_search_events_history',
        arguments: { date_from: '2024-01-01', date_to: '2024-02-01' },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getSearchEventsHistory).toHaveBeenCalledWith('default-host', {
        date_from: '2024-01-01',
        date_to: '2024-02-01',
      });
    });

    it('returns error on failure', async () => {
      mockClient.getSearchEventsHistory.mockRejectedValue(new Error('Failed'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_search_events_history', arguments: {} });

      expect(result.isError).toBe(true);
    });
  });

  // --- ywm_get_search_urls_history ---

  describe('ywm_get_search_urls_history', () => {
    it('returns search URLs history', async () => {
      const mockData = { history: [{ date: '2024-01-01', count: 100 }] };
      mockClient.getSearchUrlsHistory.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_search_urls_history',
        arguments: { date_from: '2024-01-01', date_to: '2024-02-01' },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getSearchUrlsHistory).toHaveBeenCalledWith('default-host', {
        date_from: '2024-01-01',
        date_to: '2024-02-01',
      });
    });

    it('returns error on failure', async () => {
      mockClient.getSearchUrlsHistory.mockRejectedValue(new Error('Failed'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_search_urls_history', arguments: {} });

      expect(result.isError).toBe(true);
    });
  });

  // --- ywm_get_indexing_samples ---

  describe('ywm_get_indexing_samples', () => {
    it('returns indexing samples', async () => {
      const mockData = { count: 1, samples: [{ url: 'https://ex.com/page', http_code: 200 }] };
      mockClient.getIndexingSamples.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_indexing_samples',
        arguments: { offset: 0, limit: 10 },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getIndexingSamples).toHaveBeenCalledWith('default-host', { offset: 0, limit: 10 });
    });

    it('returns error on failure', async () => {
      mockClient.getIndexingSamples.mockRejectedValue(new Error('Failed'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_indexing_samples', arguments: {} });

      expect(result.isError).toBe(true);
    });
  });

  // --- ywm_get_important_urls_history ---

  describe('ywm_get_important_urls_history', () => {
    it('returns important URLs history', async () => {
      const mockData = { history: [{ date: '2024-01-01', count: 10 }] };
      mockClient.getImportantUrlsHistory.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_important_urls_history',
        arguments: { date_from: '2024-01-01', date_to: '2024-02-01' },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getImportantUrlsHistory).toHaveBeenCalledWith('default-host', {
        date_from: '2024-01-01',
        date_to: '2024-02-01',
      });
    });

    it('returns error on failure', async () => {
      mockClient.getImportantUrlsHistory.mockRejectedValue(new Error('Failed'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_important_urls_history', arguments: {} });

      expect(result.isError).toBe(true);
    });
  });

  // --- ywm_get_broken_internal_links ---

  describe('ywm_get_broken_internal_links', () => {
    it('returns broken internal links', async () => {
      const mockData = { count: 1, links: [{ source_url: 'https://ex.com/a', destination_url: 'https://ex.com/b' }] };
      mockClient.getBrokenInternalLinks.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_broken_internal_links',
        arguments: { offset: 0, limit: 10 },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getBrokenInternalLinks).toHaveBeenCalledWith('default-host', { offset: 0, limit: 10 });
    });

    it('returns error on failure', async () => {
      mockClient.getBrokenInternalLinks.mockRejectedValue(new Error('Failed'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_broken_internal_links', arguments: {} });

      expect(result.isError).toBe(true);
    });
  });

  // --- ywm_get_broken_links_history ---

  describe('ywm_get_broken_links_history', () => {
    it('returns broken links history', async () => {
      const mockData = { history: [{ date: '2024-01-01', count: 3 }] };
      mockClient.getBrokenLinksHistory.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_broken_links_history',
        arguments: { date_from: '2024-01-01', date_to: '2024-02-01' },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getBrokenLinksHistory).toHaveBeenCalledWith('default-host', {
        date_from: '2024-01-01',
        date_to: '2024-02-01',
      });
    });

    it('returns error on failure', async () => {
      mockClient.getBrokenLinksHistory.mockRejectedValue(new Error('Failed'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_get_broken_links_history', arguments: {} });

      expect(result.isError).toBe(true);
    });
  });

  // --- ywm_list_user_sitemaps ---

  describe('ywm_list_user_sitemaps', () => {
    it('returns user sitemaps list', async () => {
      const mockData = { sitemaps: [{ sitemap_id: 'us1', sitemap_url: 'https://ex.com/user-sitemap.xml' }] };
      mockClient.listUserSitemaps.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_list_user_sitemaps', arguments: {} });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.listUserSitemaps).toHaveBeenCalledWith('default-host');
    });

    it('returns error on failure', async () => {
      mockClient.listUserSitemaps.mockRejectedValue(new Error('Failed'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({ name: 'ywm_list_user_sitemaps', arguments: {} });

      expect(result.isError).toBe(true);
    });
  });

  // --- ywm_get_user_sitemap ---

  describe('ywm_get_user_sitemap', () => {
    it('returns user sitemap details', async () => {
      const mockData = { sitemap_id: 'us1', sitemap_url: 'https://ex.com/user-sitemap.xml' };
      mockClient.getUserSitemap.mockResolvedValue(mockData);

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_user_sitemap',
        arguments: { sitemap_id: 'us1' },
      });

      expect(JSON.parse((result.content as any)[0].text)).toEqual(mockData);
      expect(mockClient.getUserSitemap).toHaveBeenCalledWith('default-host', 'us1');
    });

    it('returns error on failure', async () => {
      mockClient.getUserSitemap.mockRejectedValue(new Error('Not found'));

      const { client } = await setupTestServer(mockClient);
      const result = await client.callTool({
        name: 'ywm_get_user_sitemap',
        arguments: { sitemap_id: 'bad' },
      });

      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Not found');
    });
  });
});
