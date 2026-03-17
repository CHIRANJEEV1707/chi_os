'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'

export interface Visitor {
  id?: string
  city: string
  country: string
  country_code: string
  lat: number
  lng: number
  created_at: string
}

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(null)

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const { data, error } = await supabase
          .from('visitors')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setVisitors(data)
        } else {
          setVisitors(SEED_VISITORS)
        }
      } catch (err) {
        console.error('Failed to fetch visitors:', err)
        setVisitors(SEED_VISITORS)
      } finally {
        setLoading(false)
      }
    }
    fetchVisitors()
  }, [])

  const trackVisitor = useCallback(async (visitorData: {
    city: string
    country: string
    country_code: string
    lat: number
    lng: number
  }) => {
    // Only track once per session
    if (typeof window !== 'undefined') {
      const visited = sessionStorage.getItem('chiru-visited')
      if (visited) return
    }

    try {
      const { data, error } = await supabase
        .from('visitors')
        .insert([visitorData])
        .select()
        .single()

      if (!error && data) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('chiru-visited', 'true')
        }
        setCurrentVisitor(data)
        setVisitors(prev => [data, ...prev])
      }
    } catch (err) {
      console.error('Failed to track visitor:', err)
    }
  }, [])

  return { visitors, loading, trackVisitor, currentVisitor }
}

const SEED_VISITORS: Visitor[] = [
  { city: 'Mumbai', country: 'India', country_code: 'IN', lat: 19.076, lng: 72.877, created_at: new Date(Date.now() - 300000).toISOString() },
  { city: 'San Francisco', country: 'United States', country_code: 'US', lat: 37.774, lng: -122.419, created_at: new Date(Date.now() - 1920000).toISOString() },
  { city: 'London', country: 'United Kingdom', country_code: 'GB', lat: 51.507, lng: -0.127, created_at: new Date(Date.now() - 2880000).toISOString() },
  { city: 'Singapore', country: 'Singapore', country_code: 'SG', lat: 1.352, lng: 103.819, created_at: new Date(Date.now() - 4020000).toISOString() },
  { city: 'Berlin', country: 'Germany', country_code: 'DE', lat: 52.520, lng: 13.404, created_at: new Date(Date.now() - 5700000).toISOString() },
  { city: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.689, lng: 139.692, created_at: new Date(Date.now() - 10800000).toISOString() },
  { city: 'Toronto', country: 'Canada', country_code: 'CA', lat: 43.653, lng: -79.383, created_at: new Date(Date.now() - 7200000).toISOString() },
  { city: 'Sydney', country: 'Australia', country_code: 'AU', lat: -33.868, lng: 151.209, created_at: new Date(Date.now() - 14400000).toISOString() },
  { city: 'Dubai', country: 'UAE', country_code: 'AE', lat: 25.204, lng: 55.270, created_at: new Date(Date.now() - 18000000).toISOString() },
  { city: 'New Delhi', country: 'India', country_code: 'IN', lat: 28.614, lng: 77.209, created_at: new Date(Date.now() - 900000).toISOString() },
]
