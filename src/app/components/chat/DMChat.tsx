
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Send, Paperclip, FileText, Image as ImageIcon, Video, MessageSquare } from 'lucide-react';
import { User } from '@/app/types';

interface Message {
    id: string;
    senderId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'document' | 'other';
    timestamp: string;
}

interface DMChatProps {
    currentUser: User;
    recipient: User;
    onBack?: () => void;
}

export function DMChat({ currentUser, recipient, onBack }: DMChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/dm/messages/${recipient.id}?sender_id=${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [recipient, currentUser.id]);

    useEffect(() => {
        // Scroll to bottom on new message
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() && !selectedFile) return;

        const formData = new FormData();
        formData.append('sender_id', currentUser.id);
        formData.append('receiver_id', recipient.id);
        formData.append('content', newMessage);
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/dm/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (res.ok) {
                const sentMsg = await res.json();
                setMessages([...messages, sentMsg]);
                setNewMessage('');
                setSelectedFile(null);
            } else {
                console.error("Failed to send message");
                alert("Failed to send message: " + res.statusText);
            }
        } catch (error) {
            console.error("Error sending message", error);
            alert("Error sending message");
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[600px] animate-in fade-in duration-500">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card text-card-foreground">
                <div className="flex items-center gap-3">
                    {onBack && <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10">&larr;</Button>}
                    <div>
                        <h3 className="font-bold text-foreground">{recipient.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent">Active Now</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                        <MessageSquare className="w-12 h-12 mb-3 text-primary/30" />
                        <p className="text-sm font-bold text-foreground">No messages yet</p>
                        <p className="text-[10px] uppercase font-black tracking-widest">Start a conversation with {recipient.name}</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white text-slate-900 border border-border/50 rounded-tl-none'}`}>
                                    {msg.mediaUrl && (
                                        <div className="mb-3 overflow-hidden rounded-xl bg-black/5">
                                            {msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="attachment" className="w-full object-contain max-h-64" />}
                                            {msg.mediaType === 'video' && <video src={msg.mediaUrl} controls className="w-full max-h-64" />}
                                            {msg.mediaType === 'document' && (
                                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/20 hover:bg-white/30 transition-colors rounded-xl text-inherit no-underline">
                                                    <div className="p-2 bg-white/20 rounded-lg">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest truncate">Open Document</span>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-2 block ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t bg-card">
                {selectedFile && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 rounded-2xl border border-primary/10 animate-in zoom-in-95 duration-200">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Paperclip className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs font-bold truncate flex-1">{selectedFile.name}</span>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500">X</Button>
                    </div>
                )}
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                        />
                        <Button variant="outline" size="icon" onClick={() => document.getElementById('file-upload')?.click()} className="h-12 w-12 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                    </div>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="h-12 bg-muted/40 border-none rounded-xl px-6 font-bold focus-visible:ring-primary shadow-inner"
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button onClick={handleSend} disabled={!newMessage.trim() && !selectedFile} className="h-12 w-12 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
