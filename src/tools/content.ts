import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { YandexWebmasterClient } from '../client/index.js';
import { optionalHostIdSchema } from '../utils/schemas.js';

export function registerContentTools(server: McpServer, client: YandexWebmasterClient): void {
  // --- Sitemaps ---

  server.tool(
    'ywm_list_sitemaps',
    'List all sitemaps for a host',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.listSitemaps(hostId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_get_sitemap',
    'Get details of a specific sitemap',
    {
      host_id: optionalHostIdSchema,
      sitemap_id: z.string().describe('Sitemap ID'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSitemap(hostId, params.sitemap_id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_add_sitemap',
    'Add a new sitemap',
    {
      host_id: optionalHostIdSchema,
      url: z.string().describe('Sitemap URL'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.addSitemap(hostId, params.url);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_delete_sitemap',
    'Delete a sitemap',
    {
      host_id: optionalHostIdSchema,
      sitemap_id: z.string().describe('Sitemap ID to delete'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        await client.deleteSitemap(hostId, params.sitemap_id);
        return { content: [{ type: 'text', text: 'Sitemap deleted successfully' }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  // --- Indexing ---

  server.tool(
    'ywm_get_indexing_status',
    'Get current indexing status for a host',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getIndexingStatus(hostId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    'ywm_get_indexing_history',
    'Get indexing history over time for a host',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().optional().describe('Start date in YYYY-MM-DD format'),
      date_to: z.string().optional().describe('End date in YYYY-MM-DD format'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getIndexingHistory(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  // --- Search URLs ---

  server.tool(
    'ywm_get_search_urls',
    'Get URLs found in search for a host',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().optional().describe('Number of results to skip'),
      limit: z.number().optional().describe('Maximum number of results to return'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSearchUrls(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );

  // --- Important URLs ---

  server.tool(
    'ywm_get_important_urls',
    'Get important URLs with issues for a host',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().optional().describe('Number of results to skip'),
      limit: z.number().optional().describe('Maximum number of results to return'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getImportantUrls(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
