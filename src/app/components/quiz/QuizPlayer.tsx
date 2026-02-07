
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export const QuizPlayer = () => {
    return (
        <div className="quiz-theme animate-in zoom-in-95 duration-500">
            <Card className="card-premium border-none shadow-2xl bg-card/90 backdrop-blur-md overflow-hidden">
                <div className="h-2 w-full bg-primary" />
                <CardHeader className="text-center pb-2">
                    <Badge className="w-fit mx-auto bg-accent text-accent-foreground font-black uppercase text-[10px] tracking-widest mb-2">Challenge Mode</Badge>
                    <CardTitle className="text-3xl font-black text-foreground">Physics: The Final Frontier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="text-xs font-black uppercase text-primary mb-2 opacity-60">Question 1 of 10</div>
                        <div className="text-2xl font-bold text-foreground leading-snug">What is the fundamental unit of Force in the SI system?</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Newton', 'Joule', 'Watt', 'Pascal'].map((opt, i) => (
                            <Button
                                key={opt}
                                variant="outline"
                                className="h-16 justify-start text-left px-6 rounded-2xl border-border/50 hover:border-primary hover:bg-primary/5 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-black mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <span className="font-bold text-lg">{opt}</span>
                            </Button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-border/50">
                        <Button variant="ghost" className="font-bold text-muted-foreground">Skip for now</Button>
                        <Button className="px-10 h-12 rounded-xl font-black shadow-xl shadow-primary/20">Next Question</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
