
'use client';
import { useQuestStore } from '@/store/questStore';
import { useEffect } from 'react';

export default function Bizcard() {
    const { completeTask } = useQuestStore();
    useEffect(() => {
        completeTask('generate_card');
    }, [completeTask]);
    
    return (
        <div className="p-4 font-body flex flex-col items-center justify-center h-full gap-2 text-center bg-[#050a05]">
            <div className="w-80 h-48 border-2 border-primary bg-black p-4 flex flex-col justify-between">
                <div>
                    <h1 className="font-headline text-lg text-primary">Chiranjeev Agarwal</h1>
                    <p className="text-primary/80">Full Stack Developer</p>
                </div>
                <div className="text-right text-sm">
                    <p className="text-primary/80">chiranjeev.agarwal@gmail.com</p>
                    <p className="text-primary/80">linkedin.com/in/chiranjeev-agarwal</p>
                </div>
            </div>
            <p className="text-sm text-primary/70 mt-2">TASK COMPLETE: [Get my business card]</p>
        </div>
    );
}
