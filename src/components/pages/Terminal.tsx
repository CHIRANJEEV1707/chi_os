'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { DESKTOP_ICONS } from '@/lib/data';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { getPageComponent } from '.';

const sections = DESKTOP_ICONS.map(icon => icon.id.replace('.exe', '').replace('/', ''));
const games = ['snake', 'minesweeper', 'pong', 'tetris', 'invaders'];
const allCommands = ['help', 'ls', 'open', 'whoami', 'skills', 'contact', 'github', 'linkedin', 'resume', 'play', 'clear', 'reboot', 'matrix', 'sudo', 'hire'];


const MatrixEffect = ({ onClose }: { onClose: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            drops = Array(Math.floor(width / fontSize)).fill(1).map((_, i) => i * fontSize);
        };
        window.addEventListener('resize', handleResize);

        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const characters = katakana + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 18;
        let drops = Array(Math.floor(width / fontSize)).fill(1).map((_, i) => i * fontSize);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#00ff41';
            ctx.font = `${fontSize}px VT323`;
            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const intervalId = setInterval(draw, 33);
        
        const handleExit = () => onClose();
        window.addEventListener('keydown', handleExit);
        window.addEventListener('click', handleExit);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleExit);
            window.removeEventListener('click', handleExit);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[9999]">
            <canvas ref={canvasRef} className="w-full h-full" />
            <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-headline text-primary animate-pulse">Press any key to exit</p>
        </div>
    );
};


const ConfettiEffect = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const colors = ['#00FF41', '#39FF14', '#00B32C'];

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {Array.from({ length: 150 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        animationDuration: `${Math.random() * 3 + 2}s`,
                        animationDelay: `${Math.random() * 2}s`,
                    }}
                />
            ))}
        </div>
    );
};


export default function Terminal() {
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { openWindow } = useWindowStore();
    const { play } = useSoundEffect();

    const [input, setInput] = useState('');
    const [output, setOutput] = useState<React.ReactNode[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showMatrix, setShowMatrix] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const history = useRef<string[]>([]);
    const historyIndex = useRef<number>(0);

    const addOutput = (content: React.ReactNode | React.ReactNode[]) => {
        setOutput(prev => [...prev, ...(Array.isArray(content) ? content : [content])]);
    };

    const addError = (message: string) => {
        addOutput(<p className="text-destructive">{message}</p>);
    };

    const runCommand = useCallback(async (commandStr: string) => {
        if (history.current[history.current.length - 1] !== commandStr) {
            history.current.push(commandStr);
        }
        historyIndex.current = history.current.length;
        if (history.current.length > 50) history.current.shift();

        addOutput(
            <p><span className="text-green-400">chiruos@portfolio:~$</span> {commandStr}</p>
        );

        const [command, ...args] = commandStr.toLowerCase().trim().split(' ');
        const handler = commandHandlers[command];

        if (handler) {
            await handler(args);
        } else if(command) {
            addError(`> Command not found: '${command}'. Type 'help' for available commands.`);
        }
        addOutput(<div />); // Blank line
        setIsProcessing(false);
    }, []);

    const commandHandlers: { [key: string]: (args: string[]) => Promise<void> } = {
        help: async () => {
            addOutput([
                <p>Available commands:</p>,
                <p className="pl-4">{"help".padEnd(18)}show this menu</p>,
                <p className="pl-4">{"ls".padEnd(18)}list all sections</p>,
                <p className="pl-4">{"open [section]".padEnd(18)}open a window</p>,
                <p className="pl-4">{"whoami".padEnd(18)}about chiranjeev</p>,
                <p className="pl-4">{"skills".padEnd(18)}list skills</p>,
                <p className="pl-4">{"contact".padEnd(18)}show contact info</p>,
                <p className="pl-4">{"github".padEnd(18)}open github</p>,
                <p className="pl-4">{"linkedin".padEnd(18)}open linkedin</p>,
                <p className="pl-4">{"resume".padEnd(18)}download resume</p>,
                <p className="pl-4">{"play [game]".padEnd(18)}launch a game</p>,
                <p className="pl-4">{"clear".padEnd(18)}clear terminal</p>,
                <p className="pl-4">{"reboot".padEnd(18)}restart the OS</p>,
                <p className="pl-4">{"matrix".padEnd(18)}???</p>,
                <p className="pl-4">{"sudo rm -rf /".padEnd(18)}???</p>,
                <p className="pl-4">{"hire me".padEnd(18)}???</p>,
            ]);
        },
        ls: async () => {
            addOutput(DESKTOP_ICONS.map(i => <p key={i.id}>drwxr-xr-x&nbsp;&nbsp;{i.label}</p>));
        },
        open: async (args) => {
            const section = args[0];
            if (!section) return addError("> ERROR: 'open' requires a section. Type 'ls' to see options.");
            if (sections.includes(section)) {
                const component = getPageComponent(section);
                const app = DESKTOP_ICONS.find(i => i.id === section);
                if (component && app) {
                    addOutput(`> Opening ${section}...`);
                    openWindow(app.id, app.label, <component />);
                } else {
                    addError(`> ERROR: Could not find application '${section}'.`);
                }
            } else {
                addError(`> ERROR: Unknown section '${section}'. Type 'ls' to see options.`);
            }
        },
        whoami: async () => {
            addOutput([
                <p>Chiranjeev Agarwal</p>,
                <p>Full Stack Developer | New Delhi, India</p>,
                <p>Passionate about building clean web applications</p>,
                <p>and pixel art operating systems apparently.</p>,
                <p>Currently open to all opportunities.</p>,
            ]);
        },
        skills: async () => {
            addOutput([
                <p>LANGUAGES:  JavaScript, TypeScript, Python, Java</p>,
                <p>FRAMEWORKS: React, Next.js, Node.js, Express, Tailwind</p>,
                <p>TOOLS:      Git, Docker, Figma, VS Code</p>,
                <p>DATABASES:  MongoDB, PostgreSQL, Firebase</p>,
                <p>CLOUD:      Vercel, AWS, GCP</p>,
            ]);
        },
        contact: async () => {
            addOutput([
                <p>Email:    chiranjeev.agarwal@gmail.com</p>,
                <p>GitHub:   github.com/chiranjeev-agarwal</p>,
                <p>LinkedIn: linkedin.com/in/chiranjeev-agarwal</p>,
            ]);
        },
        github: async () => {
            addOutput("> Opening GitHub...");
            window.open('https://github.com/chiranjeev-agarwal', '_blank');
        },
        linkedin: async () => {
            addOutput("> Opening LinkedIn...");
            window.open('https://linkedin.com/in/chiranjeev-agarwal', '_blank');
        },
        resume: async () => {
            addOutput("> Downloading resume...");
            window.open('/resume/chiranjeev-agarwal-resume.pdf', '_blank');
        },
        play: async (args) => {
            const game = args[0];
            if (!game) return addError(`> ERROR: 'play' requires a game. Available: ${games.join(', ')}`);
            if (games.includes(game)) {
                addOutput(`> Launching ${game}...`);
                const gamesComponent = getPageComponent('games');
                openWindow('games', 'GAMES/', <gamesComponent />);
            } else {
                addError(`> ERROR: Game '${game}' not found. Available: ${games.join(', ')}`);
            }
        },
        clear: async () => setOutput([]),
        reboot: async () => {
            addOutput("> Initiating reboot sequence...");
            play('boot');
            setTimeout(() => {
                sessionStorage.removeItem('chiru-os-booted');
                window.location.reload();
            }, 1000);
        },
        matrix: async () => {
            addOutput("> Entering the Matrix...");
            play('success');
            setShowMatrix(true);
        },
        'sudo': async (args) => {
            if (args.join(' ') === 'rm -rf /') {
                play('error');
                await new Promise(r => setTimeout(r, 500)); addOutput("> WARNING: Deleting system files...");
                await new Promise(r => setTimeout(r, 500)); addOutput("> Removing creativity... [OK]");
                await new Promise(r => setTimeout(r, 500)); addOutput("> Removing personality... [OK]");
                await new Promise(r => setTimeout(r, 500)); addOutput("> Removing portfolio... [OK]");
                await new Promise(r => setTimeout(r, 800)); addOutput("> Just kidding :) Nice try though.");
            } else {
                addError("> Nice try, but I'm not that smart yet.");
            }
        },
        'hire': async (args) => {
            if (args[0] === 'me') {
                play('success');

                addOutput("> EXCELLENT CHOICE DETECTED!");
                
                await new Promise(r => setTimeout(r, 600));
                addOutput("> Initiating hire sequence...");

                await new Promise(r => setTimeout(r, 600));
                addOutput("> Updating your career trajectory... [OK]");

                await new Promise(r => setTimeout(r, 600));
                addOutput("> Best decision you'll make today!");

                await new Promise(r => setTimeout(r, 600));
                setShowConfetti(true);

                await new Promise(r => setTimeout(r, 1000));
                const contactComponent = getPageComponent('contact');
                if (contactComponent) {
                    openWindow('contact', 'CONTACT.sh', <contactComponent />);
                }
            } else {
                addError(`> Command not found: 'hire ${args[0]}'. Did you mean 'hire me'?`);
            }
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [output]);

    useEffect(() => {
        addOutput([
            <p>CHIRU-OS Terminal v1.0.0</p>,
            <p>Type 'help' for available commands.</p>,
            <p>─────────────────────────────────</p>,
            <div key="init-blank"></div>
        ]);
        focusInput();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isProcessing) return;
        play('click');
        if (e.key === 'Enter') {
            setIsProcessing(true);
            runCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex.current > 0) {
                historyIndex.current--;
                setInput(history.current[historyIndex.current]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex.current < history.current.length - 1) {
                historyIndex.current++;
                setInput(history.current[historyIndex.current]);
            } else {
                historyIndex.current = history.current.length;
                setInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const [cmd, ...args] = input.split(' ');
            let suggestions: string[] = [];

            if (args.length === 0) {
                suggestions = allCommands.filter(c => c.startsWith(cmd));
            } else if (cmd === 'open' && args.length === 1) {
                suggestions = sections.filter(s => s.startsWith(args[0]));
            } else if (cmd === 'play' && args.length === 1) {
                suggestions = games.filter(g => g.startsWith(args[0]));
            }

            if (suggestions.length === 1) {
                setInput(input.replace(/(\S+)$/, suggestions[0]) + ' ');
            } else if (suggestions.length > 1) {
                addOutput(<p className="text-primary/70">{suggestions.join('   ')}</p>);
            }
        }
    };

    const focusInput = () => inputRef.current?.focus();

    return (
        <div className="bg-black w-full h-full p-4 font-body text-primary text-base flex flex-col" onClick={focusInput}>
            <div ref={scrollRef} className="flex-grow overflow-y-auto">
                {output.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
                {isProcessing && <p>...</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <label htmlFor="terminal-input" className="text-green-400">chiruos@portfolio:~$</label>
                <input
                    ref={inputRef}
                    id="terminal-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-transparent outline-none caret-primary"
                    autoComplete="off"
                    disabled={isProcessing}
                />
            </div>
            {showMatrix && <MatrixEffect onClose={() => setShowMatrix(false)} />}
            {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}
        </div>
    );
}
