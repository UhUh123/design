import { useEffect, useRef, useState } from 'react'
import { WS_BASE } from '../config.js'

/**
 * Управляет одним WebSocket-соединением с авто-реконнектом.
 * onMessage вызывается на каждое входящее JSON-сообщение от сервера.
 */
export function useWebSocket(path, onMessage) {
  const wsRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const [status, setStatus] = useState('connecting') // connecting | open | closed

  // Держим актуальный коллбэк без переподключения WS при изменении.
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!path) {
      // Чат ещё не выбран — соединение не нужно.
      setStatus('closed')
      return
    }

    let closedByUs = false
    let reconnectTimer = null

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}${path}`)
      wsRef.current = ws
      setStatus('connecting')

      ws.onopen = () => setStatus('open')
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data)
          onMessageRef.current?.(msg)
        } catch (e) {
          console.error('WS parse error', e, evt.data)
        }
      }
      ws.onclose = () => {
        setStatus('closed')
        if (!closedByUs) {
          reconnectTimer = setTimeout(connect, 2000)
        }
      }
      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      closedByUs = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      wsRef.current?.close()
    }
  }, [path])

  const send = (data) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
      return true
    }
    return false
  }

  return { status, send }
}
