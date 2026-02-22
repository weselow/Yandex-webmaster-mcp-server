import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/server.js';

// Mock fetch so resolveDefaultHost (triggered by env) doesn't make real requests
const originalFetch = globalThis.fetch;
beforeAll(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ user_id: 1, hosts: [] }),
  });
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

describe('Server integration', () => {
  let mcpClient: Client;
  let clientTransport: InstanceType<typeof InMemoryTransport>;
  let serverTransport: InstanceType<typeof InMemoryTransport>;

  beforeAll(async () => {
    const server = await createServer('test-token');
    mcpClient = new Client({ name: 'integration-test', version: '1.0.0' });

    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      mcpClient.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  afterAll(async () => {
    await clientTransport.close();
    await serverTransport.close();
  });

  it('creates a server successfully with a token', async () => {
    const server = await createServer('another-token');
    expect(server).toBeDefined();
  });

  it('registers all 46 tools', async () => {
    const { tools } = await mcpClient.listTools();
    expect(tools).toHaveLength(46);
  });

  describe('core tools are registered', () => {
    const coreTools = [
      'ywm_get_user',
      'ywm_list_hosts',
      'ywm_get_host',
      'ywm_add_host',
      'ywm_delete_host',
      'ywm_get_host_summary',
      'ywm_get_verification',
      'ywm_verify_host',
      'ywm_get_diagnostics',
      'ywm_list_owners',
    ];

    it.each(coreTools)('registers %s', async (toolName) => {
      const { tools } = await mcpClient.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain(toolName);
    });
  });

  describe('content tools are registered', () => {
    const contentTools = [
      'ywm_list_sitemaps',
      'ywm_get_sitemap',
      'ywm_add_sitemap',
      'ywm_delete_sitemap',
      'ywm_get_indexing_history',
      'ywm_get_search_urls',
      'ywm_get_important_urls',
      'ywm_get_search_events_samples',
      'ywm_get_search_events_history',
      'ywm_get_search_urls_history',
      'ywm_get_indexing_samples',
      'ywm_get_important_urls_history',
      'ywm_get_broken_internal_links',
      'ywm_get_broken_links_history',
      'ywm_list_user_sitemaps',
      'ywm_get_user_sitemap',
    ];

    it.each(contentTools)('registers %s', async (toolName) => {
      const { tools } = await mcpClient.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain(toolName);
    });
  });

  describe('analytics tools are registered', () => {
    const analyticsTools = [
      'ywm_get_search_queries',
      'ywm_get_popular_queries',
      'ywm_get_external_links',
      'ywm_get_sqi_history',
      'ywm_get_external_links_history',
      'ywm_get_query_history',
      'ywm_query_analytics',
    ];

    it.each(analyticsTools)('registers %s', async (toolName) => {
      const { tools } = await mcpClient.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain(toolName);
    });
  });

  describe('action tools are registered', () => {
    const actionTools = [
      'ywm_get_recrawl_quota',
      'ywm_list_recrawl_tasks',
      'ywm_submit_recrawl',
      'ywm_get_original_texts',
      'ywm_add_original_text',
      'ywm_delete_original_text',
      'ywm_get_original_text_quota',
      'ywm_get_recrawl_task',
      'ywm_list_feeds',
      'ywm_start_feed_upload',
      'ywm_get_feed_upload_status',
      'ywm_batch_add_feeds',
      'ywm_batch_remove_feeds',
    ];

    it.each(actionTools)('registers %s', async (toolName) => {
      const { tools } = await mcpClient.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain(toolName);
    });
  });

  it('each tool has a description', async () => {
    const { tools } = await mcpClient.listTools();
    for (const tool of tools) {
      expect(tool.description, `${tool.name} should have a description`).toBeTruthy();
    }
  });
});
