'use client';

import { use, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import Avatar from '@/components/Avatar';
import { ArrowLeft, Send, Users, BookOpen, UserPlus, LogOut, Crown } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser, groups, users, sendGroupMessage, joinGroup, leaveGroup, inviteToGroup } = useApp();

  const group = groups.find((g) => g.id === id);
  const [input, setInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [group?.messages.length]);

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Group not found.</p>
        <Link href="/groups" className="text-sm text-amber-500 hover:underline mt-2 inline-block">← Back to groups</Link>
      </div>
    );
  }

  const isAdmin = group.adminId === currentUser.id;
  const isMember = group.memberIds.includes(currentUser.id);
  const memberUsers = group.memberIds.map((uid) => users.find((u) => u.id === uid)).filter(Boolean);

  // Users you follow who aren't in the group yet
  const invitableUsers = users.filter(
    (u) => currentUser.following.includes(u.id) && !group.memberIds.includes(u.id)
  );

  const handleSend = async () => {
    if (!input.trim() || !isMember) return;
    await sendGroupMessage(group.id, input.trim());
    setInput('');
  };

  const handleLeave = async () => {
    if (isAdmin && group.memberIds.length > 1) {
      alert('Transfer admin to another member before leaving.');
      return;
    }
    await leaveGroup(group.id);
    window.location.href = '/groups';
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <Link href="/groups" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          {group.book?.coverUrl ? (
            <img src={group.book.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Users className="w-5 h-5 text-amber-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">{group.name}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}</span>
            {group.book && (
              <Link href={`/books/${group.book.id}`} className="flex items-center gap-1 text-amber-500 hover:underline truncate">
                <BookOpen className="w-3 h-3" /> {group.book.title}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showMembers ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <Users className="w-4 h-4" />
          </button>
          {isMember && !isAdmin && (
            <button onClick={handleLeave} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Chat */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Join banner for non-members */}
          {!isMember && group.isPublic && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Join this group</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Join to participate in the discussion</p>
              </div>
              <button
                onClick={() => joinGroup(group.id)}
                className="flex items-center gap-2 text-sm px-5 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors flex-shrink-0"
              >
                <UserPlus className="w-4 h-4" /> Join group
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3 mb-3">
            {group.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{group.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs leading-relaxed">
                  {group.description ?? 'No messages yet. Be the first to start the conversation!'}
                </p>
              </div>
            ) : (
              <>
                {group.messages.map((msg) => {
                  const sender = users.find((u) => u.id === msg.senderId);
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && sender && (
                        <div className="flex-shrink-0 mt-0.5">
                          <Avatar initials={sender.avatar} size="sm" colorSeed={sender.id} avatarUrl={sender.avatarUrl} />
                        </div>
                      )}
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                        {!isMe && sender && (
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">{sender.name}</span>
                        )}
                        <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? 'bg-amber-500 text-white rounded-2xl rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-300 dark:text-gray-600 px-1">{timeAgo(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          {isMember ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Avatar initials={currentUser.avatar} size="sm" colorSeed={currentUser.id} avatarUrl={currentUser.avatarUrl} />
              <div className="flex-1 flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 gap-2 shadow-sm">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={`Message ${group.name}…`}
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-2">
              {group.isPublic ? 'Join the group to send messages' : 'This is a private group'}
            </p>
          )}
        </div>

        {/* Members sidebar */}
        {showMembers && (
          <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Members ({group.memberIds.length})
              </h3>
              {isAdmin && (
                <button
                  onClick={() => setShowInvite(!showInvite)}
                  className="text-xs text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" /> Invite
                </button>
              )}
            </div>

            {/* Invite panel */}
            {showInvite && invitableUsers.length > 0 && (
              <div className="mb-3 space-y-1">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">People you follow</p>
                {invitableUsers.slice(0, 5).map((u) => (
                  <button
                    key={u.id}
                    onClick={async () => { await inviteToGroup(group.id, u.id); }}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <Avatar initials={u.avatar} size="sm" colorSeed={u.id} avatarUrl={u.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                    </div>
                    <span className="text-xs text-amber-500 font-medium flex-shrink-0">Add</span>
                  </button>
                ))}
                <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-1">
              {memberUsers.map((u) => {
                if (!u) return null;
                const isGroupAdmin = u.id === group.adminId;
                return (
                  <Link
                    key={u.id}
                    href={u.id === currentUser.id ? '/profile' : `/profile/${u.username}`}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Avatar initials={u.avatar} size="sm" colorSeed={u.id} avatarUrl={u.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">@{u.username}</p>
                    </div>
                    {isGroupAdmin && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
