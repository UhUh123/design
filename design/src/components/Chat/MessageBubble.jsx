import PipelineProgress from './PipelineProgress.jsx'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const isError = !!message.error
  const meta = formatMeta(message)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Pipeline timeline для ассистентских сообщений (живой или архивный). */}
        {!isUser && <PipelineProgress stages={message.stages} />}

        <div
          className={[
            'rounded-2xl px-4 py-3 whitespace-pre-wrap break-words leading-relaxed',
            isUser
              ? 'bg-accent text-white rounded-br-sm'
              : 'bg-surface-2 text-text rounded-bl-sm',
            isError ? 'border border-red-500/50' : '',
          ].join(' ')}
        >
          {message.content || (message.isStreaming ? <Cursor /> : null)}
          {message.isStreaming && message.content && <Cursor />}
        </div>
        {meta && (
          <div className="mt-1 text-[11px] text-muted px-1">{meta}</div>
        )}
        {isError && (
          <div className="mt-1 text-[11px] text-red-400 px-1">{message.error}</div>
        )}
      </div>
    </div>
  )
}

function Cursor() {
  return (
    <span className="inline-block w-2 h-4 bg-text/70 ml-0.5 align-middle animate-pulse" />
  )
}

function formatMeta(m) {
  if (!m.provider && !m.pipeline) return null
  const parts = []
  if (m.pipeline && m.pipeline !== 'direct') {
    parts.push(`pipeline:${m.pipeline}`)
  }
  if (m.provider) parts.push(m.provider)
  if (m.model) parts.push(m.model)
  if (m.latency_ms) parts.push(`${m.latency_ms}ms`)
  if (m.completion_tokens) parts.push(`${m.completion_tokens}tok`)
  return parts.join(' · ')
}
