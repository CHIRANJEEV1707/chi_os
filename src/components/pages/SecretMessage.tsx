
export default function SecretMessage() {
    return (
        <div className="p-8 font-body flex flex-col items-center justify-center h-full gap-4 text-center bg-black">
            <h1 className="font-headline text-2xl text-yellow-400 drop-shadow-[0_0_8px_hsl(var(--primary))] animate-pulse">A SECRET MESSAGE</h1>
            <div className="mt-4 text-lg text-primary/90 max-w-md mx-auto space-y-4">
                <p>
                    You found it. You explored every corner, played every game, and completed every quest. 
                    That tells me you're curious, persistent, and detail-oriented. I like that.
                </p>
                <p>
                    This whole portfolio was a passion project to see if I could build something fun and different. If you enjoyed it, or if you think my skills and mindset would be a good fit for your team, I'd genuinely love to talk.
                </p>
                 <p className="mt-6 text-yellow-400">
                    Here's my personal email: <span className="font-headline">chiranjeev.agarwal@gmail.com</span>
                </p>
            </div>
        </div>
    );
}
