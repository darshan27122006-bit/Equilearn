
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { User } from '@/app/types';
import { storage } from '@/app/utils/storage';

interface DMListProps {
    currentUser: User;
    onSelectUser: (user: User) => void;
}

export function DMList({ currentUser, onSelectUser }: DMListProps) {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Fetch users from backend
        // In a real app, this would exclude the current user or handle it in the backend
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/dm/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.filter((u: User) => u.id !== currentUser.id));
                }
            } catch (error) {
                console.error("Failed to fetch users", error);

                // Fallback for demo if API fails (or offline)
                const allUsers = storage.getUsers();
                setUsers(allUsers.filter((u: User) => u.id !== currentUser.id));
            }
        };
        fetchUsers();
    }, [currentUser.id]);

    return (
        <div className="p-6 space-y-6 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-xl tracking-tight uppercase">Messages</h3>
                <div className="h-1 flex-1 mx-4 bg-muted/30 rounded-full"></div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                        <div className="p-4 bg-primary/5 rounded-full">
                            <svg className="w-12 h-12 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-muted-foreground">No conversations yet</p>
                            <p className="text-xs text-muted-foreground/60">Your messages will appear here when you start a chat.</p>
                        </div>
                    </div>
                ) : (
                    users.map((user) => (
                        <Card
                            key={user.id}
                            className="cursor-pointer hover:bg-primary/5 transition-all border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md group"
                            onClick={() => onSelectUser(user)}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${user.role === 'teacher' ? 'bg-accent' : 'bg-primary/50'}`}></span>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{user.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-xl font-bold hover:bg-primary hover:text-primary-foreground">
                                    Chat
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
