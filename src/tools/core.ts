import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { YandexWebmasterClient } from '../client/index.js';
import { optionalHostIdSchema } from '../utils/schemas.js';

export function registerCoreTools(server: McpServer, client: YandexWebmasterClient): void {
  server.tool(
    'ywm_get_user',
    'Get current user info (user ID)',
    {},
    async () => {
      try {
        const result = await client.getUser();
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_list_hosts',
    'List all registered hosts (sites)',
    {},
    async () => {
      try {
        const result = await client.listHosts();
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_get_host',
    'Get host details by ID',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getHost(hostId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_add_host',
    'Add a new host (site)',
    { host_url: z.string().describe('Host URL (e.g. https://example.com)') },
    async (params) => {
      try {
        const result = await client.addHost(params.host_url);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_delete_host',
    'Delete a host (site)',
    { host_id: z.string().describe('Host ID') },
    async (params) => {
      try {
        await client.deleteHost(params.host_id);
        return { content: [{ type: 'text', text: 'Host deleted successfully' }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_get_host_summary',
    'Get host summary (SQI, pages, problems)',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getHostSummary(hostId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_get_verification',
    'Get host verification status',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getVerificationStatus(hostId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_verify_host',
    'Start host verification',
    {
      host_id: optionalHostIdSchema,
      verification_type: z.string().describe('Method (DNS, HTML_FILE, META_TAG)'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.verifyHost(hostId, params.verification_type);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_get_diagnostics',
    'Get site diagnostics and problems',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getDiagnostics(hostId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_list_owners',
    'List host owners',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.listOwners(hostId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
