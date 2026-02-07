
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, Upload } from 'lucide-react';

export const AssignmentList = ({ role }: { role: string }) => {
    const assignments = [
        { id: '1', title: 'Chapter 1 Worksheet', dueDate: '2026-02-10', status: 'Pending' },
        { id: '2', title: 'Lab Report', dueDate: '2026-02-15', status: 'Submitted' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Assignments</h3>
                {role === 'teacher' && <Button size="sm"><Upload className="w-4 h-4 mr-2" /> Upload New</Button>}
            </div>
            {assignments.map(a => (
                <Card key={a.id}>
                    <CardContent className="flex justify-between items-center p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="text-blue-500" />
                            <div>
                                <div className="font-medium">{a.title}</div>
                                <div className="text-sm text-gray-500">Due: {a.dueDate}</div>
                            </div>
                        </div>
                        {role === 'student' && (
                            <Button variant={a.status === 'Submitted' ? "outline" : "default"} size="sm">
                                {a.status === 'Submitted' ? (
                                    'View Submission'
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            id={`upload-${a.id}`}
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    alert(`Submitted ${e.target.files[0].name} for ${a.title}`);
                                                    // Here we would upload to server
                                                }
                                            }}
                                        />
                                        <Button size="sm" onClick={() => document.getElementById(`upload-${a.id}`)?.click()}>
                                            <Upload className="w-4 h-4 mr-2" /> Submit Worksheet
                                        </Button>
                                    </div>
                                )}
                            </Button>
                        )}
                        {role === 'teacher' && (
                            <Button variant="outline" size="sm">View Submissions</Button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
