'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAccounts } from '@/hooks/useAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RefreshCw, MessageSquare, AtSign, Send, ArrowLeft } from 'lucide-react';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { toast } from 'sonner';

function ConversationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <Skeleton className={`h-10 rounded-xl ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
        </div>
      ))}
    </div>
  );
}

function ConversationSheet({ conversation, activeAccount, onClose }) {
  const [messages, setMessages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);

  const contact = conversation?.participants?.data?.find((p) => !p.email?.includes('@'))
    ?? conversation?.participants?.data?.[0];

  const loadMessages = async () => {
    if (!conversation || !activeAccount?.token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/facebook/conversations/${conversation.id}`, {
        headers: { 'x-fb-token': activeAccount.token },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(data.data ?? []);
    } catch (err) {
      toast.error(`Could not load messages: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!reply.trim() || !contact?.id) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/facebook/conversations/${conversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-fb-token': activeAccount.token },
        body: JSON.stringify({ message: reply.trim(), recipientId: contact.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReply('');
      toast.success('Reply sent');
      loadMessages();
    } catch (err) {
      toast.error(`Failed to send: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Sheet open={!!conversation} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">{contact?.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="text-sm leading-tight">{contact?.name ?? 'Unknown'}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages === null ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Load this conversation to view messages.</p>
              <Button size="sm" onClick={loadMessages} disabled={isLoading}>
                {isLoading ? 'Loading…' : 'Load messages'}
              </Button>
            </div>
          ) : isLoading ? (
            <MessageSkeleton />
          ) : (
            <div className="p-4 space-y-3">
              {[...messages].reverse().map((msg) => {
                const isOwn = msg.from?.id !== contact?.id;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[10px]">
                        {msg.from?.name?.[0]?.toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {formatRelativeTime(msg.created_time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply box */}
        <div className="border-t p-3 shrink-0">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a reply…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
            <Button
              size="icon"
              className="h-auto w-10 shrink-0 self-end"
              disabled={!reply.trim() || isSending || !contact?.id}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">Press Enter to send · Shift+Enter for newline</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function NotificationsPage() {
  const { activeAccount } = useAccounts();
  const { conversations, mentions, isLoading, error, totalUnread, refresh } = useNotifications();
  const [activeConversation, setActiveConversation] = useState(null);

  if (!activeAccount) return (
    <div className="text-muted-foreground text-sm py-12 text-center">Select an account to view notifications.</div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Messages and mentions</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Conversations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Messages
            {totalUnread > 0 && <Badge className="ml-1">{totalUnread}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => <ConversationSkeleton key={i} />)}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No messages</p>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => {
                const contact = conv.participants?.data?.find((p) => !p.email?.includes('@'))
                  ?? conv.participants?.data?.[0];
                return (
                  <button
                    key={conv.id}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                    onClick={() => setActiveConversation(conv)}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs">{contact?.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold' : 'font-medium'}`}>
                          {contact?.name ?? 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(conv.updated_time)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.snippet}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <Badge variant="default" className="shrink-0 h-5 min-w-5 text-xs">{conv.unread_count}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AtSign className="h-4 w-4 text-primary" />
            Mentions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => <ConversationSkeleton key={i} />)}
            </div>
          ) : mentions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No mentions</p>
          ) : (
            <div className="divide-y">
              {mentions.map((m) => (
                <div key={m.id} className="flex items-start gap-3 px-4 py-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs">{m.from?.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{m.from?.name ?? 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(m.created_time)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{truncate(m.message, 120)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConversationSheet
        conversation={activeConversation}
        activeAccount={activeAccount}
        onClose={() => setActiveConversation(null)}
      />
    </div>
  );
}
