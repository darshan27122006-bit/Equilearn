
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Image as ImageIcon, Mic, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    message_type: string;
    created_at: string;
}

interface DoubtChatProps {
    classroomId: string;
    threadId?: string;
    topic?: string;
}

export const DoubtChat = ({ classroomId, threadId: initialThreadId, topic }: DoubtChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [threadId, setThreadId] = useState<string | undefined>(initialThreadId);
    const [loading, setLoading] = useState(false);

    const fetchMessages = async () => {
        if (!threadId) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/doubts/threads/${threadId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Failed to fetch doubt messages", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [threadId]);

    const send = async () => {
        if (!input.trim()) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            let currentThreadId = threadId;

            // Create thread if it doesn't exist
            if (!currentThreadId) {
                const threadRes = await fetch('/api/doubts/threads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        classroom_id: classroomId,
                        topic: topic || "New Doubt"
                    })
                });
                if (threadRes.ok) {
                    const threadData = await threadRes.json();
                    currentThreadId = threadData.thread.id;
                    setThreadId(currentThreadId);
                } else {
                    throw new Error("Failed to create thread");
                }
            }

            // Send message
            const res = await fetch(`/api/doubts/threads/${currentThreadId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: input,
                    type: 'text'
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages([...messages, data.message]);
                setInput("");
            }
        } catch (error) {
            console.error("Error sending doubt message", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] border rounded-lg bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !loading && (
                    <div className="text-center text-gray-400 mt-10">
                        No messages yet. Ask your doubt below.
                    </div>
                )}
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender_id === localStorage.getItem('userId') ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${m.sender_id === localStorage.getItem('userId') ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
                <Button variant="ghost" size="icon" disabled><ImageIcon className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" disabled><Mic className="w-5 h-5" /></Button>
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a doubt..."
                    onKeyDown={e => e.key === 'Enter' && send()}
                    disabled={loading}
                />
                <Button onClick={send} size="icon" disabled={loading || !input.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    );
};
