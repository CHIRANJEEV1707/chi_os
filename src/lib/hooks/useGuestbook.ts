'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'

export interface GuestbookEntry {
  id: string
  name: string
  message: string
  location: string | null
  visitor_num: number
  created_at: string
}

export const useGuestbook = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) {
        setEntries(data)
      }
    } catch (err) {
      console.error('Failed to fetch guestbook entries:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()

    // Realtime subscription for new entries
    const subscription = supabase
      .channel('guestbook_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'guestbook'
      }, (payload) => {
        setEntries(prev => [payload.new as GuestbookEntry, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchEntries])

  const addEntry = async (entry: {
    name: string
    message: string
    location?: string
  }) => {
    // Get and increment visitor counter
    const { data: counter } = await supabase
      .from('counters')
      .select('value')
      .eq('key', 'guestbook_count')
      .single()

    const visitorNum = (counter?.value || 0) + 1

    // Update counter
    if (counter) {
      await supabase
        .from('counters')
        .update({ value: visitorNum })
        .eq('key', 'guestbook_count')
    } else {
      // Create counter if it doesn't exist
      await supabase
        .from('counters')
        .insert([{ key: 'guestbook_count', value: 1 }])
    }

    const { data, error } = await supabase
      .from('guestbook')
      .insert([{ ...entry, visitor_num: visitorNum }])
      .select()
      .single()

    if (error) throw error
    return { ...data, visitorNum }
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('guestbook')
      .delete()
      .eq('id', id)
    if (error) throw error
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return { entries, loading, addEntry, deleteEntry, refetch: fetchEntries }
}
