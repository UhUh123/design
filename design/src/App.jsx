import { useState } from 'react'
import ChatWindow from './components/Chat/ChatWindow.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import ProviderStatus from './components/Sidebar/ProviderStatus.jsx'
import SettingsPanel from './components/Settings/SettingsPanel.jsx'
import { useChat } from './hooks/useChat.js'

export default function App() {
  const {
    conversations,
    activeConversation,
    activeId,
    isStreaming,
    wsStatus,
    newChat,
    selectChat,
    deleteChat,
    sendMessage,
  } = useChat()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="h-full flex bg-bg text-text">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectChat}
        onNew={newChat}
        onDelete={deleteChat}
        onOpenSettings={() => setSettingsOpen(true)}
        providerStatus={<ProviderStatus />}
      />
      <ChatWindow
        conversation={activeConversation}
        onSend={(text) => sendMessage(text)}
        isStreaming={isStreaming}
        wsStatus={wsStatus}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
