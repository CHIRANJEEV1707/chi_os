'use client';
import { Bot, Send, CircleDot } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useWindowStore } from '@/store/windowStore';

const SUGGESTIONS = [
    "What makes you different?",
    "Tell me about your startups",
    "Why product management?",
    "What's your biggest failure?",
    "Roast your own portfolio",
    "Why should I hire you?",
    "What are your weaknesses?",
    "Tell me a joke.",
    "What is this OS built with?",
    "What are you passionate about?",
    "Where are you based?",
    "What do you do for fun?",
];

const WELCOME_TEXT = "Hey! I'm CHIRU-BOT — an AI trained to answer as Chiranjeev would. Ask me anything: about his startups, product thinking, why he'd be a great PM, or just try 'roast me' if you're feeling brave. 👾";

const getDailyLimitKey = () => `chiru-bot-count-${new Date().toISOString().split('T')[0]}`;

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isTyping?: boolean;
    isError?: boolean;
};

const UserMessage = ({ content }: { content: string }) => (
    <div className="flex justify-end">
        <div className="max-w-[80%]">
            <p className="font-headline text-[6px] text-right mr-1 text-primary/70">YOU</p>
            <div className="bg-[#002800] border border-primary p-2">
                <p className="font-body text-base text-primary whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    </div>
);

const BotMessage = ({ content, isTyping, isError }: Omit<Message, 'role' | 'id'>) => {
    return (
        <div className="flex justify-start gap-2">
            <Bot className="w-4 h-4 text-primary/80 mt-4 flex-shrink-0" />
            <div className="max-w-[80%]">
                <p className="font-headline text-[6px] text-left ml-1 text-primary/70">CHIRU</p>
                <div className="bg-[#001200] border border-green-700 p-2">
                    {isTyping ? (
                         <div className="flex items-center gap-1">
                            <span className="font-headline text-[6px] text-primary/70">PROCESSING...</span>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse [animation-delay:0ms]"></span>
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse [animation-delay:200ms]"></span>
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse [animation-delay:400ms]"></span>
                            </div>
                        </div>
                    ) : (
                         <p className={cn("font-body text-base whitespace-pre-wrap", isError ? 'text-destructive' : 'text-green-400')}>{content}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ChiruBot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [dailyCount, setDailyCount] = useState(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { play } = useSoundEffect();
    const { openWindow } = useWindowStore();
    const ContactPageComponent = getPageComponent('contact');
    const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const messageIdCounter = useRef(1);

    const [welcomeDone, setWelcomeDone] = useState(false)
    const [displayedWelcome, setDisplayedWelcome] = useState('')
    const hasRun = useRef(false)

    useEffect(() => {
        const count = parseInt(localStorage.getItem(getDailyLimitKey()) || '0');
        setDailyCount(count);
        setSuggestions(SUGGESTIONS.sort(() => 0.5 - Math.random()).slice(0, 3));
    }, []);

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true
        
        let i = 0
        const interval = setInterval(() => {
            i++
            setDisplayedWelcome(WELCOME_TEXT.slice(0, i))
            if(i % 4 === 0) play('click');
            if (i >= WELCOME_TEXT.length) {
                clearInterval(interval)
                setWelcomeDone(true)
            }
        }, 18)
        
        return () => clearInterval(interval)
    }, [play]);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages, displayedWelcome]);

    useEffect(() => {
        return () => {
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
          }
        };
      }, []);

    const streamMessage = useCallback((fullText: string, messageId: string) => {
        let index = 0;
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

        streamIntervalRef.current = setInterval(() => {
            if (index < fullText.length) {
                index++;
                if (index % 5 === 0) play('click');
                setMessages(prev => prev.map(m =>
                    m.id === messageId
                        ? { ...m, content: fullText.slice(0, index) }
                        : m
                ));
            } else {
                if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
                setMessages(prev => prev.map(m =>
                    m.id === messageId
                        ? { ...m, isTyping: false }
                        : m
                ));
            }
        }, 20);
    }, [play]);

    const handleSend = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading) return;
        
        if (dailyCount >= 20) {
            const userMessage: Message = { id: `user-${messageIdCounter.current++}`, role: 'user', content: messageContent };
            const errorMessage: Message = { id: `error-${messageIdCounter.current++}`, role: 'assistant', content: "You've used all your questions for today! Come back tomorrow or just email me directly 😄", isError: true };
            setMessages(prev => [...prev, userMessage, errorMessage]);
            return;
        }

        const userMessage: Message = { id: `user-${messageIdCounter.current++}`, role: 'user', content: messageContent };
        const botMessageId = `bot-${messageIdCounter.current++}`;
        const botTypingMessage: Message = { id: botMessageId, role: 'assistant', content: '', isTyping: true };
        
        const newApiMessages = [...messages, userMessage];
        setMessages(prev => [...prev, userMessage, botTypingMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newApiMessages.map(({role, content}) => ({role, content})).slice(-10) })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'A network error occurred.');
            }

            if (!data.message) {
                throw new Error(data.error || 'No response message from AI.');
            }

            const newDailyCount = dailyCount + 1;
            setDailyCount(newDailyCount);
            localStorage.setItem(getDailyLimitKey(), newDailyCount.toString());

            streamMessage(data.message, botMessageId);
        } catch (error: any) {
            const errorMessage = error?.message || "CONNECTION INTERRUPTED. Please try again.";
            setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, role: 'assistant', content: errorMessage, isError: true, isTyping: false } : m));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleChipClick = (chip: string) => {
        play('click');
        handleSend(chip);
        setSuggestions(prev => {
            const remaining = SUGGESTIONS.filter(s => !prev.includes(s));
            const newSuggestion = remaining[Math.floor(Math.random() * remaining.length)];
            const newChips = prev.filter(c => c !== chip);
            if(newSuggestion) newChips.push(newSuggestion);
            return newChips;
        });
    }

    return (
        <div className="h-full flex flex-col bg-[#050a05]">
            <header className="p-2 border-b-2 border-primary/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 flex items-center justify-center bg-black/30 border-2 border-primary/50 idle-bounce">
                        <Bot className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-headline text-[7px] text-primary">CHIRU-BOT v1.0</h1>
                        <div className="flex items-center gap-1.5">
                            <CircleDot className="w-3 h-3 text-green-500 animate-pulse" />
                            <span className="font-body text-sm text-primary/80">ONLINE</span>
                        </div>
                    </div>
                </div>
                <div className="mt-2 flex gap-1 overflow-x-auto pb-1 h-6 items-center">
                    {welcomeDone && suggestions.map((s,i) => (
                        <button key={i} onClick={() => handleChipClick(s)} className="font-headline text-[6px] text-primary/80 border border-primary/50 px-2 py-0.5 whitespace-nowrap hover:bg-accent hover:text-black">
                            {s}
                        </button>
                    ))}
                </div>
            </header>
            <main ref={scrollRef} className="flex-grow p-2 overflow-y-auto bg-[#000a00] space-y-4">
                 <div className="flex justify-start gap-2">
                    <Bot className="w-4 h-4 text-primary/80 mt-4 flex-shrink-0" />
                    <div className="max-w-[80%]">
                        <p className="font-headline text-[6px] text-left ml-1 text-primary/70">CHIRU</p>
                        <div className="bg-[#001200] border border-green-700 p-2">
                            <p className={cn("font-body text-base whitespace-pre-wrap text-green-400")}>
                                {displayedWelcome}
                                {!welcomeDone && <span className="animate-pulse">█</span>}
                            </p>
                        </div>
                    </div>
                </div>
                {messages.map((msg) => msg.role === 'user' ? <UserMessage key={msg.id} {...msg} /> : <BotMessage key={msg.id} {...msg} />)}
            </main>
            <footer className="p-2 border-t-2 border-primary/20 flex-shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
                    <span className="font-body text-base text-green-400">&gt;</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isLoading ? 'Waiting for response...' : 'Ask me anything...'}
                        disabled={isLoading || !welcomeDone}
                        maxLength={280}
                        className="flex-grow bg-transparent font-body text-base text-primary outline-none"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-1 border border-primary/50 text-primary disabled:opacity-50 hover:bg-accent hover:text-black">
                        <Send size={16}/>
                    </button>
                </form>
            </footer>
        </div>
    );
}

function getPageComponent(id: string): React.ComponentType | null {
  if (id === 'contact') {
    const Contact = require('./Contact').default;
    return Contact;
  }
  return null;
}
