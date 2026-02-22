import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { YandexWebmasterClient } from '../client/index.js';
import { optionalHostIdSchema } from '../utils/schemas.js';

export function registerCoreTools(server: McpServer, client: YandexWebmasterClient): void {
  server.tool(
    'ywm_get_user',
    'Get current Yandex Webmaster user info (user ID)',
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
    'List all hosts (sites) registered in the Yandex Webmaster account',
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
    'Get details of a specific host (site) by its ID',
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
    'Add a new host (site) to the Yandex Webmaster account',
    { host_url: z.string().describe('URL of the host to add, e.g. https://example.com') },
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
    'Delete a host (site) from the Yandex Webmaster account',
    { host_id: z.string().describe('Host ID to delete') },
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
    'Get summary statistics for a host including SQI, page counts, and site problems',
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
    'Get the verification status of a host',
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
    'Start the verification process for a host using the specified method',
    {
      host_id: optionalHostIdSchema,
      verification_type: z.string().describe('Verification method (e.g. DNS, HTML_FILE, META_TAG)'),
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
    'Get site diagnostics and detected problems for a host',
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
    'List host owners and their verification details',
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
}
