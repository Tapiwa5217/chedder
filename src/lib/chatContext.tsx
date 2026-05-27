'use client';

import { createContext, useContext, useState } from 'react';

type ChatContextType = {
  openChatIds: string[];
  openChat: (userId: string) => void;
  closeChat: (userId: string) => void;
  /** Mobile full-screen messages overlay */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  activeMobileChatId: string | null;
  setActiveMobileChatId: (id: string | null) => void;
};

const ChatContext = createContext<ChatContextType>({
  openChatIds: [],
  openChat: () => {},
  closeChat: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  activeMobileChatId: null,
  setActiveMobileChatId: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [openChatIds, setOpenChatIds] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMobileChatId, setActiveMobileChatId] = useState<string | null>(null);

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
    <ChatContext.Provider value={{
      openChatIds, openChat, closeChat,
      mobileOpen, setMobileOpen,
      activeMobileChatId, setActiveMobileChatId,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => useContext(ChatContext);
