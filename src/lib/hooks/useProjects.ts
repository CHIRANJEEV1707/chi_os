'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export interface Project {
  id: string
  title: string
  description: string
  tech_stack: string[]
  github_url: string | null
  live_url: string | null
  status: string
  category: string
  featured: boolean
  order: number
  created_at: string
}

export const useProjects = (category?: string) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('order', { ascending: true })

        if (category && category !== 'ALL') {
          query = query.eq('category', category.toLowerCase())
        }

        const { data, error } = await query
        if (error) throw error
        setProjects(data && data.length > 0 ? data : PLACEHOLDER_PROJECTS)
      } catch (err: any) {
        console.error('Failed to fetch projects:', err)
        setError(err.message)
        setProjects(PLACEHOLDER_PROJECTS)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [category])

  return { projects, loading, error }
}

const PLACEHOLDER_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'RetroPortfolio OS',
    description: 'A pixel-art retro OS themed personal portfolio built with Next.js and Tailwind CSS. Features draggable windows, boot sequence, and easter eggs.',
    tech_stack: ['Next.js', 'TypeScript', 'Tailwind', 'Zustand', 'Howler.js'],
    github_url: 'https://github.com/chiranjeev-agarwal/chiru-os',
    live_url: '#',
    status: 'live',
    category: 'web',
    featured: true,
    order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'PixelChat App',
    description: 'Real-time chat application with pixel art UI. Supports rooms, direct messages, file sharing and custom pixel avatars.',
    tech_stack: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Express'],
    github_url: 'https://github.com/chiranjeev-agarwal',
    live_url: null,
    status: 'wip',
    category: 'web',
    featured: false,
    order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'CodeQuest',
    description: 'AI-powered coding challenge platform that generates personalized problems based on skill level using GPT-4 API.',
    tech_stack: ['Python', 'FastAPI', 'OpenAI', 'PostgreSQL', 'React'],
    github_url: 'https://github.com/chiranjeev-agarwal',
    live_url: null,
    status: 'archived',
    category: 'ai-ml',
    featured: false,
    order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Open Source Contributions',
    description: 'Contributed to various open-source projects, focusing on documentation, bug fixes, and feature enhancements.',
    tech_stack: ['Git', 'Markdown', 'Various'],
    github_url: 'https://github.com/chiranjeev-agarwal',
    live_url: null,
    status: 'live',
    category: 'open-source',
    featured: false,
    order: 3,
    created_at: new Date().toISOString()
  }
]
