import { useCallback, useEffect, useState } from 'react'

import { conversationsApi } from '../api/conversations.js'
import { useWebSocket } from './useWebSocket.js'

/**
 * Управляет conversations через REST API и отвечает за стриминг через WebSocket.
 *
 * Состояние:
 *   conversations  — список из /api/conversations (без сообщений)
 *   activeId       — id текущего чата
 *   activeMessages — сообщения активного чата из БД
 *   pending        — оптимистичная пара (user, streaming assistant), пока ответ генерируется.
 *                    После события done — refetch из БД и pending=null.
 */
export function useChat() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [activeMessages, setActiveMessages] = useState([])
  const [pending, setPending] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // === Загрузка списка на mount ===
  useEffect(() => {
    ;(async () => {
      try {
        let list = await conversationsApi.list()
        if (!list || list.length === 0) {
          const c = await conversationsApi.create(null)
          list = [c]
        }
        setConversations(list)
        setActiveId(list[0].id)
      } catch (e) {
        console.error('Failed to load conversations:', e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  // === При смене активного чата — подтягиваем сообщения ===
  useEffect(() => {
    if (!activeId) {
      setActiveMessages([])
      return
    }
    setPending(null)
    conversationsApi
      .messages(activeId)
      .then(setActiveMessages)
      .catch((e) => console.error('Failed to load messages:', e))
  }, [activeId])

  // === WS обработчик ===
  const handleWs = useCallback(
    (msg) => {
      if (msg.type === 'token') {
        setPending((p) =>
          p ? { ...p, assistantText: p.assistantText + msg.content } : p,
        )
      } else if (msg.type === 'stage_start') {
        setPending((p) => {
          if (!p) return p
          return {
            ...p,
            stages: [...(p.stages ?? []), { stage: msg.stage, status: 'running' }],
          }
        })
      } else if (msg.type === 'stage_done') {
        setPending((p) => {
          if (!p) return p
          const stages = [...(p.stages ?? [])]
          // Обновляем последний running-стейдж с этим именем.
          for (let i = stages.length - 1; i >= 0; i--) {
            if (stages[i].stage === msg.stage && stages[i].status === 'running') {
              stages[i] = {
                ...stages[i],
                status: msg.result?.error ? 'error' : 'done',
                result: msg.result,
              }
              break
            }
          }
          return { ...p, stages }
        })
      } else if (msg.type === 'done') {
        // Сообщение уже в БД — обновляем источник истины.
        if (activeId) {
          conversationsApi.messages(activeId).then(setActiveMessages).catch(() => {})
          conversationsApi.list().then(setConversations).catch(() => {})
        }
        setPending(null)
      } else if (msg.type === 'error') {
        setPending((p) =>
          p ? { ...p, error: msg.message, isStreaming: false } : p,
        )
      }
    },
    [activeId],
  )

  const { status: wsStatus, send: wsSend } = useWebSocket(
    activeId ? `/ws/chat/${activeId}` : null,
    handleWs,
  )

  // === Действия ===

  const sendMessage = useCallback(
    (text, opts = {}) => {
      if (!text.trim() || pending || !activeId || wsStatus !== 'open') return false
      setPending({
        userText: text,
        assistantText: '',
        isStreaming: true,
        error: null,
        stages: [],
      })
      return wsSend({
        type: 'message',
        content: text,
        provider: opts.provider || null,
        model: opts.model || null,
        pipeline: opts.pipeline || 'auto',
      })
    },
    [activeId, pending, wsSend, wsStatus],
  )

  const newChat = useCallback(async () => {
    try {
      const c = await conversationsApi.create(null)
      setConversations((prev) => [c, ...prev])
      setActiveId(c.id)
    } catch (e) {
      console.error('Failed to create chat:', e)
    }
  }, [])

  const deleteChat = useCallback(
    async (id) => {
      try {
        await conversationsApi.delete(id)
        setConversations((prev) => {
          const next = prev.filter((c) => c.id !== id)
          if (id === activeId) {
            setActiveId(next[0]?.id ?? null)
          }
          return next
        })
      } catch (e) {
        console.error('Failed to delete chat:', e)
      }
    },
    [activeId],
  )

  const selectChat = useCallback((id) => setActiveId(id), [])

  const renameChat = useCallback(async (id, title) => {
    try {
      const updated = await conversationsApi.rename(id, title)
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch (e) {
      console.error('Failed to rename chat:', e)
    }
  }, [])

  // === Сборка списка для рендера: реальные + pending (если есть) ===
  const messagesForRender = pending
    ? [
        ...activeMessages,
        { id: '__pending_user', role: 'user', content: pending.userText },
        {
          id: '__pending_assistant',
          role: 'assistant',
          content: pending.assistantText,
          isStreaming: pending.isStreaming,
          error: pending.error,
          stages: pending.stages,
        },
      ]
    : activeMessages

  const activeConversation = activeId
    ? {
        ...(conversations.find((c) => c.id === activeId) ?? { id: activeId, title: '' }),
        messages: messagesForRender,
      }
    : null

  return {
    conversations,
    activeConversation,
    activeId,
    isStreaming: !!pending?.isStreaming,
    isLoading,
    wsStatus,
    newChat,
    selectChat,
    deleteChat,
    renameChat,
    sendMessage,
  }
}
