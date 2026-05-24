# DESIGN.md — vpopus UI Design System

> Этот файл — источник истины по визуальному языку приложения **vpopus** для Claude Design.
> Все новые экраны и компоненты должны следовать этим правилам, если не указано иное.

---

## 🎯 Продукт

**vpopus** — десктопное AI-приложение для повседневного общения с ИИ (аналог ChatGPT Desktop,
построенный на бесплатных LLM с умной оркестрацией). Стек UI: **Electron + React 18 + Vite + Tailwind CSS**.

**Ощущение продукта:** спокойный, серьёзный, тёмный инструмент для работы — не игрушка.
Минимум визуального шума, максимум читаемости текста, акцент на содержании диалога.

---

## 🎨 Цветовая палитра

Палитра вдохновлена GitHub Dark — нейтральная тёмная тема с одним синим акцентом.

| Токен          | HEX       | Где используется                                          |
|----------------|-----------|-----------------------------------------------------------|
| `bg`           | `#0d1117` | Основной фон приложения (главная область чата, input bar) |
| `surface`      | `#161b22` | Поверхности первого уровня (сайдбар, модалки, input)      |
| `surface-2`    | `#1f2630` | Поверхности второго уровня (assistant bubble, hover, кнопки) |
| `border`       | `#30363d` | Все границы (разделители, контуры карточек, input)        |
| `text`         | `#e6edf3` | Основной текст                                            |
| `muted`        | `#7d8590` | Вторичный текст, плейсхолдеры, метаданные, иконки         |
| `accent`       | `#2f81f7` | Единственный акцент: user bubble, focus border, primary button, active dot |

**Стандартные семафорные цвета Tailwind** для статусов:
- `bg-green-500` — успех / провайдер доступен / стейдж done
- `bg-yellow-500` — предупреждение / лимит близко
- `bg-red-500` / `text-red-400` — ошибка / удаление / стейдж error

**Правило:** не вводи новые цвета без необходимости. Один акцент. Никаких градиентов и теней цвета.

---

## ✍️ Типографика

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", sans-serif;
-webkit-font-smoothing: antialiased;
```

**Системный шрифт по платформе** — нативное ощущение на macOS/Windows/Linux. Не подключай Google Fonts.

| Роль                        | Класс Tailwind                          |
|-----------------------------|-----------------------------------------|
| Заголовок модалки           | `text-lg font-semibold`                 |
| Логотип в sidebar           | `text-sm font-semibold tracking-wide`   |
| Заголовок пустого состояния | `text-2xl font-light`                   |
| Основной текст диалога      | `leading-relaxed` (без явного размера)  |
| Пункт списка чатов          | `text-sm`                               |
| Кнопки                      | `text-sm` (вторичные) / `font-medium` (primary) |
| Метаданные под bubble       | `text-[11px] text-muted`                |
| Статусы провайдеров         | `text-xs`                               |

---

## 📐 Layout

### Основная сетка (App.jsx)
```
┌─────────────┬──────────────────────────────────────────┐
│  Sidebar    │  ChatWindow                              │
│  w-72       │  flex-1 min-w-0                          │
│  (288px)    │                                          │
│             │  ┌────────────────────────────────────┐  │
│  - logo     │  │  Messages (max-w-3xl mx-auto)      │  │
│  - new chat │  │  ↑↓ scroll                         │  │
│  - list     │  │                                    │  │
│             │  └────────────────────────────────────┘  │
│  - provider │  ┌────────────────────────────────────┐  │
│  - settings │  │  Input (max-w-3xl mx-auto)         │  │
└─────────────┴──┴────────────────────────────────────┴──┘
```

- **Sidebar:** фиксированная ширина `w-72` (288px), `shrink-0`, фон `bg-surface`, правая граница `border-r border-border`.
- **ChatWindow:** растягивается (`flex-1`), `min-w-0` обязателен иначе flex переполнится длинным текстом.
- **Контент чата ограничен** `max-w-3xl mx-auto` для читаемости длинных строк.
- **Модалки** (SettingsPanel) — fullscreen overlay `fixed inset-0 bg-black/60` + центрированная карточка `w-[480px]`.

### macOS drag-зона
В верхней части sidebar — невидимая drag-зона для перемещения окна:
```jsx
style={{ WebkitAppRegion: 'drag' }}    // на контейнере
style={{ WebkitAppRegion: 'no-drag' }}  // на кнопках внутри
```
Это обязательно для frameless Electron-окна — без drag-зоны окно нельзя двигать.

---

## 🧩 Компоненты

### Кнопки

| Тип          | Классы                                                                                    | Где                            |
|--------------|-------------------------------------------------------------------------------------------|--------------------------------|
| **Primary**  | `rounded-xl bg-accent text-white px-4 py-3 font-medium hover:bg-accent/90`                | «Отправить»                    |
| **Secondary**| `rounded-lg bg-surface-2 border border-border py-2 hover:border-accent transition-colors` | «+ Новый чат», «Закрыть»       |
| **Ghost**    | `text-xs text-muted hover:text-text px-2 py-1.5 rounded hover:bg-surface-2`               | «⚙ Настройки»                  |
| **Icon (×)** | `opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 ml-2 px-1`               | Удаление чата (появляется на hover) |

**Disabled state:** `disabled:opacity-40 disabled:cursor-not-allowed`.
**Все интерактивные элементы:** `transition-colors`.

### Input / Textarea
```
rounded-xl bg-surface border border-border px-4 py-3
text-text placeholder:text-muted
focus:outline-none focus:border-accent transition-colors
```
- Автовысота textarea по содержимому (max ~200px).
- Submit по `Enter`, новая строка по `Shift+Enter`.

### Message Bubbles
```
max-w-[80%]  rounded-2xl px-4 py-3
whitespace-pre-wrap break-words leading-relaxed
```
| Роль          | Дополнительно                                                    | Выравнивание |
|---------------|------------------------------------------------------------------|--------------|
| **User**      | `bg-accent text-white rounded-br-sm`                             | `justify-end` |
| **Assistant** | `bg-surface-2 text-text rounded-bl-sm`                           | `justify-start` |
| **Error**     | + `border border-red-500/50`                                     | —            |

- Streaming-курсор: `inline-block w-2 h-4 bg-text/70 animate-pulse` после контента.
- Метаданные под bubble: `text-[11px] text-muted` (provider · model · latency · tokens).

### Карточки (Sidebar items, Settings modal)
- Скруглённость: `rounded-lg` для строк, `rounded-2xl` для крупных карточек.
- Hover на пункте списка: `hover:bg-surface-2/50 hover:text-text`.
- Активный пункт: `bg-surface-2 text-text` (без border, только фон).

### Pipeline Timeline (PipelineProgress.jsx)
Уникальный компонент vpopus — визуализация многошагового пайплайна обработки запроса.
Рендерится **над** assistant bubble, шрифт `text-[11px]`.

Каждый стейдж — строка: `[•] stage_name 1234ms · meta`
- Status dot `w-1.5 h-1.5 rounded-full`:
  - `running` → `bg-accent animate-pulse`
  - `done` → `bg-green-500`
  - `error` → `bg-red-500` + текст стейджа `text-red-400`

### Status indicators (ProviderStatus.jsx)
Маленькие dot-индикаторы `w-2 h-2 rounded-full`:
- зелёный — провайдер доступен
- жёлтый — лимит близок / нет провайдеров
- красный — backend offline

Формат строки: `[•] provider_name      123/min` (выровнено через `justify-between`).

---

## 🎭 Скруглённость и spacing

**Радиусы** (от меньшего к большему):
- `rounded` — мелкие ghost-кнопки
- `rounded-lg` — вторичные кнопки, пункты списка
- `rounded-xl` — primary кнопки, input
- `rounded-2xl` — message bubbles, модалки
- Асимметричные «хвостики» для bubbles: `rounded-br-sm` (user), `rounded-bl-sm` (assistant)

**Spacing scale** — стандартная Tailwind (4px база). Типичные значения:
- Между сообщениями: `mb-4`
- Padding bubble: `px-4 py-3`
- Padding sidebar item: `px-3 py-2`
- Padding модалки: `p-6`

---

## 🌀 Анимация и переходы

- **Только `transition-colors`** на интерактивных элементах — никаких scale/translate.
- `animate-pulse` — streaming-курсор, running-dot пайплайна.
- Никаких сложных анимаций, никаких framer-motion. Приложение должно ощущаться быстрым и спокойным.

---

## 📜 Скроллбары

Кастомные тонкие скроллбары (см. `src/index.css`):
```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #484f58; }
```

---

## ✅ Принципы дизайна (соблюдать в новых экранах)

1. **Тёмная тема — single source of truth.** Не делай light-mode варианты без явного запроса.
2. **Один акцент.** Синий `accent` — для primary action и состояний «выбрано/в фокусе». Не используй его для декора.
3. **Контент-first.** Сообщения диалога — главное на экране. Всё остальное (хром, индикаторы) — приглушённого цвета `muted`.
4. **Плотность как у IDE/Linear/GitHub**, а не как у consumer-приложения. `text-sm` и `text-xs` — норма.
5. **Никаких иллюстраций, эмодзи, градиентов.** Только текст, dot-индикаторы, юникод-символы (× ⚙ +) для иконок.
6. **Streaming видим всегда.** Любой долгий процесс — pulse-индикатор или живая timeline стейджей.
7. **Графейсфул degradation в UI.** Состояния `loading / empty / error / offline` должны быть продуманы для каждого экрана. Шаблон empty-state: центрированный `text-muted`.
8. **Русский язык интерфейса** — основной (продукт ориентирован на русскоязычного пользователя). Английский — только для технических терминов (provider, pipeline, ms, tok).
9. **Платформенный feel.** Системный шрифт, macOS-style traffic lights через Electron, drag-зоны.
10. **Tailwind utility-first.** Никаких CSS-модулей, styled-components, отдельных .css. Только Tailwind-классы + минимальный `@layer base` в index.css.

---

## 🗂 Структура проекта

```
src/
├── App.jsx                       — корневой layout (Sidebar + ChatWindow + Settings)
├── main.jsx                      — React entrypoint
├── index.css                     — Tailwind directives + базовые стили
├── config.js                     — URL backend
├── api/
│   └── conversations.js          — REST клиент для /api/conversations
├── hooks/
│   ├── useChat.js                — стейт чатов, отправка сообщений
│   ├── useWebSocket.js           — WS-соединение с backend
│   └── useProviderStatus.js      — polling /health для status footer
└── components/
    ├── Chat/
    │   ├── ChatWindow.jsx        — список сообщений + input
    │   ├── MessageBubble.jsx     — одно сообщение (user/assistant/error)
    │   ├── MessageInput.jsx      — textarea + submit
    │   └── PipelineProgress.jsx  — timeline стейджей пайплайна
    ├── Sidebar/
    │   ├── Sidebar.jsx           — список чатов + new/delete + footer
    │   └── ProviderStatus.jsx    — индикаторы доступности провайдеров
    └── Settings/
        └── SettingsPanel.jsx     — модалка настроек (пока заглушка)
```

---

## 🔮 Что хочется улучшить (направления для редизайна)

> Эти пункты — приглашение для Claude Design, не обязательные правила.

- **Markdown rendering** в сообщениях ассистента (сейчас `whitespace-pre-wrap`, нет подсветки кода).
- **Метрики dashboard** — отдельный экран/панель с распределением simple/medium/complex запросов, токены за день, latency-гистограмма по провайдерам.
- **Полноценный Settings** — UI для редактирования API-ключей, порогов сложности, выбора пресета пайплайна (simple/standard/full/reflexion/debate).
- **Better empty states** — сейчас просто текст «Чатов нет», можно сделать более приветливым без потери минимализма.
- **Команды/палитра** (Cmd+K) для быстрого переключения чатов и пресетов пайплайна.
- **Сворачиваемый sidebar** для узких экранов.
- **Индикатор «какой провайдер сейчас отвечает»** прямо в message bubble во время стриминга.

При редизайне сохрани: тёмную палитру GitHub, один синий акцент, layout Sidebar + ChatWindow, видимость pipeline timeline, плотность IDE.
