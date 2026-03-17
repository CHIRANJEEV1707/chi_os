'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  start_date: string
  end_date: string | null
  description_bullets: string[]
  tech_stack: string[]
  order: number
  created_at: string
}

export const useExperience = () => {
  const [experience, setExperience] = useState<ExperienceEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const { data, error } = await supabase
          .from('experience')
          .select('*')
          .order('order', { ascending: true })

        if (error) throw error
        setExperience(data && data.length > 0 ? data : PLACEHOLDER_EXPERIENCE)
      } catch (err) {
        console.error('Failed to fetch experience:', err)
        setExperience(PLACEHOLDER_EXPERIENCE)
      } finally {
        setLoading(false)
      }
    }
    fetchExperience()
  }, [])

  return { experience, loading }
}

const PLACEHOLDER_EXPERIENCE: ExperienceEntry[] = [
  {
    id: '1',
    company: 'TechCorp Solutions',
    role: 'Frontend Developer Intern',
    start_date: 'Jun 2023',
    end_date: 'Aug 2023',
    description_bullets: [
      'Built responsive React components serving 10k+ users',
      'Reduced page load time by 40% through lazy loading',
      'Collaborated with design team on pixel-perfect UIs'
    ],
    tech_stack: ['React', 'TypeScript', 'Tailwind', 'Git'],
    order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    company: 'StartupXYZ',
    role: 'Full Stack Developer Intern',
    start_date: 'Dec 2022',
    end_date: 'Feb 2023',
    description_bullets: [
      'Developed RESTful APIs using Node.js and Express',
      'Integrated Firebase authentication and Firestore',
      'Shipped 3 major features in 8-week sprint cycle'
    ],
    tech_stack: ['Node.js', 'Express', 'Firebase', 'MongoDB'],
    order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    company: 'FreelanceProject',
    role: 'Web Developer',
    start_date: 'Jun 2022',
    end_date: 'Aug 2022',
    description_bullets: [
      'Designed and developed 4 client websites from scratch',
      'Implemented SEO best practices increasing organic traffic by 60%',
      'Delivered all projects on time and within budget'
    ],
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
    order: 2,
    created_at: new Date().toISOString()
  }
]
