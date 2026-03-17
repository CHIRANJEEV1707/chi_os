'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export interface BlogPost {
  id: string
  title: string
  content: string
  tags: string[]
  published: boolean
  read_time: number
  created_at: string
  updated_at: string
}

export const useBlogPosts = (publishedOnly = true) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (publishedOnly) {
        query = query.eq('published', true)
      }

      const { data, error } = await query
      if (error) throw error
      setPosts(data && data.length > 0 ? data : (publishedOnly ? [] : []))
    } catch (err) {
      console.error('Failed to fetch blog posts:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [publishedOnly])

  return { posts, loading, refetch: fetchPosts }
}
