import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { YandexWebmasterClient } from '../../src/client/yandex-webmaster-client.js';
import { registerCoreTools } from '../../src/tools/core.js';

function createMockClient(overrides: Partial<YandexWebmasterClient> = {}): YandexWebmasterClient {
  return {
    getUser: vi.fn().mockResolvedValue({ user_id: 12345 }),
    getUserId: vi.fn().mockResolvedValue(12345),
    listHosts: vi.fn().mockResolvedValue({
      hosts: [{
        host_id: 'https:example.com:443',
        ascii_host_url: 'https://example.com/',
        unicode_host_url: 'https://example.com/',
        verified: true,
      }],
    }),
    getHost: vi.fn().mockResolvedValue({
      host_id: 'https:example.com:443',
      ascii_host_url: 'https://example.com/',
      unicode_host_url: 'https://example.com/',
      verified: true,
    }),
    addHost: vi.fn().mockResolvedValue({
      host_id: 'https:newsite.com:443',
      ascii_host_url: 'https://newsite.com/',
      unicode_host_url: 'https://newsite.com/',
      verified: false,
    }),
    deleteHost: vi.fn().mockResolvedValue(undefined),
    getHostSummary: vi.fn().mockResolvedValue({
      host_id: 'https:example.com:443',
      sqi: 50,
      searchable_pages_count: 100,
      excluded_pages_count: 5,
      site_problems: [],
    }),
    getVerificationStatus: vi.fn().mockResolvedValue({
      verification_type: 'DNS',
      verified: true,
      verification_state: 'VERIFIED',
    }),
    verifyHost: vi.fn().mockResolvedValue({
      verification_type: 'DNS',
      verified: true,
      verification_state: 'VERIFIED',
    }),
    getDiagnostics: vi.fn().mockResolvedValue({
      problems: [{ problem_id: 'PROBLEM_1', severity: 'WARNING' }],
    }),
    resolveHostId: vi.fn().mockImplementation((id?: string) => id ?? 'https:example.com:443'),
    resolveDefaultHost: vi.fn().mockResolvedValue('https:example.com:443'),
    ...overrides,
  } as unknown as YandexWebmasterClient;
}

async function setupTestEnv(mockClient: YandexWebmasterClient) {
  const server = new McpServer({ name: 'test-server', version: '1.0.0' });
  registerCoreTools(server, mockClient);

  const client = new Client({ name: 'test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);

  return { server, client, clientTransport, serverTransport };
}

describe('Core MCP Tools', () => {
  let mcpClient: Client;
  let mockApiClient: YandexWebmasterClient;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeAll(async () => {
    mockApiClient = createMockClient();
    const env = await setupTestEnv(mockApiClient);
    mcpClient = env.client;
    clientTransport = env.clientTransport;
    serverTransport = env.serverTransport;
  });

  afterAll(async () => {
    await clientTransport.close();
    await serverTransport.close();
  });

  describe('tool registration', () => {
    it('registers all 10 core tools', async () => {
      const { tools } = await mcpClient.listTools();
      const toolNames = tools.map((t) => t.name);

      expect(toolNames).toContain('ywm_get_user');
      expect(toolNames).toContain('ywm_list_hosts');
      expect(toolNames).toContain('ywm_get_host');
      expect(toolNames).toContain('ywm_add_host');
      expect(toolNames).toContain('ywm_delete_host');
      expect(toolNames).toContain('ywm_get_host_summary');
      expect(toolNames).toContain('ywm_get_verification');
      expect(toolNames).toContain('ywm_verify_host');
      expect(toolNames).toContain('ywm_get_diagnostics');
      expect(toolNames).toContain('ywm_list_owners');
    });
  });

  describe('ywm_get_user', () => {
    it('returns user info', async () => {
      const result = await mcpClient.callTool({ name: 'ywm_get_user', arguments: {} });

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);

      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.user_id).toBe(12345);
      expect(mockApiClient.getUser).toHaveBeenCalled();
    });
  });

  describe('ywm_list_hosts', () => {
    it('returns hosts list', async () => {
      const result = await mcpClient.callTool({ name: 'ywm_list_hosts', arguments: {} });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.hosts).toHaveLength(1);
      expect(parsed.hosts[0].host_id).toBe('https:example.com:443');
      expect(mockApiClient.listHosts).toHaveBeenCalled();
    });
  });

  describe('ywm_get_host', () => {
    it('returns host details with explicit host_id', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_get_host',
        arguments: { host_id: 'https:mysite.com:443' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.host_id).toBe('https:example.com:443');
      expect(mockApiClient.resolveHostId).toHaveBeenCalledWith('https:mysite.com:443');
      expect(mockApiClient.getHost).toHaveBeenCalledWith('https:mysite.com:443');
    });

    it('uses default host when no host_id provided', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_get_host',
        arguments: {},
      });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.resolveHostId).toHaveBeenCalledWith(undefined);
    });
  });

  describe('ywm_add_host', () => {
    it('adds a host and returns the result', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_add_host',
        arguments: { host_url: 'https://newsite.com' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.host_id).toBe('https:newsite.com:443');
      expect(mockApiClient.addHost).toHaveBeenCalledWith('https://newsite.com');
    });
  });

  describe('ywm_delete_host', () => {
    it('deletes a host and returns success message', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_delete_host',
        arguments: { host_id: 'https:example.com:443' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toBe('Host deleted successfully');
      expect(mockApiClient.deleteHost).toHaveBeenCalledWith('https:example.com:443');
    });
  });

  describe('ywm_get_host_summary', () => {
    it('returns host summary', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_get_host_summary',
        arguments: { host_id: 'https:example.com:443' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.sqi).toBe(50);
      expect(parsed.searchable_pages_count).toBe(100);
      expect(mockApiClient.getHostSummary).toHaveBeenCalled();
    });
  });

  describe('ywm_get_verification', () => {
    it('returns verification status', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_get_verification',
        arguments: { host_id: 'https:example.com:443' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.verified).toBe(true);
      expect(parsed.verification_state).toBe('VERIFIED');
      expect(mockApiClient.getVerificationStatus).toHaveBeenCalled();
    });
  });

  describe('ywm_verify_host', () => {
    it('starts verification and returns result', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_verify_host',
        arguments: { host_id: 'https:example.com:443', verification_type: 'DNS' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.verification_type).toBe('DNS');
      expect(mockApiClient.verifyHost).toHaveBeenCalledWith('https:example.com:443', 'DNS');
    });
  });

  describe('ywm_get_diagnostics', () => {
    it('returns diagnostics info', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_get_diagnostics',
        arguments: { host_id: 'https:example.com:443' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.problems).toHaveLength(1);
      expect(parsed.problems[0].problem_id).toBe('PROBLEM_1');
      expect(mockApiClient.getDiagnostics).toHaveBeenCalled();
    });
  });

  describe('ywm_list_owners', () => {
    it('returns owner verification info', async () => {
      const result = await mcpClient.callTool({
        name: 'ywm_list_owners',
        arguments: { host_id: 'https:example.com:443' },
      });

      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const parsed = JSON.parse(text);
      expect(parsed.verified).toBe(true);
      expect(mockApiClient.getVerificationStatus).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns isError: true when client method throws', async () => {
      const failingClient = createMockClient({
        getUser: vi.fn().mockRejectedValue(new Error('API token expired')),
      });
      const env = await setupTestEnv(failingClient);

      try {
        const result = await env.client.callTool({ name: 'ywm_get_user', arguments: {} });

        expect(result.isError).toBe(true);
        const text = (result.content as Array<{ type: string; text: string }>)[0].text;
        expect(text).toBe('Error: API token expired');
      } finally {
        await env.clientTransport.close();
        await env.serverTransport.close();
      }
    });

    it('handles non-Error throws gracefully', async () => {
      const failingClient = createMockClient({
        listHosts: vi.fn().mockRejectedValue('string error'),
      });
      const env = await setupTestEnv(failingClient);

      try {
        const result = await env.client.callTool({ name: 'ywm_list_hosts', arguments: {} });

        expect(result.isError).toBe(true);
        const text = (result.content as Array<{ type: string; text: string }>)[0].text;
        expect(text).toBe('Error: string error');
      } finally {
        await env.clientTransport.close();
        await env.serverTransport.close();
      }
    });

    it('returns isError when resolveHostId throws', async () => {
      const failingClient = createMockClient({
        resolveHostId: vi.fn().mockImplementation(() => {
          throw new Error('No host ID provided and no default host configured.');
        }),
      });
      const env = await setupTestEnv(failingClient);

      try {
        const result = await env.client.callTool({ name: 'ywm_get_host', arguments: {} });

        expect(result.isError).toBe(true);
        const text = (result.content as Array<{ type: string; text: string }>)[0].text;
        expect(text).toContain('No host ID provided');
      } finally {
        await env.clientTransport.close();
        await env.serverTransport.close();
      }
    });
  });
});
