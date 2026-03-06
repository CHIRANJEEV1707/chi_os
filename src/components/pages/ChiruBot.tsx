'use client';
import { Bot, Send, CircleDot } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useUiStore } from '@/store/uiStore';

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

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: "Hey! I'm CHIRU-BOT — an AI trained to answer as Chiranjeev would. Ask me anything: about his startups, product thinking, why he'd be a great PM, or just try 'roast me' if you're feeling brave. 👾",
  isError: false,
};

const getDailyLimitKey = () => `chiru-bot-count-${new Date().toISOString().split('T')[0]}`;

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isTyping?: boolean;
    isError?: boolean;
};

const BotAvatar = ({ isRoasting, isTyping, className }: { isRoasting: boolean; isTyping: boolean; className?: string }) => {
  const animationStyle = isTyping ? { animation: 'pulse 0.8s infinite alternate' } : { animation: 'bounce 2s infinite' };

  return (
    <div
      style={{
        width: 48,
        height: 48,
        border: '2px solid hsl(var(--primary))',
        background: '#001a00',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        transition: 'all 0.3s ease',
        ...animationStyle,
      }}
      className={className}
    >
      {isRoasting ? '😈' : isTyping ? '🤔' : '🤖'}
    </div>
  );
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
                <div className={cn("border p-2", isError ? 'bg-red-900/50 border-destructive' : 'bg-[#001200] border-green-700')}>
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
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isRoasting, setIsRoasting] = useState(false);
    const [dailyCount, setDailyCount] = useState(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { triggerGlitch } = useUiStore();
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const messageIdCounter = useRef(1);
    const { play } = useSoundEffect();

    useEffect(() => {
        const count = parseInt(localStorage.getItem(getDailyLimitKey()) || '0');
        setDailyCount(count);
        setSuggestions(SUGGESTIONS.sort(() => 0.5 - Math.random()).slice(0, 3));
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    useEffect(() => {
        return () => {
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
          }
        };
      }, []);

    const isRoastMessage = (text: string) => {
        const lower = text.toLowerCase().trim();
        return lower.includes('roast') || lower === 'roast me' || lower.includes('roast your portfolio');
    };

    const getNewSuggestions = useCallback((usedChip?: string) => {
        const currentChips = usedChip ? suggestions.filter(s => s !== usedChip) : suggestions;
        let pool = SUGGESTIONS.filter(s => !currentChips.includes(s));
        
        const newSuggestions = [...currentChips];
        while (newSuggestions.length < 3 && pool.length > 0) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            const newChip = pool.splice(randomIndex, 1)[0];
            if(newChip) newSuggestions.push(newChip);
        }
        setSuggestions(newSuggestions.filter(s => s !== usedChip).slice(0, 3));
    }, [suggestions]);

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
                setIsBotTyping(false);
                if (isRoasting) {
                    setTimeout(() => setIsRoasting(false), 4000);
                }
                setMessages(prev => prev.map(m =>
                    m.id === messageId
                        ? { ...m, isTyping: false }
                        : m
                ));
                getNewSuggestions();
            }
        }, 20);
    }, [play, isRoasting, getNewSuggestions]);

    const handleSend = async (messageContent: string) => {
        if (!messageContent.trim() || isBotTyping) return;
        
        if (dailyCount >= 20) {
            const userMessage: Message = { id: `user-${messageIdCounter.current++}`, role: 'user', content: messageContent };
            const errorMessage: Message = { id: `error-${messageIdCounter.current++}`, role: 'assistant', content: "You've used all your questions for today! Come back tomorrow or just email me directly 😄", isError: true };
            setMessages(prev => [...prev, userMessage, errorMessage]);
            return;
        }
        
        if (isRoastMessage(messageContent)) {
            setIsRoasting(true);
            play('error');
            triggerGlitch(600);
        }

        const userMessage: Message = { id: `user-${messageIdCounter.current++}`, role: 'user', content: messageContent };
        const botMessageId = `bot-${messageIdCounter.current++}`;
        const botTypingMessage: Message = { id: botMessageId, role: 'assistant', content: '', isTyping: true };
        
        const newApiMessages = [...messages, userMessage];
        setMessages(prev => [...prev, userMessage, botTypingMessage]);
        setInput('');
        setIsBotTyping(true);

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

            streamMessage(data.message, botMessageId);

            const newDailyCount = dailyCount + 1;
            setDailyCount(newDailyCount);
            localStorage.setItem(getDailyLimitKey(), newDailyCount.toString());

        } catch (error: any) {
            const errorMessage = error?.message?.includes('decommissioned')
                ? 'Model unavailable. Please try again.'
                : error?.message?.includes('API key')
                ? 'Configuration error. Contact Chiranjeev directly!'
                : 'CONNECTION INTERRUPTED. Please try again.';

            setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: errorMessage, isError: true, isTyping: false } : m));
            setIsBotTyping(false);
            if (isRoasting) setIsRoasting(false);
        }
    };
    
    const handleChipClick = (chip: string) => {
        play('click');
        handleSend(chip);
        getNewSuggestions(chip);
    }

    return (
        <div className="h-full flex flex-col bg-[#050a05]">
            <header className="p-2 border-b-2 border-primary/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <BotAvatar isRoasting={isRoasting} isTyping={isBotTyping} />
                    <div>
                        <h1 className="font-headline text-[7px] text-primary">CHIRU-BOT v1.0</h1>
                        <div className="flex items-center gap-1.5">
                            <CircleDot className="w-3 h-3 text-green-500 animate-pulse" />
                            <span className="font-body text-sm text-primary/80">ONLINE</span>
                        </div>
                    </div>
                </div>
                 {!isBotTyping && (
                    <div className="mt-2 flex gap-1 overflow-x-auto pb-1 h-6 items-center transition-opacity duration-300">
                        {suggestions.map((s,i) => (
                            <button key={i} onClick={() => handleChipClick(s)} className="font-headline text-[6px] text-primary/80 border border-primary/50 px-2 py-0.5 whitespace-nowrap hover:bg-accent hover:text-black active:bg-primary active:text-black">
                                {s}
                            </button>
                        ))}
                    </div>
                 )}
            </header>
            <main ref={scrollRef} className="flex-grow p-2 overflow-y-auto bg-[#000a00] space-y-4">
                {messages.map((msg) => msg.role === 'user' ? <UserMessage key={msg.id} {...msg} /> : <BotMessage key={msg.id} {...msg} />)}
            </main>
            <footer className="p-2 border-t-2 border-primary/20 flex-shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
                    <span className="font-body text-base text-green-400">&gt;</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isBotTyping ? 'Waiting for response...' : 'Ask me anything...'}
                        disabled={isBotTyping}
                        maxLength={280}
                        className="flex-grow bg-transparent font-body text-base text-primary outline-none"
                    />
                    <button type="submit" disabled={isBotTyping || !input.trim()} className="p-1 border border-primary/50 text-primary disabled:opacity-50 hover:bg-accent hover:text-black">
                        <Send size={16}/>
                    </button>
                </form>
            </footer>
        </div>
    );
}
