#!/usr/bin/env node

import { createServer as createHttpServer } from 'node:http';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'node:crypto';
import { createServer } from './server.js';

const token = process.env.YANDEX_WEBMASTER_OAUTH_TOKEN;
if (!token) {
  console.error('Error: YANDEX_WEBMASTER_OAUTH_TOKEN environment variable is required');
  process.exit(1);
}

const args = process.argv.slice(2);
const isHttp = args.includes('--http');

if (isHttp) {
  const portArg = args.find((arg) => arg.startsWith('--port='));
  const port = portArg ? parseInt(portArg.split('=')[1], 10) : 3000;

  const server = await createServer(token);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });
  await server.connect(transport);

  createHttpServer(async (req, res) => {
    await transport.handleRequest(req, res);
  }).listen(port, () => {
    console.error(`Yandex Webmaster MCP server listening on http://localhost:${port}`);
  });
} else {
  const server = await createServer(token);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Yandex Webmaster MCP server running on stdio');
}
