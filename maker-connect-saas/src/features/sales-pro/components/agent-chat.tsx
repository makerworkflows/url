
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { salesAgent } from '../agent/service'; // Note: In Next.js client component, we'd typically use a Server Action or API route

// Mocking server action for client demo
async function chatAction(query: string) {
  // In a real app, this would be fetch('/api/sales-agent', ...)
  return await salesAgent.chatWithAgent(query);
}

interface Message {
  role: 'user' | 'agent';
  text: string;
}

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: 'Hello! I am your AI Sales Assistant. How can I help you close deals today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAction(userMsg.text);
      setMessages(prev => [...prev, { role: 'agent', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md h-[600px] flex flex-col shadow-xl border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          SalesPro AI Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-purple-50 text-purple-900'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center text-gray-400 text-sm ml-10">
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-gray-50 flex gap-2">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about leads, pipeline..."
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="bg-white"
          />
          <Button onClick={handleSend} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
