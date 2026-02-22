# Yandex Webmaster MCP Server

[![npm version](https://img.shields.io/npm/v/yandex-webmaster-mcp-server)](https://www.npmjs.com/package/yandex-webmaster-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP-сервер для [Yandex Webmaster API v4](https://yandex.ru/dev/webmaster/doc/dg/reference/host-id.html). Предоставляет **46 инструментов** для управления сайтами, картами сайтов, индексацией, поисковой аналитикой, обратными ссылками, фидами и многим другим через Model Context Protocol.

## Возможности

- **Core** --- информация о пользователе, управление хостами, верификация, диагностика
- **Content** --- карты сайтов, индексация, URL в поиске, важные URL, битые ссылки, события поиска
- **Analytics** --- поисковые запросы, популярные запросы, внешние ссылки, SQI, аналитика запросов
- **Actions** --- переобход страниц, оригинальные тексты, управление фидами

### Примеры промптов

**Аудит сайта** --- быстрая проверка состояния и проблем:

- «Какие проблемы обнаружены на сайте dellshop.ru?»
- «Есть ли битые внутренние ссылки на сайте?»
- «Найди страницы, исключённые из поиска как малоценные»

**Мониторинг позиций** --- отслеживание видимости в поиске:

- «Покажи популярные поисковые запросы за последнюю неделю»
- «Покажи историю SQI за последние 3 месяца»
- «Сколько страниц проиндексировано и какие HTTP-коды возвращают?»

**Ссылочный профиль** --- анализ внешних и внутренних ссылок:

- «Какие внешние ссылки ведут на мой сайт?»
- «Покажи динамику внешних ссылок за последний месяц»

**Действия** --- управление индексацией и контентом:

- «Отправь главную страницу на переобход»
- «Покажи список всех моих сайтов в Яндекс Вебмастере»

## Установка

### Через npx (без установки)

```bash
npx -y yandex-webmaster-mcp-server
```

### Глобальная установка

```bash
npm install -g yandex-webmaster-mcp-server
yandex-webmaster-mcp-server
```

### Из исходников

```bash
git clone https://github.com/weselow/yandex-webmaster-mcp-server.git
cd yandex-webmaster-mcp-server
pnpm install
pnpm build
```

## Настройка

### Переменные окружения

| Переменная | Обязательна | Описание |
|---|---|---|
| `YANDEX_WEBMASTER_OAUTH_TOKEN` | Да | OAuth-токен для Yandex Webmaster API |
| `YANDEX_WEBMASTER_HOST_URL` | Нет | URL хоста по умолчанию (например `https://example.com`) для сокращения вызовов API |

### Получение OAuth-токена

1. Перейдите на [oauth.yandex.ru/client/new](https://oauth.yandex.ru/client/new)
2. Создайте приложение:
   - Укажите название (любое, например «Webmaster MCP»)
   - В разделе «Доступ к данным» добавьте права:
     - `webmaster:verify` --- верификация сайтов
     - `webmaster:hostinfo` --- доступ к информации о сайтах
   - Нажмите «Создать приложение»
   - Скопируйте **ClientID** из созданного приложения
3. Откройте в браузере ссылку для получения токена (подставьте свой ClientID):
   ```
   https://oauth.yandex.ru/authorize?response_type=token&client_id=ВАШ_CLIENT_ID
   ```
4. Авторизуйтесь и разрешите доступ приложению
5. Яндекс перенаправит на страницу с токеном --- скопируйте значение **access_token** из адресной строки
6. Установите токен в переменную окружения `YANDEX_WEBMASTER_OAUTH_TOKEN`

## Использование

### Режим stdio (по умолчанию)

```bash
YANDEX_WEBMASTER_OAUTH_TOKEN=your-token npx -y yandex-webmaster-mcp-server
```

### HTTP-режим

```bash
YANDEX_WEBMASTER_OAUTH_TOKEN=your-token npx -y yandex-webmaster-mcp-server --http --port=3000
```

### Настройка MCP-клиента

Для Claude Desktop или `.mcp.json`:

```json
{
  "mcpServers": {
    "yandex-webmaster": {
      "command": "npx",
      "args": ["-y", "yandex-webmaster-mcp-server"],
      "env": {
        "YANDEX_WEBMASTER_OAUTH_TOKEN": "your-token",
        "YANDEX_WEBMASTER_HOST_URL": "https://example.com"
      }
    }
  }
}
```

> `YANDEX_WEBMASTER_HOST_URL` --- необязательная переменная. Если указать URL вашего основного сайта, сервер будет использовать его по умолчанию во всех запросах. Это сокращает количество API-вызовов и экономит токены, так как не нужно каждый раз передавать `host_id`.

Или, если установлено из исходников:

```json
{
  "mcpServers": {
    "yandex-webmaster": {
      "command": "node",
      "args": ["path/to/dist/index.js"],
      "env": {
        "YANDEX_WEBMASTER_OAUTH_TOKEN": "your-token",
        "YANDEX_WEBMASTER_HOST_URL": "https://example.com"
      }
    }
  }
}
```

## Доступные инструменты

### Core --- базовые операции (10)

Управление аккаунтом, хостами (сайтами), верификация и диагностика.

| Инструмент | Описание | Тип |
|---|---|---|
| `ywm_get_user` | Получить информацию о текущем пользователе | Чтение |
| `ywm_list_hosts` | Список всех зарегистрированных хостов | Чтение |
| `ywm_get_host` | Получить детали хоста по ID | Чтение |
| `ywm_add_host` | Добавить новый хост | Запись |
| `ywm_delete_host` | Удалить хост | Запись |
| `ywm_get_host_summary` | Сводная статистика хоста (SQI, страницы, проблемы) | Чтение |
| `ywm_get_verification` | Статус верификации хоста | Чтение |
| `ywm_verify_host` | Запустить верификацию хоста | Запись |
| `ywm_get_diagnostics` | Диагностика сайта и обнаруженные проблемы | Чтение |
| `ywm_list_owners` | Список владельцев хоста | Чтение |

### Content --- контент и индексация (16)

Карты сайтов, статус индексации, URL в поиске, важные URL, битые ссылки и события поиска.

| Инструмент | Описание | Тип |
|---|---|---|
| `ywm_list_sitemaps` | Список всех карт сайтов | Чтение |
| `ywm_get_sitemap` | Детали конкретной карты сайта | Чтение |
| `ywm_add_sitemap` | Добавить карту сайта | Запись |
| `ywm_delete_sitemap` | Удалить карту сайта | Запись |
| `ywm_list_user_sitemaps` | Список пользовательских карт сайтов | Чтение |
| `ywm_get_user_sitemap` | Детали пользовательской карты сайта | Чтение |
| `ywm_get_indexing_history` | История индексации за период | Чтение |
| `ywm_get_indexing_samples` | Примеры индексации с HTTP-кодами | Чтение |
| `ywm_get_search_urls` | URL, найденные в поиске | Чтение |
| `ywm_get_search_urls_history` | История URL в поиске за период | Чтение |
| `ywm_get_important_urls` | Важные URL с проблемами | Чтение |
| `ywm_get_important_urls_history` | История важных URL за период | Чтение |
| `ywm_get_broken_internal_links` | Примеры битых внутренних ссылок | Чтение |
| `ywm_get_broken_links_history` | История битых ссылок за период | Чтение |
| `ywm_get_search_events_samples` | Страницы, исключённые из поиска (LOW_QUALITY, DUPLICATE и др.) | Чтение |
| `ywm_get_search_events_history` | История событий поиска за период | Чтение |

### Analytics --- аналитика (7)

Поисковые запросы, внешние ссылки, SQI и продвинутая аналитика запросов.

| Инструмент | Описание | Тип |
|---|---|---|
| `ywm_get_search_queries` | История поисковых запросов | Чтение |
| `ywm_get_popular_queries` | Популярные поисковые запросы | Чтение |
| `ywm_get_query_history` | История конкретного поискового запроса | Чтение |
| `ywm_query_analytics` | Расширенная аналитика запросов с фильтрами | Чтение |
| `ywm_get_external_links` | Примеры внешних ссылок | Чтение |
| `ywm_get_external_links_history` | История внешних ссылок за период | Чтение |
| `ywm_get_sqi_history` | История SQI (индекс качества сайта) за период | Чтение |

### Actions --- действия (13)

Переобход страниц, оригинальные тексты и управление фидами.

| Инструмент | Описание | Тип |
|---|---|---|
| `ywm_get_recrawl_quota` | Квота на переобход | Чтение |
| `ywm_list_recrawl_tasks` | Список задач на переобход | Чтение |
| `ywm_get_recrawl_task` | Детали конкретной задачи на переобход | Чтение |
| `ywm_submit_recrawl` | Отправить URL на переобход (расходует квоту) | Запись |
| `ywm_get_original_texts` | Список оригинальных текстов | Чтение |
| `ywm_add_original_text` | Добавить оригинальный текст | Запись |
| `ywm_delete_original_text` | Удалить оригинальный текст | Запись |
| `ywm_get_original_text_quota` | Квота на оригинальные тексты | Чтение |
| `ywm_list_feeds` | Список всех фидов | Чтение |
| `ywm_start_feed_upload` | Запустить загрузку фида | Запись |
| `ywm_get_feed_upload_status` | Статус загрузки фида | Чтение |
| `ywm_batch_add_feeds` | Массовое добавление фидов | Запись |
| `ywm_batch_remove_feeds` | Массовое удаление фидов | Запись |

## Разработка

```bash
pnpm install          # Установка зависимостей
pnpm dev              # Запуск в режиме разработки (watch)
pnpm build            # Сборка для продакшена
pnpm test             # Запуск тестов
pnpm test:watch       # Запуск тестов в режиме наблюдения
```

## Лицензия

MIT
