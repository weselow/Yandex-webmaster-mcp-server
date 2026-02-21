import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function createServer(_token: string): McpServer {
  const server = new McpServer({
    name: 'yandex-webmaster-mcp-server',
    version: '1.0.0',
  });

  // TODO: registerUserTools(server, token)
  // TODO: registerHostsTools(server, token)
  // TODO: registerSitemapsTools(server, token)
  // TODO: registerIndexingTools(server, token)
  // TODO: registerSearchQueriesTools(server, token)
  // TODO: registerDiagnosticsTools(server, token)

  return server;
}
