import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'
import MessageInput from './MessageInput.jsx'

export default function ChatWindow({ conversation, onSend, isStreaming, wsStatus }) {
  const scrollRef = useRef(null)

  // Авто-скролл вниз при добавлении/обновлении сообщений.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [conversation?.messages])

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        Создайте новый чат, чтобы начать
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {conversation.messages.length === 0 ? (
            <div className="text-center text-muted mt-20">
              <div className="text-2xl font-light mb-2">vpopus</div>
              <div className="text-sm">Спросите что-нибудь…</div>
            </div>
          ) : (
            conversation.messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))
          )}
        </div>
      </div>
      <MessageInput
        onSend={onSend}
        disabled={isStreaming || wsStatus !== 'open'}
        placeholder={
          wsStatus !== 'open'
            ? 'Соединение с backend…'
            : isStreaming
              ? 'Жду ответ…'
              : undefined
        }
      />
    </div>
  )
}
