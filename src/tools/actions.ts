import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { YandexWebmasterClient } from '../client/yandex-webmaster-client.js';
import { optionalHostIdSchema } from '../utils/schemas.js';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
}

function jsonResponse(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function successResponse(message: string) {
  return { content: [{ type: 'text' as const, text: message }] };
}

export function registerActionTools(server: McpServer, client: YandexWebmasterClient): void {
  // --- Recrawl tools ---

  server.tool(
    'ywm_get_recrawl_quota',
    'Get recrawl quota information for a host',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getRecrawlQuota(hostId);
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    'ywm_list_recrawl_tasks',
    'List recrawl tasks for a host',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.listRecrawlTasks(hostId);
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    'ywm_submit_recrawl',
    'Submit a URL for recrawling (destructive action — consumes quota)',
    {
      host_id: optionalHostIdSchema,
      url: z.string().describe('URL to submit for recrawling'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.addRecrawlTask(hostId, params.url);
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  // --- Original text tools ---

  server.tool(
    'ywm_get_original_texts',
    'List original texts for a host',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().int().min(0).optional().describe('Number of results to skip'),
      limit: z.number().int().min(1).max(500).optional().describe('Maximum number of results to return'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getOriginalTexts(hostId, {
          offset: params.offset,
          limit: params.limit,
        });
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    'ywm_add_original_text',
    'Add an original text for a host',
    {
      host_id: optionalHostIdSchema,
      content: z.string().describe('Original text content to add'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.addOriginalText(hostId, params.content);
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    'ywm_delete_original_text',
    'Delete an original text',
    {
      host_id: optionalHostIdSchema,
      text_id: z.string().describe('Original text ID to delete'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        await client.deleteOriginalText(hostId, params.text_id);
        return successResponse('Successfully deleted.');
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    'ywm_get_original_text_quota',
    'Get original text quota information for a host',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getOriginalTextQuota(hostId);
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
