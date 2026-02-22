# Yandex Webmaster MCP Server

MCP server for the [Yandex Webmaster API v4](https://yandex.ru/dev/webmaster/doc/dg/reference/host-id.html). Provides 31 tools for managing sites, sitemaps, indexing, search analytics, backlinks, and more through the Model Context Protocol.

## Features

- **Core** --- user info, host management, verification, diagnostics
- **Content** --- sitemaps, indexing status/history, search URLs, important URLs
- **Analytics** --- search query stats, popular queries, backlinks, external links, SQI
- **Actions** --- recrawl submission, original text management

## Installation

```bash
git clone https://github.com/your-org/yandex-webmaster-mcp-server.git
cd yandex-webmaster-mcp-server
pnpm install
pnpm build
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `YANDEX_WEBMASTER_OAUTH_TOKEN` | Yes | OAuth token for Yandex Webmaster API |
| `YANDEX_WEBMASTER_HOST_URL` | No | Default host URL (e.g. `https://example.com`) to reduce API calls |

### Получение OAuth-токена

1. Перейдите на [oauth.yandex.ru/client/new](https://oauth.yandex.ru/client/new)
2. Создайте приложение:
   - Укажите название (любое, например «Webmaster MCP»)
   - В разделе «Доступ к данным» добавьте права:
     - `webmaster:verify` — верификация сайтов
     - `webmaster:hostinfo` — доступ к информации о сайтах
   - Нажмите «Создать приложение»
   - Скопируйте **ClientID** из созданного приложения
3. Откройте в браузере ссылку для получения токена (подставьте свой ClientID):
   ```
   https://oauth.yandex.ru/authorize?response_type=token&client_id=ВАШ_CLIENT_ID
   ```
4. Авторизуйтесь и разрешите доступ приложению
5. Яндекс перенаправит на страницу с токеном — скопируйте значение **access_token** из адресной строки
6. Установите токен в переменную окружения `YANDEX_WEBMASTER_OAUTH_TOKEN`

## Usage

### stdio mode (default)

```bash
YANDEX_WEBMASTER_OAUTH_TOKEN=your-token node dist/index.js
```

### HTTP mode

```bash
YANDEX_WEBMASTER_OAUTH_TOKEN=your-token node dist/index.js --http --port=3000
```

### MCP Client Configuration

For Claude Desktop or `.mcp.json`:

```json
{
  "mcpServers": {
    "yandex-webmaster": {
      "command": "node",
      "args": ["path/to/dist/index.js"],
      "env": {
        "YANDEX_WEBMASTER_OAUTH_TOKEN": "your-token"
      }
    }
  }
}
```

## Available Tools

### Core

| Tool | Description | Type |
|---|---|---|
| `ywm_get_user` | Get current user info | Read |
| `ywm_list_hosts` | List all registered hosts | Read |
| `ywm_get_host` | Get host details | Read |
| `ywm_add_host` | Add a new host | Mutating |
| `ywm_delete_host` | Delete a host | Mutating |
| `ywm_get_host_summary` | Get host summary (SQI, page counts, problems) | Read |
| `ywm_get_verification` | Get verification status | Read |
| `ywm_verify_host` | Start host verification | Mutating |
| `ywm_get_diagnostics` | Get site diagnostics | Read |
| `ywm_list_owners` | List host owners | Read |

### Content

| Tool | Description | Type |
|---|---|---|
| `ywm_list_sitemaps` | List all sitemaps | Read |
| `ywm_get_sitemap` | Get sitemap details | Read |
| `ywm_add_sitemap` | Add a new sitemap | Mutating |
| `ywm_delete_sitemap` | Delete a sitemap | Mutating |
| `ywm_get_indexing_status` | Get current indexing status | Read |
| `ywm_get_indexing_history` | Get indexing history over time | Read |
| `ywm_get_search_urls` | Get URLs found in search | Read |
| `ywm_get_important_urls` | Get important URLs with issues | Read |

### Analytics

| Tool | Description | Type |
|---|---|---|
| `ywm_get_search_queries` | Get search query analytics history | Read |
| `ywm_get_popular_queries` | Get popular search queries | Read |
| `ywm_get_backlinks` | Get backlinks summary | Read |
| `ywm_get_external_links` | Get external link samples | Read |
| `ywm_get_sqi` | Get current SQI (Site Quality Index) | Read |
| `ywm_get_sqi_history` | Get SQI history over time | Read |

### Actions

| Tool | Description | Type |
|---|---|---|
| `ywm_get_recrawl_quota` | Get recrawl quota | Read |
| `ywm_list_recrawl_tasks` | List recrawl tasks | Read |
| `ywm_submit_recrawl` | Submit URL for recrawling | Mutating |
| `ywm_get_original_texts` | List original texts | Read |
| `ywm_add_original_text` | Add an original text | Mutating |
| `ywm_delete_original_text` | Delete an original text | Mutating |
| `ywm_get_original_text_quota` | Get original text quota | Read |

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Run in development mode (watch)
pnpm build            # Build for production
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
```

## License

MIT
