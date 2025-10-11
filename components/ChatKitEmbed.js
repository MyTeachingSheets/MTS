import React from 'react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'

export default function ChatKitEmbed() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        const res = await fetch('/api/chatkit/session', { method: 'POST' })
        const json = await res.json()
        return json.client_secret
      }
    },
    options: {
      initialThread: null,
      theme: { colorScheme: 'light' }
    }
  })

  return <ChatKit control={control} className="h-[600px] w-full" />
}
