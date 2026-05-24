export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onOpenSettings,
  providerStatus,
}) {
  return (
    <aside className="w-72 shrink-0 bg-surface border-r border-border flex flex-col">
      {/* Заголовок + кнопка нового чата. titleBar drag-зона для macOS. */}
      <div
        className="px-4 pt-12 pb-3 border-b border-border"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold tracking-wide text-text">vpopus</div>
        </div>
        <button
          onClick={onNew}
          style={{ WebkitAppRegion: 'no-drag' }}
          className="w-full rounded-lg bg-surface-2 border border-border text-sm py-2 hover:border-accent transition-colors"
        >
          + Новый чат
        </button>
      </div>

      {/* Список разговоров. */}
      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length === 0 ? (
          <div className="text-xs text-muted px-4 py-3">Чатов нет</div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conv={c}
              active={c.id === activeId}
              onSelect={() => onSelect(c.id)}
              onDelete={() => onDelete(c.id)}
            />
          ))
        )}
      </div>

      {/* Футер: статус провайдеров + настройки. */}
      <div className="border-t border-border p-3 space-y-2">
        {providerStatus}
        <button
          onClick={onOpenSettings}
          className="w-full text-left text-xs text-muted hover:text-text px-2 py-1.5 rounded hover:bg-surface-2 transition-colors"
        >
          ⚙ Настройки
        </button>
      </div>
    </aside>
  )
}

function ConversationItem({ conv, active, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={[
        'group mx-2 my-0.5 px-3 py-2 rounded-lg text-sm cursor-pointer flex items-center justify-between',
        active ? 'bg-surface-2 text-text' : 'text-muted hover:bg-surface-2/50 hover:text-text',
      ].join(' ')}
    >
      <span className="truncate flex-1">{conv.title || 'Без названия'}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (confirm(`Удалить чат «${conv.title}»?`)) onDelete()
        }}
        className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 ml-2 px-1"
        title="Удалить"
      >
        ×
      </button>
    </div>
  )
}
