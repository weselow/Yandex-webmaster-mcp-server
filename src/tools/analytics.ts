import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { YandexWebmasterClient } from '../client/yandex-webmaster-client.js';
import {
  optionalHostIdSchema,
  queryIndicatorSchema,
  deviceTypeSchema,
} from '../utils/schemas.js';

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
}

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerAnalyticsTools(
  server: McpServer,
  client: YandexWebmasterClient,
): void {
  // --- Search Queries ---

  server.tool(
    'ywm_get_search_queries',
    'Get search query analytics history',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().describe('Start date in YYYY-MM-DD format'),
      date_to: z.string().describe('End date in YYYY-MM-DD format'),
      query_indicator: queryIndicatorSchema,
      device_type_indicator: deviceTypeSchema,
      offset: z.number().int().min(0).optional().describe('Number of results to skip'),
      limit: z.number().int().min(1).max(500).optional().describe('Maximum number of results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSearchQueries(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
          query_indicator: params.query_indicator,
          device_type_indicator: params.device_type_indicator,
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
    'ywm_get_popular_queries',
    'Get popular search queries',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().describe('Start date in YYYY-MM-DD format'),
      date_to: z.string().describe('End date in YYYY-MM-DD format'),
      query_indicator: queryIndicatorSchema,
      device_type_indicator: deviceTypeSchema,
      offset: z.number().int().min(0).optional().describe('Number of results to skip'),
      limit: z.number().int().min(1).max(500).optional().describe('Maximum number of results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getPopularQueries(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
          query_indicator: params.query_indicator,
          device_type_indicator: params.device_type_indicator,
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- External Links ---

  server.tool(
    'ywm_get_external_links',
    'Get external link samples',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().int().min(0).optional().describe('Number of results to skip'),
      limit: z.number().int().min(1).max(500).optional().describe('Maximum number of results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getExternalLinks(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- SQI ---

  server.tool(
    'ywm_get_sqi_history',
    'Get SQI history over time',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().optional().describe('Start date in YYYY-MM-DD format'),
      date_to: z.string().optional().describe('End date in YYYY-MM-DD format'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getSQIHistory(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- External Links History ---

  server.tool(
    'ywm_get_external_links_history',
    'Get external links history over time',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().optional().describe('Start date in YYYY-MM-DD format'),
      date_to: z.string().optional().describe('End date in YYYY-MM-DD format'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getExternalLinksHistory(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Query History ---

  server.tool(
    'ywm_get_query_history',
    'Get search query history for a specific query',
    {
      host_id: optionalHostIdSchema,
      query_id: z.string().describe('Query ID to get history for'),
      date_from: z.string().describe('Start date in YYYY-MM-DD format'),
      date_to: z.string().describe('End date in YYYY-MM-DD format'),
      query_indicator: queryIndicatorSchema,
      device_type_indicator: deviceTypeSchema,
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getQueryHistory(hostId, params.query_id, {
          date_from: params.date_from,
          date_to: params.date_to,
          query_indicator: params.query_indicator,
          device_type_indicator: params.device_type_indicator,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Query Analytics ---

  server.tool(
    'ywm_query_analytics',
    'Run query analytics with filters (POST endpoint that reads analytics data)',
    {
      host_id: optionalHostIdSchema,
      date_from: z.string().describe('Start date in YYYY-MM-DD format'),
      date_to: z.string().describe('End date in YYYY-MM-DD format'),
      device_type_indicator: z.string().optional().describe('Device type filter'),
      text_indicator: z.string().optional().describe('Text indicator'),
      region_ids: z.array(z.number()).optional().describe('Region IDs to filter by'),
      filters: z.record(z.unknown()).optional().describe('Additional filters'),
      sort_by_date: z.string().optional().describe('Sort by date direction'),
      offset: z.number().int().min(0).optional().describe('Number of results to skip'),
      limit: z.number().int().min(1).max(500).optional().describe('Maximum number of results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.queryAnalytics(hostId, {
          date_from: params.date_from,
          date_to: params.date_to,
          device_type_indicator: params.device_type_indicator,
          text_indicator: params.text_indicator,
          region_ids: params.region_ids,
          filters: params.filters,
          sort_by_date: params.sort_by_date,
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
