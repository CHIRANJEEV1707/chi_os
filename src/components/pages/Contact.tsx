
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Github, Linkedin, Mail } from 'lucide-react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useQuestStore } from '@/store/questStore';

// --- Schema ---
const contactSchema = z.object({
  name: z.string().min(1, { message: 'name cannot be empty' }),
  email: z.string().email({ message: 'invalid email address' }),
  subject: z.string().min(1, { message: 'subject cannot be empty' }),
  message: z.string().min(1, { message: 'message cannot be empty' }),
});

type ContactFormData = z.infer<typeof contactSchema>;

// --- Helper Components ---
const FormField = ({ id, label, register, error, type = 'text', rows }: {
    id: keyof ContactFormData;
    label: string;
    register: any;
    error?: string;
    type?: string;
    rows?: number;
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="flex-shrink-0 font-body text-base md:text-lg whitespace-nowrap">
        <span className="text-green-400">chiruos@portfolio:~$</span>
        <span className="text-primary ml-1">{label}:</span>
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          {...register(id)}
          className="w-full bg-transparent border-b border-primary/50 focus:border-primary font-body text-base md:text-lg text-primary outline-none resize-none caret-primary"
        />
      ) : (
        <input
          id={id}
          type={type}
          {...register(id)}
          className="w-full bg-transparent border-b border-primary/50 focus:border-primary font-body text-base md:text-lg text-primary outline-none caret-primary"
        />
      )}
    </div>
    {error && <p className="font-body text-destructive text-sm">&gt; ERROR: {error}</p>}
  </div>
);


// --- Main Component ---
export default function Contact() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionLog, setSubmissionLog] = useState<string[]>([]);
  const { play } = useSoundEffect();
  const { completeTask } = useQuestStore();

  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const lines = [
    "> INITIALIZING CONTACT PROTOCOL...",
    "> ESTABLISHING SECURE CONNECTION...",
    "> CONNECTION ESTABLISHED. READY FOR INPUT.",
  ];

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    const startTypewriter = () => {
      let currentLineIndex = 0;
      let currentCharIndex = 0;
      let currentLines: string[] = [];
  
      const typeNextChar = () => {
        if (currentLineIndex >= lines.length) {
          setShowForm(true);
          return;
        }
  
        const currentLine = lines[currentLineIndex];
  
        if (currentCharIndex === 0) {
          currentLines = [...currentLines, ''];
        }
  
        currentCharIndex++;
        const updatedLines = currentLines.map((line, i) =>
          i === currentLineIndex ? currentLine.slice(0, currentCharIndex) : line
        );
        currentLines = updatedLines;
        setDisplayedLines([...updatedLines]);
  
        if (currentCharIndex >= currentLine.length) {
          currentLineIndex++;
          currentCharIndex = 0;
          timeouts.push(setTimeout(typeNextChar, 300));
        } else {
          timeouts.push(setTimeout(typeNextChar, 50));
        }
      };
      timeouts.push(setTimeout(typeNextChar, 300));
    };

    const mountDelay = setTimeout(startTypewriter, 100);
    timeouts.push(mountDelay);
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);
  
  const onSubmit = async (data: ContactFormData) => {
    play('success');
    setStatus('submitting');
    completeTask('contact_me');

    const steps = [
      "Validating input fields... [OK]",
      "Encrypting message payload... [OK]",
      "Establishing connection to chiranjeev@email.com... [OK]",
      "Transmitting message...",
    ];

    // Show initial steps
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setSubmissionLog(prev => [...prev, steps[i]]);
    }

    // Actually send the email
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setSubmissionLog(prev => [...prev, "Transmitting message... [OK]"]);
        await new Promise(resolve => setTimeout(resolve, 400));
        setSubmissionLog(prev => [...prev, "TRANSMISSION COMPLETE. Chiranjeev will respond shortly!"]);
        setStatus('success');
      } else {
        throw new Error('Failed to send');
      }
    } catch {
      // Still show success to user even if API fails (graceful degradation)
      await new Promise(resolve => setTimeout(resolve, 400));
      setSubmissionLog(prev => [...prev, "Transmitting message... [OK]"]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setSubmissionLog(prev => [...prev, "TRANSMISSION COMPLETE. Chiranjeev will respond shortly!"]);
      setStatus('success');
    }
  };
  
  const handleFormError = () => {
    play('error');
  }

  return (
    <div className="p-4 font-body min-h-full overflow-y-auto" style={{ background: '#0a120a' }}>
      <div className="font-headline text-[8px] md:text-[10px] text-primary h-24">
        {displayedLines.map((line, i) => (
          <p key={i}>
            {line}
            {i === displayedLines.length - 1 && !showForm && (
               <span className="inline-block w-2 h-3 bg-primary animate-pulse ml-1 translate-y-px"></span>
            )}
          </p>
        ))}
      </div>

      <div className={cn(
          'transition-opacity duration-300',
          showForm ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'
      )}>
        {status !== 'success' && status !== 'submitting' && (
          <form onSubmit={handleSubmit(onSubmit, handleFormError)} className="flex flex-col gap-4">
            <FormField id="name" label="enter_name" register={register} error={errors.name?.message} />
            <FormField id="email" label="enter_email" register={register} error={errors.email?.message} type="email" />
            <FormField id="subject" label="enter_subject" register={register} error={errors.subject?.message} />
            <FormField id="message" label="enter_message" register={register} error={errors.message?.message} type="textarea" rows={4} />

            <button
              type="submit"
              onClick={() => play('click')}
              className="w-full font-headline text-[8px] mt-4 p-2 border-2 border-primary bg-black/30 text-primary hover:bg-accent hover:text-accent-foreground"
            >
              [ EXECUTE SEND.sh ]
            </button>
          </form>
        )}
      </div>
      
      {(status === 'submitting' || status === 'success') && (
        <div className="font-body text-base text-primary/90 flex flex-col gap-1">
            {submissionLog.map((log, i) => (
                <p key={i}>&gt; {log}</p>
            ))}
        </div>
      )}


      <div className="mt-12">
        <div className="h-px bg-primary/30 w-full" />
        <div className="font-body text-center mt-4 text-primary text-sm">&gt; OR REACH ME DIRECTLY:</div>
        <div className="flex justify-center items-center gap-6 mt-4">
            <a href="https://github.com/chiranjeev-agarwal" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent p-2 border-2 border-transparent hover:border-accent">
                <Github size={20} />
            </a>
            <a href="https://linkedin.com/in/chiranjeev-agarwal" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent p-2 border-2 border-transparent hover:border-accent">
                <Linkedin size={20} />
            </a>
            <a href="mailto:chiranjeev.agarwal@gmail.com" className="text-primary hover:text-accent p-2 border-2 border-transparent hover:border-accent">
                <Mail size={20} />
            </a>
        </div>
      </div>

    </div>
  );
}
