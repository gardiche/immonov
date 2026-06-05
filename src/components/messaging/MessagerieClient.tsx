'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Message { id: string; content: string; sender_id: string; created_at: string }

export default function MessagerieClient({
  conversations,
  currentUserId,
}: {
  conversations: any[]
  currentUserId: string
}) {
  const supabase = createClient()
  const [activeConv, setActiveConv] = useState<any | null>(conversations[0] ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeConv) return
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', activeConv.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))

    const channel = supabase
      .channel(`conv:${activeConv.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConv?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !activeConv) return
    setSending(true)
    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: currentUserId,
      content: input.trim(),
    })
    setInput('')
    setSending(false)
  }

  if (conversations.length === 0) {
    return (
      <div className="card-immo p-12 text-center text-gray-400">
        Aucune conversation pour l'instant.
      </div>
    )
  }

  return (
    <div className="card-immo overflow-hidden flex" style={{ height: '600px' }}>
      {/* Liste conversations */}
      <div className="w-72 border-r border-[color:var(--border)] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[color:var(--border)]">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Conversations</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((conv) => {
            const other = conv.profiles
            const isActive = activeConv?.id === conv.id

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`w-full text-left p-4 border-b border-[color:var(--border)] hover:bg-gray-50 transition-colors ${isActive ? 'bg-[#4A6FD4]/5 border-l-2 border-l-[#4A6FD4]' : ''}`}
              >
                <p className="text-sm font-semibold text-[#1B2A4A]">
                  {other?.first_name} {other?.last_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{conv.properties?.title}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {activeConv && (
          <div className="p-4 border-b border-[color:var(--border)] bg-white">
            <p className="font-semibold text-[#1B2A4A] text-sm">{activeConv.properties?.title}</p>
            <p className="text-xs text-gray-500">{activeConv.properties?.city}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[color:var(--off-white)]">
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${isMine ? 'bg-[#1B2A4A] text-white rounded-br-sm' : 'bg-white border border-[color:var(--border)] text-gray-700 rounded-bl-sm'}`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-white/50' : 'text-gray-400'}`}>
                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-[color:var(--border)] bg-white flex gap-2">
          <input
            className="input flex-1"
            placeholder="Votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="btn-primary px-4 py-2 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
