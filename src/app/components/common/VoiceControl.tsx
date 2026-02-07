
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Mic, Volume2 } from 'lucide-react';

export const VoiceControl = () => {
    const [isListening, setIsListening] = useState(false);

    const toggleListen = () => {
        setIsListening(!isListening);
        // Integrate Speech Recognition here
    };

    const speak = (text: string) => {
        // Integrate TTS here
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="fixed bottom-4 right-4 flex gap-2">
            <Button
                variant="default"
                className={`rounded-full h-12 w-12 p-0 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`}
                onClick={toggleListen}
            >
                <Mic className="h-6 w-6 text-white" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12 w-12 p-0 shadow-lg"
                onClick={() => speak("This is a test of text to speech.")}
            >
                <Volume2 className="h-6 w-6" />
            </Button>
        </div>
    );
};
