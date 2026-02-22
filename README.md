# Yandex Webmaster MCP Server

MCP-сервер для [Yandex Webmaster API v4](https://yandex.ru/dev/webmaster/doc/dg/reference/host-id.html). Предоставляет 31 инструмент для управления сайтами, картами сайта, индексацией, поисковой аналитикой, обратными ссылками и другими функциями Яндекс.Вебмастера через Model Context Protocol.

## Возможности

- **Основные** — информация о пользователе, управление сайтами, верификация, диагностика
- **Контент** — карты сайта, статус и история индексации, URL в поиске, важные URL
- **Аналитика** — статистика поисковых запросов, популярные запросы, обратные ссылки, внешние ссылки, ИКС
- **Действия** — отправка на переобход, управление оригинальными текстами

## Быстрый старт

### Использование через npx (рекомендуется)

Не требует установки. Добавьте в конфигурацию MCP-клиента:

```json
{
  "mcpServers": {
    "yandex-webmaster": {
      "command": "npx",
      "args": ["-y", "yandex-webmaster-mcp-server"],
      "env": {
        "YANDEX_WEBMASTER_OAUTH_TOKEN": "ваш-токен"
      }
    }
  }
}
```

### Установка из исходников

```bash
git clone https://github.com/weselow/yandex-webmaster-mcp-server.git
cd yandex-webmaster-mcp-server
pnpm install
pnpm build
```

## Настройка

### Переменные окружения

| Переменная | Обязательная | Описание |
|---|---|---|
| `YANDEX_WEBMASTER_OAUTH_TOKEN` | Да | OAuth-токен для Yandex Webmaster API |
| `YANDEX_WEBMASTER_HOST_URL` | Нет | URL сайта по умолчанию (например, `https://example.com`). Сокращает количество API-запросов — не нужно каждый раз указывать host_id |

### Получение OAuth-токена

1. Перейдите на [oauth.yandex.ru/client/new](https://oauth.yandex.ru/client/new)
2. Создайте приложение с правами:
   - `webmaster:verify` — верификация сайтов
   - `webmaster:hostinfo` — доступ к информации о сайтах
3. После создания приложения получите токен:
   ```
   https://oauth.yandex.ru/authorize?response_type=token&client_id=ID_ВАШЕГО_ПРИЛОЖЕНИЯ
   ```
4. Установите токен в переменную окружения `YANDEX_WEBMASTER_OAUTH_TOKEN`

## Использование

### Режим stdio (по умолчанию)

```bash
YANDEX_WEBMASTER_OAUTH_TOKEN=ваш-токен node dist/index.js
```

### Режим HTTP

```bash
YANDEX_WEBMASTER_OAUTH_TOKEN=ваш-токен node dist/index.js --http --port=3000
```

### Конфигурация MCP-клиента

Для Claude Desktop, Cursor, Cline или `.mcp.json`:

```json
{
  "mcpServers": {
    "yandex-webmaster": {
      "command": "npx",
      "args": ["-y", "yandex-webmaster-mcp-server"],
      "env": {
        "YANDEX_WEBMASTER_OAUTH_TOKEN": "ваш-токен",
        "YANDEX_WEBMASTER_HOST_URL": "https://example.com"
      }
    }
  }
}
```

## Доступные инструменты

### Основные

| Инструмент | Описание | Тип |
|---|---|---|
| `ywm_get_user` | Информация о текущем пользователе | Чтение |
| `ywm_list_hosts` | Список всех зарегистрированных сайтов | Чтение |
| `ywm_get_host` | Информация о сайте | Чтение |
| `ywm_add_host` | Добавить сайт | Запись |
| `ywm_delete_host` | Удалить сайт | Запись |
| `ywm_get_host_summary` | Сводка по сайту (ИКС, количество страниц, проблемы) | Чтение |
| `ywm_get_verification` | Статус верификации | Чтение |
| `ywm_verify_host` | Запустить верификацию сайта | Запись |
| `ywm_get_diagnostics` | Диагностика сайта | Чтение |
| `ywm_list_owners` | Список владельцев сайта | Чтение |

### Контент

| Инструмент | Описание | Тип |
|---|---|---|
| `ywm_list_sitemaps` | Список карт сайта | Чтение |
| `ywm_get_sitemap` | Информация о карте сайта | Чтение |
| `ywm_add_sitemap` | Добавить карту сайта | Запись |
| `ywm_delete_sitemap` | Удалить карту сайта | Запись |
| `ywm_get_indexing_status` | Текущий статус индексации | Чтение |
| `ywm_get_indexing_history` | История индексации | Чтение |
| `ywm_get_search_urls` | URL, найденные в поиске | Чтение |
| `ywm_get_important_urls` | Важные URL с проблемами | Чтение |

### Аналитика

| Инструмент | Описание | Тип |
|---|---|---|
| `ywm_get_search_queries` | История поисковых запросов | Чтение |
| `ywm_get_popular_queries` | Популярные поисковые запросы | Чтение |
| `ywm_get_backlinks` | Сводка по обратным ссылкам | Чтение |
| `ywm_get_external_links` | Примеры внешних ссылок | Чтение |
| `ywm_get_sqi` | Текущий ИКС (индекс качества сайта) | Чтение |
| `ywm_get_sqi_history` | История ИКС | Чтение |

### Действия

| Инструмент | Описание | Тип |
|---|---|---|
| `ywm_get_recrawl_quota` | Квота на переобход | Чтение |
| `ywm_list_recrawl_tasks` | Список задач на переобход | Чтение |
| `ywm_submit_recrawl` | Отправить URL на переобход | Запись |
| `ywm_get_original_texts` | Список оригинальных текстов | Чтение |
| `ywm_add_original_text` | Добавить оригинальный текст | Запись |
| `ywm_delete_original_text` | Удалить оригинальный текст | Запись |
| `ywm_get_original_text_quota` | Квота на оригинальные тексты | Чтение |

## Разработка

```bash
pnpm install          # Установка зависимостей
pnpm dev              # Запуск в режиме разработки (watch)
pnpm build            # Сборка для продакшена
pnpm test             # Запуск тестов
pnpm test:watch       # Запуск тестов в watch-режиме
```

## Лицензия

MIT
