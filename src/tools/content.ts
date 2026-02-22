import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { YandexWebmasterClient } from '../client/index.js';
import { optionalHostIdSchema } from '../utils/schemas.js';
import { errorResult, jsonResult, textResult } from '../utils/tool-response.js';

export function registerContentTools(server: McpServer, client: YandexWebmasterClient): void {
  // --- Sitemaps ---

  server.tool(
    'ywm_list_sitemaps',
    'List all sitemaps',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.listSitemaps(hostId);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_get_sitemap',
    'Get sitemap details',
    {
      host_id: optionalHostIdSchema,
      sitemap_id: z.string().describe('Sitemap ID'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSitemap(hostId, params.sitemap_id);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
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
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_delete_sitemap',
    'Delete a sitemap',
    {
      host_id: optionalHostIdSchema,
      sitemap_id: z.string().describe('Sitemap ID'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        await client.deleteSitemap(hostId, params.sitemap_id);
        return textResult('Sitemap deleted successfully');
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Indexing ---

  server.tool(
    'ywm_get_indexing_history',
    'Get indexing history over time',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getIndexingHistory(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Search URLs ---

  server.tool(
    'ywm_get_search_urls',
    'Get URLs found in search',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().optional().describe('Offset'),
      limit: z.number().optional().describe('Max results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSearchUrls(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Important URLs ---

  server.tool(
    'ywm_get_important_urls',
    'Get important URLs with issues',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().optional().describe('Offset'),
      limit: z.number().optional().describe('Max results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getImportantUrls(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Search Events ---

  server.tool(
    'ywm_get_search_events_samples',
    'Get excluded pages (LOW_QUALITY, DUPLICATE, etc.)',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().optional().describe('Offset'),
      limit: z.number().optional().describe('Max results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSearchEventsSamples(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_get_search_events_history',
    'Get search events history over time',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSearchEventsHistory(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Search URLs History ---

  server.tool(
    'ywm_get_search_urls_history',
    'Get search URLs history over time',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSearchUrlsHistory(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Indexing Samples ---

  server.tool(
    'ywm_get_indexing_samples',
    'Get indexing samples with HTTP codes',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().optional().describe('Offset'),
      limit: z.number().optional().describe('Max results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getIndexingSamples(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Important URLs History ---

  server.tool(
    'ywm_get_important_urls_history',
    'Get important URLs history over time',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getImportantUrlsHistory(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Broken Internal Links ---

  server.tool(
    'ywm_get_broken_internal_links',
    'Get broken internal link samples',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().optional().describe('Offset'),
      limit: z.number().optional().describe('Max results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getBrokenInternalLinks(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_get_broken_links_history',
    'Get broken internal links history over time',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getBrokenLinksHistory(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- User-added Sitemaps ---

  server.tool(
    'ywm_list_user_sitemaps',
    'List user-added sitemaps',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.listUserSitemaps(hostId);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_get_user_sitemap',
    'Get user-added sitemap details',
    {
      host_id: optionalHostIdSchema,
      sitemap_id: z.string().describe('Sitemap ID'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getUserSitemap(hostId, params.sitemap_id);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
