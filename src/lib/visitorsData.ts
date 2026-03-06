
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
    { id: 'seed-1', city: 'Mumbai', country: 'India', country_code: 'IN', lat: 19.076, lng: 72.877, timestamp: sub(new Date(), { minutes: 5 }) },
    { id: 'seed-2', city: 'New Delhi', country: 'India', country_code: 'IN', lat: 28.614, lng: 77.209, timestamp: sub(new Date(), { minutes: 15 }) },
    { id: 'seed-3', city: 'San Francisco', country: 'USA', country_code: 'US', lat: 37.774, lng: -122.419, timestamp: sub(new Date(), { minutes: 32 }) },
    { id: 'seed-4', city: 'London', country: 'UK', country_code: 'GB', lat: 51.507, lng: -0.127, timestamp: sub(new Date(), { minutes: 48 }) },
    { id: 'seed-5', city: 'Singapore', country: 'Singapore', country_code: 'SG', lat: 1.352, lng: 103.819, timestamp: sub(new Date(), { hours: 1, minutes: 7 }) },
    { id: 'seed-6', city: 'Berlin', country: 'Germany', country_code: 'DE', lat: 52.520, lng: 13.404, timestamp: sub(new Date(), { hours: 1, minutes: 35 }) },
    { id: 'seed-7', city: 'Toronto', country: 'Canada', country_code: 'CA', lat: 43.653, lng: -79.383, timestamp: sub(new Date(), { hours: 2, minutes: 20 }) },
    { id: 'seed-8', city: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.689, lng: 139.692, timestamp: sub(new Date(), { hours: 3 }) },
    { id: 'seed-9', city: 'Sydney', country: 'Australia', country_code: 'AU', lat: -33.868, lng: 151.209, timestamp: sub(new Date(), { hours: 4 }) },
    { id: 'seed-10', city: 'Dubai', country: 'UAE', country_code: 'AE', lat: 25.204, lng: 55.270, timestamp: sub(new Date(), { hours: 5, minutes: 10 }) },
];
