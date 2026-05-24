import { API_BASE } from '../config.js'

async function json(method, path, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) {
    throw new Error(`${method} ${path} → ${r.status} ${r.statusText}`)
  }
  if (r.status === 204) return null
  return r.json()
}

export const conversationsApi = {
  list: () => json('GET', '/api/conversations'),
  create: (title) => json('POST', '/api/conversations', { title: title ?? null }),
  rename: (id, title) => json('PATCH', `/api/conversations/${id}`, { title }),
  delete: (id) => json('DELETE', `/api/conversations/${id}`),
  messages: (id) => json('GET', `/api/conversations/${id}/messages`),
}
