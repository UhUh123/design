import { useEffect, useRef, useState } from 'react'

export default function MessageInput({ onSend, disabled, placeholder }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Авто-высота textarea по содержимому (макс ~8 строк).
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [text])

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    if (onSend(trimmed)) {
      setText('')
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-border bg-bg px-6 py-4">
      <div className="max-w-3xl mx-auto flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder || 'Введите сообщение… (Shift+Enter — новая строка)'}
          rows={1}
          className="flex-1 resize-none rounded-xl bg-surface border border-border px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          disabled={disabled}
        />
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="rounded-xl bg-accent text-white px-4 py-3 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
        >
          Отправить
        </button>
      </div>
    </div>
  )
}
