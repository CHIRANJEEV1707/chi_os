
export type ThoughtCategory = 'PRODUCT' | 'STARTUPS' | 'TECH' | 'RANDOM';

export interface Thought {
  id: string;
  category: ThoughtCategory;
  text: string;
  timestamp: Date;
}

// Data is in reverse chronological order (newest first)
export const thoughtsData: Thought[] = [
    {
        id: 'thought-8',
        category: 'TECH',
        text: "The best developer experience is the one where you forget you're using a tool. Same goes for product UX.",
        timestamp: new Date('2024-07-28T11:00:00Z'),
    },
    {
        id: 'thought-7',
        category: 'STARTUPS',
        text: "Failing fast is good advice. Failing smart is better. Know why you failed or you'll just fail faster next time.",
        timestamp: new Date('2024-07-27T18:30:00Z'),
    },
    {
        id: 'thought-6',
        category: 'PRODUCT',
        text: "Retention > Acquisition. Always. A leaky bucket with more water is still a leaky bucket.",
        timestamp: new Date('2024-07-27T09:00:00Z'),
    },
    {
        id: 'thought-5',
        category: 'RANDOM',
        text: "I built an entire OS as a portfolio because a PDF resume felt boring. I'm not sure if that's genius or a problem. Maybe both.",
        timestamp: new Date('2024-07-26T22:15:00Z'),
    },
    {
        id: 'thought-4',
        category: 'TECH',
        text: "We keep building more features when most products need fewer, better ones. Subtraction is underrated in product thinking.",
        timestamp: new Date('2024-07-26T14:00:00Z'),
    },
    {
        id: 'thought-3',
        category: 'PRODUCT',
        text: "Dark patterns are a short-term revenue hack and a long-term brand destroyer. The best products don't need tricks.",
        timestamp: new Date('2024-07-25T17:45:00Z'),
    },
    {
        id: 'thought-2',
        category: 'STARTUPS',
        text: "The hardest part of building a startup isn't the product. It's convincing yourself to keep going on the days when nothing works and no one cares.",
        timestamp: new Date('2024-07-25T10:20:00Z'),
    },
    {
        id: 'thought-1',
        category: 'PRODUCT',
        text: "Why do most onboarding flows assume users want to see every feature immediately? The best onboarding is the one that shows one thing, really well, at exactly the right moment.",
        timestamp: new Date('2024-07-24T12:00:00Z'),
    },
];
