/**
 * Timeline стейджей пайплайна. Принимает stages в одном из двух форматов:
 *   - live (из WS): [{ stage, status: 'running'|'done'|'error', result? }]
 *   - архив (из БД, поле message.stages): [StageTraceOut, ...]
 *
 * Для архива каждый stage уже завершён — рисуем как done или error по полю error.
 */
export default function PipelineProgress({ stages }) {
  if (!stages || stages.length === 0) return null

  return (
    <div className="mt-2 mb-1 px-1 text-[11px] space-y-0.5">
      {stages.map((s, i) => {
        const status = inferStatus(s)
        const duration = s.result?.duration_ms ?? s.duration_ms
        const meta = inferMeta(s)
        return (
          <div key={i} className="flex items-center gap-2 text-muted">
            <StatusDot status={status} />
            <span className={status === 'error' ? 'text-red-400' : ''}>{s.stage}</span>
            {duration != null && status !== 'running' && (
              <span className="text-muted/60">{duration}ms</span>
            )}
            {meta && <span className="text-muted/60">· {meta}</span>}
          </div>
        )
      })}
    </div>
  )
}

function inferStatus(s) {
  if (s.status) return s.status  // live формат
  // Архивный формат: статус по полю error.
  return s.error ? 'error' : 'done'
}

function inferMeta(s) {
  const r = s.result ?? s
  const bits = []
  if (r.providers?.length) bits.push(r.providers.join('+'))
  if (r.category) bits.push(r.category)
  if (r.complexity != null) bits.push(`${r.complexity.toFixed(2)}`)
  if (r.output_count) bits.push(`${r.output_count}out`)
  if (r.extra?.kept_of) bits.push(`${r.output_count}/${r.extra.kept_of}`)
  if (r.extra?.acceptable != null) {
    bits.push(`${r.extra.acceptable}ok/${r.extra.unacceptable}fail`)
  }
  return bits.join(' ') || null
}

function StatusDot({ status }) {
  const cls = {
    running: 'bg-accent animate-pulse',
    done: 'bg-green-500',
    error: 'bg-red-500',
  }[status] || 'bg-muted'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${cls}`} />
}
