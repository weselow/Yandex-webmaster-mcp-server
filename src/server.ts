import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { YandexWebmasterClient } from './client/index.js';
import { registerCoreTools } from './tools/core.js';
import { registerContentTools } from './tools/content.js';
import { registerAnalyticsTools } from './tools/analytics.js';
import { registerActionTools } from './tools/actions.js';

export function createServer(token: string): McpServer {
  const server = new McpServer({
    name: 'yandex-webmaster-mcp-server',
    version: '1.0.0',
  });

  const client = new YandexWebmasterClient(token);

  const hostUrl = process.env.YANDEX_WEBMASTER_HOST_URL;
  if (hostUrl) {
    client.resolveDefaultHost(hostUrl).catch((err: Error) => {
      console.error('Failed to resolve default host:', err.message);
    });
  }

  registerCoreTools(server, client);
  registerContentTools(server, client);
  registerAnalyticsTools(server, client);
  registerActionTools(server, client);

  return server;
}
