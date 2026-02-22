---
name: release
description: Публикация новой версии npm-пакета. Проверяет тесты, поднимает версию, создаёт тег и GitHub Release. Использовать когда нужно опубликовать обновление пакета.
---

# Публикация релиза

## Пошаговый процесс

### Шаг 1: Проверка готовности

Перед релизом убедись, что:

1. Все изменения закоммичены:
   ```bash
   git status
   ```
2. Тесты проходят:
   ```bash
   pnpm build && pnpm test
   ```
3. Ты на ветке main/master

Если есть незакоммиченные изменения или тесты не проходят — останови процесс и сообщи пользователю.

### Шаг 2: Определи тип версии

Спроси пользователя через AskUserQuestion, какой тип версии:

- **patch** (1.0.0 → 1.0.1) — баг-фиксы, мелкие исправления
- **minor** (1.0.0 → 1.1.0) — новые функции, обратно совместимые
- **major** (1.0.0 → 2.0.0) — ломающие изменения

Покажи текущую версию из package.json и какой станет новая.

### Шаг 3: Обнови версию

```bash
npm version <patch|minor|major> --no-git-tag-version
```

Это обновит version в package.json без создания git-тега (тег создаст GitHub Release).

### Шаг 4: Закоммить и запуш

```bash
git add package.json
git commit -m "chore: bump version to <NEW_VERSION>"
git push origin main
```

### Шаг 5: Создай GitHub Release

```bash
gh release create v<NEW_VERSION> --title "v<NEW_VERSION>" --generate-notes
```

Флаг `--generate-notes` автоматически создаст описание из коммитов.

### Шаг 6: Подтверди публикацию

Сообщи пользователю:
- Новая версия: v<NEW_VERSION>
- GitHub Release создан
- GitHub Actions запустит публикацию в npm автоматически
- Проверить статус: `gh run list --limit 1`

## Первоначальная настройка npm (одноразово)

Если пакет ещё не был опубликован, пользователю нужно:

1. Создать аккаунт на [npmjs.com](https://www.npmjs.com/signup)
2. Сгенерировать Access Token: npmjs.com → Avatar → Access Tokens → Generate New Token → тип **Automation**
3. Добавить секрет в GitHub: repo → Settings → Secrets and variables → Actions → New repository secret → имя `NPM_TOKEN`, значение — токен
4. Первый релиз: `gh release create v1.0.0 --title "v1.0.0" --notes "Первый релиз"`

## Проверка публикации

```bash
# Статус workflow
gh run list --limit 1

# Проверить пакет в npm
npm view yandex-webmaster-mcp-server version
```
