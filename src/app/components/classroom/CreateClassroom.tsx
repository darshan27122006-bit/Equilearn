
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { classroomService } from '../../utils/classroom-services';

interface CreateClassroomProps {
    onClose: () => void;
    onCreated: () => void;
}

export const CreateClassroom: React.FC<CreateClassroomProps> = ({ onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await classroomService.createClassroom(name, subject);
            if (result.success) {
                onCreated();
            } else {
                alert(result.error || "Failed to create classroom");
            }
        } catch (error) {
            console.error("Creation error:", error);
            alert("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto card-premium border-none shadow-2xl overflow-hidden">
            <div className="p-8 bg-primary text-primary-foreground">
                <CardTitle className="text-2xl font-black">Initialise Classroom</CardTitle>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/70 mt-1">Create a new pedagogical unit</p>
            </div>
            <form onSubmit={handleSubmit}>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Class Designation</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Theoretical Physics | Year 1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-12 rounded-xl bg-muted/20 border-none font-bold placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Core Discipline</Label>
                        <Input
                            id="subject"
                            placeholder="e.g. Physics"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            className="h-12 rounded-xl bg-muted/20 border-none font-bold placeholder:text-muted-foreground/50"
                        />
                    </div>
                </CardContent>
                <CardFooter className="p-8 bg-muted/10 flex flex-col gap-3">
                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                        {isSubmitting ? 'Initialising...' : 'Confirm Infrastructure'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose} className="w-full font-black text-muted-foreground hover:text-foreground">Abort Process</Button>
                </CardFooter>
            </form>
        </Card>
    );
};
