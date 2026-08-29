import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Info, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useLegalReviewStore } from '../../store/legalReviewStore';

export const ChatAssistant: React.FC = () => {
  const { messages, selectedDocument, addMessage } = useLegalReviewStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const roleConfig: Record<
    string,
    { icon: React.ElementType; label: string; bg: string; text: string; border: string }
  > = {
    user: {
      icon: User,
      label: 'You',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-100',
    },
    assistant: {
      icon: Bot,
      label: 'Prototype AI Assistant',
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      border: 'border-slate-100',
    },
    system: {
      icon: Info,
      label: 'System',
      bg: 'bg-amber-50/60',
      text: 'text-amber-900',
      border: 'border-amber-100',
    },
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="shrink-0">
        <CardTitle>
          <MessageSquare className="h-4 w-4 text-blue-600" />
          AI Review Assistant
        </CardTitle>
        <Badge variant="warning" size="sm">
          Prototype
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Disclaimer */}
        <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-100">
          <p className="text-[10px] text-amber-700 leading-tight">
            ⚠️ This is a prototype AI assistant providing simulated responses based on keyword
            matching. It does not constitute legal advice and does not contact any external AI
            service.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400">
                {selectedDocument
                  ? 'Ask a question about the selected document.'
                  : 'Select a document to start a conversation.'}
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const config = roleConfig[msg.role] || roleConfig.system;
            const Icon = config.icon;
            return (
              <div key={msg.id} className="group">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {config.label}
                  </span>
                  <span className="text-[9px] text-slate-300 ml-auto font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`${config.bg} ${config.text} border ${config.border} rounded-lg px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="shrink-0 px-4 py-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedDocument
                  ? 'Ask about this document...'
                  : 'Select a document first...'
              }
              disabled={!selectedDocument}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!selectedDocument || !input.trim()}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              title="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[9px] text-slate-400 mt-1.5 text-center">
            Try: "What is the highest risk finding?" · "Summarize this document" · "What action should I take?"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
