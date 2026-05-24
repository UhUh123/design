/**
 * Заглушка для управления настройками.
 *
 * Полноценная работа с API-ключами и параметрами пайплайна — Фаза 3
 * (нужны эндпоинты GET/PUT /api/settings и перезагрузка провайдеров).
 * Пока ключи живут в .env на стороне backend.
 */
export default function SettingsPanel({ open, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border rounded-2xl w-[480px] p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Настройки</h2>
          <button onClick={onClose} className="text-muted hover:text-text text-xl">
            ×
          </button>
        </div>

        <div className="space-y-3 text-sm text-muted">
          <p>
            API-ключи провайдеров сейчас читаются из <code className="text-text">.env</code>.
          </p>
          <p>
            UI для редактирования ключей появится в Фазе 3 — там же будут параметры
            пайплайна (порог сложности, число сэмплов self-consistency и т.д.).
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-surface-2 border border-border py-2 hover:border-accent transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}
