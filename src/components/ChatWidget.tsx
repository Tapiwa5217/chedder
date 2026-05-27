'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { useChatContext } from '@/lib/chatContext';
import Avatar from './Avatar';
import { MessageSquare, PenLine, X, Send, ChevronDown, ChevronUp } from 'lucide-react';

function ChatWindow({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { getUserById, currentUser, getConversation, sendMessage, markConversationRead } = useApp();
  const user = getUserById(userId);
  const conv = getConversation(userId);
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark conversation as read when window is open and receiving messages
  useEffect(() => {
    if (conv?.id && !minimized) {
      markConversationRead(conv.id);
    }
  }, [conv?.id, conv?.messages.length, minimized, markConversationRead]);

  useEffect(() => {
    if (!minimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages.length, minimized]);

  // Pre-fill from share-to-DM
  useEffect(() => {
    const key = `chat_prefill_${userId}`;
    const prefill = sessionStorage.getItem(key);
    if (prefill) {
      setInput(prefill);
      sessionStorage.removeItem(key);
    }
  }, [userId]);

  if (!user) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(userId, input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col w-72 bg-white dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-t-2xl"
        onClick={() => setMinimized(!minimized)}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Avatar initials={user.avatar} size="sm" colorSeed={user.id} avatarUrl={user.avatarUrl} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{user.name}</p>
            <p className="text-xs text-emerald-500">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="h-72 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50/50 dark:bg-gray-800/50">
            {(!conv || conv.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Avatar initials={user.avatar} size="lg" colorSeed={user.id} avatarUrl={user.avatarUrl} />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-3">{user.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[180px] leading-relaxed">
                  Start a conversation about books you're both reading!
                </p>
              </div>
            )}
            {conv?.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-3.5 py-2 text-sm leading-relaxed ${
                      isMe
                        ? 'bg-amber-500 text-white rounded-2xl rounded-br-sm'
                        : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Write a message..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ChatWidget() {
  const { currentUser, users, conversations, getUnreadCount } = useApp();
  const { openChatIds, openChat: openChatCtx, closeChat } = useChatContext();
  const [listOpen, setListOpen] = useState(false);

  const myConversations = conversations.filter((c) => c.participantIds.includes(currentUser.id));
  const unreadCount = getUnreadCount();

  const openChat = (userId: string) => {
    openChatCtx(userId);
    setListOpen(false);
  };

  return (
    <div className="fixed bottom-0 right-6 z-50 flex items-end gap-2">
      {/* Open chat windows */}
      {openChatIds.map((userId) => (
        <ChatWindow key={userId} userId={userId} onClose={() => closeChat(userId)} />
      ))}

      {/* Messaging launcher */}
      <div className="w-72 bg-white dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setListOpen(!listOpen)}
          onKeyDown={(e) => e.key === 'Enter' && setListOpen(!listOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-t-2xl cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Messaging</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="New message"
            >
              <PenLine className="w-4 h-4" />
            </button>
            {listOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {listOpen && (
          <div className="border-t border-gray-100 dark:border-gray-700 max-h-80 overflow-y-auto">
            {/* Search */}
            <div className="px-3 py-2">
              <input
                placeholder="Search messages..."
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5 text-xs outline-none focus:ring-2 focus:ring-amber-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Conversation list */}
            {myConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
                <p className="text-xs">No messages yet</p>
              </div>
            ) : (
              myConversations.map((conv) => {
                const otherId = conv.participantIds.find((id) => id !== currentUser.id)!;
                const other = users.find((u) => u.id === otherId);
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isOpen = openChatIds.includes(otherId);

                if (!other) return null;

                return (
                  <button
                    key={conv.id}
                    onClick={() => openChat(otherId)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                      isOpen ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar initials={other.avatar} size="sm" colorSeed={other.id} avatarUrl={other.avatarUrl} />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white dark:border-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{other.name}</p>
                        {lastMsg && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {Math.floor(
                              (Date.now() - new Date(lastMsg.createdAt).getTime()) / 3600000
                            )}h
                          </p>
                        )}
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {lastMsg.senderId === currentUser.id ? 'You: ' : ''}
                          {lastMsg.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}

            {/* Start new conversation */}
            <div className="px-3 py-2 border-t border-gray-50 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Start a chat
              </p>
              <div className="space-y-1">
                {users
                  .filter((u) => u.id !== currentUser.id && !myConversations.some(
                    (c) => c.participantIds.includes(u.id)
                  ))
                  .slice(0, 3)
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => openChat(u.id)}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <Avatar initials={u.avatar} size="sm" colorSeed={u.id} avatarUrl={u.avatarUrl} />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{u.name}</p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
