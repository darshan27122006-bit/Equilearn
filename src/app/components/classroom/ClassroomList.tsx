
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Users, BookOpen } from 'lucide-react';
import { classroomService, Classroom } from '../../utils/classroom-services';

interface ClassroomListProps {
    role: 'teacher' | 'student' | 'admin';
    onSelectClassroom: (id: string) => void;
    onCreateClassroom?: () => void;
    onJoinClassroom?: () => void;
}

export const ClassroomList: React.FC<ClassroomListProps> = ({
    role,
    onSelectClassroom,
    onCreateClassroom,
    onJoinClassroom
}) => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassrooms = async () => {
            setLoading(true);
            const data = await classroomService.getClassrooms();
            setClassrooms(data);
            setLoading(false);
        };
        fetchClassrooms();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tight text-foreground">My <span className="text-primary italic">Classrooms</span></h2>
                <div className="flex gap-2">
                    {role === 'teacher' && (
                        <Button onClick={onCreateClassroom} className="font-black px-6 rounded-xl shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" /> Create Class
                        </Button>
                    )}
                    {role === 'student' && (
                        <Button onClick={onJoinClassroom} variant="outline" className="font-black px-6 rounded-xl border-2 hover:bg-primary hover:text-white transition-all">
                            <Users className="h-4 w-4 mr-2" /> Join Class
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((cls) => (
                    <Card key={cls.id} className="card-premium group cursor-pointer border-primary/5 active:scale-[0.98] transition-all" onClick={() => onSelectClassroom(cls.id)}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center">
                                <span className="text-xl font-black group-hover:text-primary transition-colors">{cls.name}</span>
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">{cls.subject}</div>
                            <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                <Users className="h-3 w-3 mr-2" />
                                {cls.studentCount} Active Participants
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {classrooms.length === 0 && (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                    <Users className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                    <p className="text-xl font-bold text-muted-foreground">No classrooms found.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {role === 'teacher' ? 'Create one to get started!' : 'Ask your admin to enroll you!'}
                    </p>
                </div>
            )}
        </div>
    );
};
