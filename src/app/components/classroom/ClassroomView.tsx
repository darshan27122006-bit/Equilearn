
import React, { useState, useEffect } from 'react';
import { classroomService } from '../../utils/classroom-services';
import { Content } from '../../types';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { AssignmentList } from '../assignments/AssignmentList';
import { DoubtChat } from '../doubt/DoubtChat';
import { QuizPlayer } from '../quiz/QuizPlayer';

interface ClassroomViewProps {
    classId: string;
    role: string;
    onBack: () => void;
    onOpenLesson?: (content: Content) => void;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({ classId, role, onBack, onOpenLesson }) => {
    const [activeTab, setActiveTab] = useState('content');
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'content') {
            fetchContent();
        }
    }, [activeTab, classId]);

    const fetchContent = async () => {
        setLoading(true);
        const data = await classroomService.getClassroomContent(classId);
        setContents(data);
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-6 border-b border-border/50 pb-6">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Class 6 - <span className="text-primary italic">Science</span></h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 italic">Faculty Lead: Dr. Sharma</p>
                </div>
            </div>

            {/* Premium Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {['Content', 'Assignments', 'Doubts', 'Quizzes'].map(tab => {
                    const isActive = activeTab === tab.toLowerCase();
                    return (
                        <Button
                            key={tab}
                            variant={isActive ? 'default' : 'outline'}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-8 py-6 rounded-2xl font-black transition-all ${isActive ? 'shadow-lg shadow-primary/20 scale-105' : 'bg-card border-primary/10 hover:border-primary/30'}`}
                        >
                            {tab}
                        </Button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px] animate-in fade-in zoom-in-95 duration-500">
                {activeTab === 'content' && (
                    <Card className="card-premium border-primary/5 shadow-2xl overflow-hidden">
                        <CardHeader className="p-8 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black">Scholarly Assets</CardTitle>
                                <p className="text-sm font-medium text-muted-foreground mt-1">Foundational materials and interactive resources</p>
                            </div>
                            {role === 'teacher' && (
                                <Button className="font-black rounded-xl bg-primary text-white shadow-lg shadow-primary/20" onClick={() => alert("Upload to Class Feature (Mock)")}>
                                    + Integrate Material
                                </Button>
                            )}
                        </CardHeader>

                        <CardContent className="p-8 space-y-4">
                            {loading ? (
                                <div className="text-center py-10 animate-pulse">
                                    <BookOpen className="w-10 h-10 text-primary/30 mx-auto mb-2" />
                                    <p className="text-muted-foreground font-bold">Synchronising scholarly assets...</p>
                                </div>
                            ) : contents.length === 0 ? (
                                <div className="text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                                    <BookOpen className="w-10 h-10 text-muted/30 mx-auto mb-2" />
                                    <p className="text-muted-foreground font-bold">Digital Archive Empty</p>
                                </div>
                            ) : (
                                contents.map((item) => (
                                    <div key={item.contentId} className="p-6 rounded-2xl border border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <BookOpen className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-black group-hover:text-primary transition-colors">{item.topic}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.subject} • {item.level}</div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="font-black text-primary hover:bg-primary/10 rounded-lg"
                                            onClick={() => {
                                                if (onOpenLesson) {
                                                    onOpenLesson(item);
                                                } else {
                                                    window.location.hash = `#content-${item.contentId}`;
                                                }
                                            }}
                                        >
                                            Access Asset
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}
                {activeTab === 'assignments' && <AssignmentList role={role} />}
                {activeTab === 'doubts' && <DoubtChat classroomId={classId} />}
                {activeTab === 'quizzes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <QuizPlayer />
                    </div>
                )}
            </div>
        </div>
    );
};
