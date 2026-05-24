# vpopus-design

Snapshot фронтенда [vpopus](https://github.com/UhUh123/design) — десктопного AI-приложения
для повседневного общения с ИИ — подготовленный для работы с [Claude Design](https://claude.ai/design).

Этот репозиторий **не основной**, а копия `frontend/` из локального проекта vpopus.
Цель: дать Claude Design доступ к реальному коду UI через интеграцию с GitHub, чтобы
сгенерированные дизайны соответствовали существующей дизайн-системе.

## Что здесь

- `DESIGN.md` — **главный файл**. Описывает дизайн-систему vpopus: палитру, типографику,
  компоненты, layout, принципы. Claude Design читает его при онбординге.
- `src/` — React-компоненты (Chat, Sidebar, Settings), хуки, API-клиент.
- `electron/main.js` — Electron main process (для контекста, не критично для UI).
- `tailwind.config.js`, `index.css` — токены и базовые стили.
- `package.json`, `vite.config.js`, `postcss.config.js` — сборка.

## Стек

**Electron + React 18 + Vite + Tailwind CSS** — тёмная тема в стиле GitHub.

## Workflow с Claude Design

1. На [claude.ai/design](https://claude.ai/design) → создать новый проект → **Import → From GitHub** → подключить этот репо.
2. Claude автоматически прочитает `DESIGN.md`, компоненты в `src/`, токены Tailwind.
3. Прототипировать новые экраны / редизайн существующих в чате.
4. Handoff обратно через Claude Code: правки приходят в локальный `frontend/` основного проекта vpopus.

## Запуск локально (для проверки изменений)

```bash
npm install
npm run dev          # vite + electron одновременно
npm run build:app    # сборка десктоп-приложения через electron-builder
```

> ⚠️ Backend (FastAPI + LLM-провайдеры) **не входит** в этот репо.
> Без запущенного backend UI покажет «Backend offline» в правом нижнем углу — это нормально.

## Связь с основным проектом

| Файл здесь                  | Соответствует в vpopus          |
|-----------------------------|---------------------------------|
| `src/`                      | `frontend/src/`                 |
| `electron/`                 | `frontend/electron/`            |
| `tailwind.config.js` и т.д. | `frontend/`                     |

Изменения, принятые из Claude Design, надо вручную переносить обратно в основной проект
(или через `git remote add` обоих репо). Это сознательное решение — основной проект
содержит backend с приватными API-ключами и не должен попадать на публичный GitHub.
