'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export interface ThoughtEntry {
  id: string
  content: string
  category: string
  created_at: string
}

export const useThoughts = () => {
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchThoughts = async () => {
      try {
        const { data, error } = await supabase
          .from('thoughts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setThoughts(data && data.length > 0 ? data : PLACEHOLDER_THOUGHTS)
      } catch (err) {
        console.error('Failed to fetch thoughts:', err)
        setThoughts(PLACEHOLDER_THOUGHTS)
      } finally {
        setLoading(false)
      }
    }
    fetchThoughts()
  }, [])

  return { thoughts, loading }
}

const PLACEHOLDER_THOUGHTS: ThoughtEntry[] = [
  {
    id: 'thought-8',
    category: 'tech',
    content: "The best developer experience is the one where you forget you're using a tool. Same goes for product UX.",
    created_at: new Date('2024-07-28T11:00:00Z').toISOString()
  },
  {
    id: 'thought-7',
    category: 'startups',
    content: "Failing fast is good advice. Failing smart is better. Know why you failed or you'll just fail faster next time.",
    created_at: new Date('2024-07-27T18:30:00Z').toISOString()
  },
  {
    id: 'thought-6',
    category: 'product',
    content: 'Retention > Acquisition. Always. A leaky bucket with more water is still a leaky bucket.',
    created_at: new Date('2024-07-27T09:00:00Z').toISOString()
  },
  {
    id: 'thought-5',
    category: 'random',
    content: "I built an entire OS as a portfolio because a PDF resume felt boring. I'm not sure if that's genius or a problem. Maybe both.",
    created_at: new Date('2024-07-26T22:15:00Z').toISOString()
  },
  {
    id: 'thought-4',
    category: 'tech',
    content: 'We keep building more features when most products need fewer, better ones. Subtraction is underrated in product thinking.',
    created_at: new Date('2024-07-26T14:00:00Z').toISOString()
  },
  {
    id: 'thought-3',
    category: 'product',
    content: "Dark patterns are a short-term revenue hack and a long-term brand destroyer. The best products don't need tricks.",
    created_at: new Date('2024-07-25T17:45:00Z').toISOString()
  },
  {
    id: 'thought-2',
    category: 'startups',
    content: "The hardest part of building a startup isn't the product. It's convincing yourself to keep going on the days when nothing works and no one cares.",
    created_at: new Date('2024-07-25T10:20:00Z').toISOString()
  },
  {
    id: 'thought-1',
    category: 'product',
    content: 'Why do most onboarding flows assume users want to see every feature immediately? The best onboarding is the one that shows one thing, really well, at exactly the right moment.',
    created_at: new Date('2024-07-24T12:00:00Z').toISOString()
  }
]
