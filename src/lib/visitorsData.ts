
import { sub } from 'date-fns';

export interface Visitor {
  id: string;
  city: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  timestamp: Date;
}

export const SEED_VISITORS: Visitor[] = [
    { id: 'seed-1', city: 'New Delhi', country: 'India', country_code: 'IN', lat: 28.61, lng: 77.20, timestamp: sub(new Date(), { minutes: 5 }) },
    { id: 'seed-2', city: 'San Francisco', country: 'USA', country_code: 'US', lat: 37.77, lng: -122.41, timestamp: sub(new Date(), { minutes: 12 }) },
    { id: 'seed-3', city: 'London', country: 'UK', country_code: 'GB', lat: 51.50, lng: -0.12, timestamp: sub(new Date(), { minutes: 28 }) },
    { id: 'seed-4', city: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.68, lng: 139.69, timestamp: sub(new Date(), { hours: 1, minutes: 15 }) },
    { id: 'seed-5', city: 'Singapore', country: 'Singapore', country_code: 'SG', lat: 1.35, lng: 103.81, timestamp: sub(new Date(), { hours: 2, minutes: 3 }) },
    { id: 'seed-6', city: 'Berlin', country: 'Germany', country_code: 'DE', lat: 52.52, lng: 13.40, timestamp: sub(new Date(), { hours: 2, minutes: 45 }) },
    { id: 'seed-7', city: 'Sydney', country: 'Australia', country_code: 'AU', lat: -33.86, lng: 151.20, timestamp: sub(new Date(), { hours: 3, minutes: 30 }) },
    { id: 'seed-8', city: 'Toronto', country: 'Canada', country_code: 'CA', lat: 43.65, lng: -79.38, timestamp: sub(new Date(), { hours: 4 }) },
    { id: 'seed-9', city: 'Dubai', country: 'UAE', country_code: 'AE', lat: 25.20, lng: 55.27, timestamp: sub(new Date(), { hours: 5, minutes: 10 }) },
    { id: 'seed-10', city: 'Moscow', country: 'Russia', country_code: 'RU', lat: 55.75, lng: 37.61, timestamp: sub(new Date(), { hours: 6 }) },
];
