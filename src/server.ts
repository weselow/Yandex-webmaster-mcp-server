import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { YandexWebmasterClient } from './client/index.js';
import { registerCoreTools } from './tools/core.js';
import { registerContentTools } from './tools/content.js';
import { registerAnalyticsTools } from './tools/analytics.js';
import { registerActionTools } from './tools/actions.js';

export async function createServer(token: string): Promise<McpServer> {
  const server = new McpServer({
    name: 'yandex-webmaster-mcp-server',
    version: '1.0.0',
  });

  const client = new YandexWebmasterClient(token);

  const hostUrl = process.env.YANDEX_WEBMASTER_HOST_URL;
  if (hostUrl) {
    try {
      await client.resolveDefaultHost(hostUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Warning: failed to resolve default host: ${message}`);
    }
  }

  registerCoreTools(server, client);
  registerContentTools(server, client);
  registerAnalyticsTools(server, client);
  registerActionTools(server, client);

  return server;
}
