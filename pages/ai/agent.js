import dynamic from 'next/dynamic'
import ChatKitEmbed from '../../components/ChatKitEmbed'

export default function AIAgentPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>AI Agent Chat</h1>
      <p>Use the agent workflow to generate worksheets, ask questions, and perform actions.</p>
      <div style={{ height: 600, maxWidth: 800 }}>
        <ChatKitEmbed />
      </div>
    </div>
  )
}
