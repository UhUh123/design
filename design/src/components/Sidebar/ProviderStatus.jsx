import { useProviderStatus } from '../../hooks/useProviderStatus.js'

export default function ProviderStatus() {
  const { providers, online } = useProviderStatus()

  if (!online) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted px-2">
        <Dot color="bg-red-500" />
        Backend offline
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted px-2">
        <Dot color="bg-yellow-500" />
        Нет провайдеров
      </div>
    )
  }

  return (
    <div className="space-y-1 px-2">
      {providers.map((p) => (
        <div key={p.name} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Dot color={p.capacity.available ? 'bg-green-500' : 'bg-yellow-500'} />
            <span className="text-text">{p.name}</span>
          </div>
          <span className="text-muted" title={JSON.stringify(p.capacity, null, 2)}>
            {formatCapacity(p.capacity)}
          </span>
        </div>
      ))}
    </div>
  )
}

function Dot({ color }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
}

function formatCapacity(cap) {
  // Самое жёстко-ограниченное измерение определяет, что показать.
  if (cap.requests_remaining_minute !== null) {
    return `${cap.requests_remaining_minute}/min`
  }
  if (cap.requests_remaining_day !== null) {
    return `${cap.requests_remaining_day}/day`
  }
  return '∞'
}
