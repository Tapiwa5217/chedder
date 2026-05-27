'use client';

import { createContext, useContext, useState } from 'react';

type ChatContextType = {
  openChatIds: string[];
  openChat: (userId: string) => void;
  closeChat: (userId: string) => void;
};

const ChatContext = createContext<ChatContextType>({
  openChatIds: [],
  openChat: () => {},
  closeChat: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [openChatIds, setOpenChatIds] = useState<string[]>([]);

  const openChat = (userId: string) => {
    setOpenChatIds((prev) => {
      if (prev.includes(userId)) return prev;
      return [...prev.slice(-1), userId]; // max 2 open at once
    });
  };

  const closeChat = (userId: string) => {
    setOpenChatIds((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <ChatContext.Provider value={{ openChatIds, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => useContext(ChatContext);
