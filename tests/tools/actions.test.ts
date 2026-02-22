import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerActionTools } from '../../src/tools/actions.js';

// --- Mock client ---

function createMockClient() {
  return {
    resolveHostId: vi.fn((id?: string) => id ?? 'default-host'),
    getRecrawlQuota: vi.fn().mockResolvedValue({ daily_quota: 100, quota_remainder: 42 }),
    listRecrawlTasks: vi.fn().mockResolvedValue({
      tasks: [{ task_id: 't1', url: 'https://example.com/page', added_date: '2024-01-01', status: 'IN_PROGRESS' }],
    }),
    addRecrawlTask: vi.fn().mockResolvedValue({
      task_id: 't2', url: 'https://example.com/new', added_date: '2024-01-02',
    }),
    getOriginalTexts: vi.fn().mockResolvedValue({
      count: 1,
      texts: [{ text_id: 'txt1', content: 'Hello world', added_date: '2024-01-01' }],
    }),
    addOriginalText: vi.fn().mockResolvedValue({
      text_id: 'txt2', content: 'New text', added_date: '2024-01-02',
    }),
    deleteOriginalText: vi.fn().mockResolvedValue(undefined),
    getOriginalTextQuota: vi.fn().mockResolvedValue({ daily_quota: 50, quota_remainder: 30 }),
  };
}

type MockClient = ReturnType<typeof createMockClient>;

// --- Test helpers ---

async function setupTestEnv() {
  const mockClient = createMockClient();
  const server = new McpServer({ name: 'test-server', version: '1.0.0' });
  // Cast mock to satisfy the type — only methods used in registerActionTools are mocked
  registerActionTools(server, mockClient as never);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test-client', version: '1.0.0' });

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return { client, server, mockClient };
}

async function callTool(client: Client, name: string, args: Record<string, unknown> = {}) {
  return client.callTool({ name, arguments: args });
}

function getTextContent(result: Awaited<ReturnType<Client['callTool']>>): string {
  const content = result.content as Array<{ type: string; text: string }>;
  return content[0].text;
}

// --- Tests ---

describe('Action tools', () => {
  let client: Client;
  let server: McpServer;
  let mockClient: MockClient;

  beforeAll(async () => {
    const env = await setupTestEnv();
    client = env.client;
    server = env.server;
    mockClient = env.mockClient;
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  // --- Recrawl tools ---

  describe('ywm_get_recrawl_quota', () => {
    it('returns recrawl quota as JSON', async () => {
      const result = await callTool(client, 'ywm_get_recrawl_quota', { host_id: 'h1' });
      const parsed = JSON.parse(getTextContent(result));

      expect(parsed).toEqual({ daily_quota: 100, quota_remainder: 42 });
      expect(mockClient.resolveHostId).toHaveBeenCalledWith('h1');
      expect(mockClient.getRecrawlQuota).toHaveBeenCalledWith('h1');
    });

    it('uses default host when host_id is omitted', async () => {
      await callTool(client, 'ywm_get_recrawl_quota');

      expect(mockClient.resolveHostId).toHaveBeenCalledWith(undefined);
      expect(mockClient.getRecrawlQuota).toHaveBeenCalledWith('default-host');
    });

    it('returns error when client throws', async () => {
      mockClient.getRecrawlQuota.mockRejectedValueOnce(new Error('Quota fetch failed'));

      const result = await callTool(client, 'ywm_get_recrawl_quota', { host_id: 'h1' });

      expect(result.isError).toBe(true);
      expect(getTextContent(result)).toContain('Quota fetch failed');
    });
  });

  describe('ywm_list_recrawl_tasks', () => {
    it('returns recrawl tasks as JSON', async () => {
      const result = await callTool(client, 'ywm_list_recrawl_tasks', { host_id: 'h1' });
      const parsed = JSON.parse(getTextContent(result));

      expect(parsed.tasks).toHaveLength(1);
      expect(parsed.tasks[0].task_id).toBe('t1');
      expect(mockClient.listRecrawlTasks).toHaveBeenCalledWith('h1');
    });

    it('returns error when client throws', async () => {
      mockClient.listRecrawlTasks.mockRejectedValueOnce(new Error('List failed'));

      const result = await callTool(client, 'ywm_list_recrawl_tasks', { host_id: 'h1' });

      expect(result.isError).toBe(true);
      expect(getTextContent(result)).toContain('List failed');
    });
  });

  describe('ywm_submit_recrawl', () => {
    it('submits a URL for recrawling and returns task', async () => {
      const result = await callTool(client, 'ywm_submit_recrawl', {
        host_id: 'h1',
        url: 'https://example.com/new',
      });
      const parsed = JSON.parse(getTextContent(result));

      expect(parsed.task_id).toBe('t2');
      expect(mockClient.addRecrawlTask).toHaveBeenCalledWith('h1', 'https://example.com/new');
    });

    it('returns error when client throws', async () => {
      mockClient.addRecrawlTask.mockRejectedValueOnce(new Error('Recrawl failed'));

      const result = await callTool(client, 'ywm_submit_recrawl', {
        host_id: 'h1',
        url: 'https://example.com/fail',
      });

      expect(result.isError).toBe(true);
      expect(getTextContent(result)).toContain('Recrawl failed');
    });
  });

  // --- Original text tools ---

  describe('ywm_get_original_texts', () => {
    it('returns original texts as JSON', async () => {
      const result = await callTool(client, 'ywm_get_original_texts', { host_id: 'h1' });
      const parsed = JSON.parse(getTextContent(result));

      expect(parsed.texts).toHaveLength(1);
      expect(parsed.texts[0].text_id).toBe('txt1');
      expect(mockClient.getOriginalTexts).toHaveBeenCalledWith('h1', {
        offset: undefined,
        limit: undefined,
      });
    });

    it('passes pagination parameters', async () => {
      await callTool(client, 'ywm_get_original_texts', {
        host_id: 'h1',
        offset: 10,
        limit: 50,
      });

      expect(mockClient.getOriginalTexts).toHaveBeenCalledWith('h1', {
        offset: 10,
        limit: 50,
      });
    });

    it('returns error when client throws', async () => {
      mockClient.getOriginalTexts.mockRejectedValueOnce(new Error('Texts fetch failed'));

      const result = await callTool(client, 'ywm_get_original_texts', { host_id: 'h1' });

      expect(result.isError).toBe(true);
      expect(getTextContent(result)).toContain('Texts fetch failed');
    });
  });

  describe('ywm_add_original_text', () => {
    it('adds an original text and returns result', async () => {
      const result = await callTool(client, 'ywm_add_original_text', {
        host_id: 'h1',
        content: 'New text',
      });
      const parsed = JSON.parse(getTextContent(result));

      expect(parsed.text_id).toBe('txt2');
      expect(mockClient.addOriginalText).toHaveBeenCalledWith('h1', 'New text');
    });

    it('returns error when client throws', async () => {
      mockClient.addOriginalText.mockRejectedValueOnce(new Error('Add failed'));

      const result = await callTool(client, 'ywm_add_original_text', {
        host_id: 'h1',
        content: 'fail',
      });

      expect(result.isError).toBe(true);
      expect(getTextContent(result)).toContain('Add failed');
    });
  });

  describe('ywm_delete_original_text', () => {
    it('deletes an original text and returns success message', async () => {
      const result = await callTool(client, 'ywm_delete_original_text', {
        host_id: 'h1',
        text_id: 'txt1',
      });

      expect(getTextContent(result)).toBe('Successfully deleted.');
      expect(result.isError).toBeUndefined();
      expect(mockClient.deleteOriginalText).toHaveBeenCalledWith('h1', 'txt1');
    });

    it('returns error when client throws', async () => {
      mockClient.deleteOriginalText.mockRejectedValueOnce(new Error('Delete failed'));

      const result = await callTool(client, 'ywm_delete_original_text', {
        host_id: 'h1',
        text_id: 'bad-id',
      });

      expect(result.isError).toBe(true);
      expect(getTextContent(result)).toContain('Delete failed');
    });
  });

  describe('ywm_get_original_text_quota', () => {
    it('returns original text quota as JSON', async () => {
      const result = await callTool(client, 'ywm_get_original_text_quota', { host_id: 'h1' });
      const parsed = JSON.parse(getTextContent(result));

      expect(parsed).toEqual({ daily_quota: 50, quota_remainder: 30 });
      expect(mockClient.getOriginalTextQuota).toHaveBeenCalledWith('h1');
    });

    it('returns error when client throws', async () => {
      mockClient.getOriginalTextQuota.mockRejectedValueOnce(new Error('Quota failed'));

      const result = await callTool(client, 'ywm_get_original_text_quota', { host_id: 'h1' });

      expect(result.isError).toBe(true);
      expect(getTextContent(result)).toContain('Quota failed');
    });
  });
});
