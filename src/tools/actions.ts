import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { YandexWebmasterClient } from '../client/index.js';
import { optionalHostIdSchema } from '../utils/schemas.js';
import { errorResult, jsonResult, textResult } from '../utils/tool-response.js';

export function registerActionTools(server: McpServer, client: YandexWebmasterClient): void {
  // --- Recrawl tools ---

  server.tool(
    'ywm_get_recrawl_quota',
    'Get recrawl quota',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getRecrawlQuota(hostId);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_list_recrawl_tasks',
    'List recrawl tasks',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.listRecrawlTasks(hostId);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_submit_recrawl',
    'Submit URL for recrawling (consumes quota)',
    {
      host_id: optionalHostIdSchema,
      url: z.string().describe('URL to recrawl'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.addRecrawlTask(hostId, params.url);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Original text tools ---

  server.tool(
    'ywm_get_original_texts',
    'List original texts',
    {
      host_id: optionalHostIdSchema,
      offset: z.number().int().min(0).optional().describe('Offset'),
      limit: z.number().int().min(1).max(500).optional().describe('Max results'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getOriginalTexts(hostId, {
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
    'ywm_add_original_text',
    'Add original text',
    {
      host_id: optionalHostIdSchema,
      content: z.string().describe('Text content'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.addOriginalText(hostId, params.content);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_delete_original_text',
    'Delete an original text',
    {
      host_id: optionalHostIdSchema,
      text_id: z.string().describe('Text ID'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        await client.deleteOriginalText(hostId, params.text_id);
        return textResult('Successfully deleted.');
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_get_original_text_quota',
    'Get original text quota',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getOriginalTextQuota(hostId);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Recrawl task details ---

  server.tool(
    'ywm_get_recrawl_task',
    'Get recrawl task details',
    {
      host_id: optionalHostIdSchema,
      task_id: z.string().describe('Task ID'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getRecrawlTask(hostId, params.task_id);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // --- Feed tools ---

  server.tool(
    'ywm_list_feeds',
    'List all feeds',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.listFeeds(hostId);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_start_feed_upload',
    'Start feed upload',
    {
      host_id: optionalHostIdSchema,
      url: z.string().describe('Feed URL'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.startFeedUpload(hostId, { url: params.url });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_get_feed_upload_status',
    'Get feed upload status',
    { host_id: optionalHostIdSchema },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.getFeedUploadStatus(hostId);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_batch_add_feeds',
    'Batch add feeds',
    {
      host_id: optionalHostIdSchema,
      urls: z.array(z.string()).describe('Feed URLs'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.batchAddFeeds(hostId, { urls: params.urls });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'ywm_batch_remove_feeds',
    'Batch remove feeds',
    {
      host_id: optionalHostIdSchema,
      urls: z.array(z.string()).describe('Feed URLs'),
    },
    async (params) => {
      try {
        const hostId = client.resolveHostId(params.host_id);
        const result = await client.batchRemoveFeeds(hostId, { urls: params.urls });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
