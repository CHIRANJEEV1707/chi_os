
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

export const mockVisitorData: Visitor[] = [
  { id: '1', city: 'San Francisco', country: 'USA', country_code: 'US', lat: 37.77, lng: -122.41, timestamp: sub(new Date(), { minutes: 2 }) },
  { id: '2', city: 'New York', country: 'USA', country_code: 'US', lat: 40.71, lng: -74.00, timestamp: sub(new Date(), { minutes: 5 }) },
  { id: '3', city: 'London', country: 'UK', country_code: 'GB', lat: 51.50, lng: -0.12, timestamp: sub(new Date(), { minutes: 15 }) },
  { id: '4', city: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.68, lng: 139.69, timestamp: sub(new Date(), { hours: 1 }) },
  { id: '5', city: 'Sydney', country: 'Australia', country_code: 'AU', lat: -33.86, lng: 151.20, timestamp: sub(new Date(), { hours: 2 }) },
  { id: '6', city: 'Paris', country: 'France', country_code: 'FR', lat: 48.85, lng: 2.35, timestamp: sub(new Date(), { hours: 3 }) },
  { id: '7', city: 'Berlin', country: 'Germany', country_code: 'DE', lat: 52.52, lng: 13.40, timestamp: sub(new Date(), { hours: 5 }) },
  { id: '8', city: 'Singapore', country: 'Singapore', country_code: 'SG', lat: 1.35, lng: 103.81, timestamp: sub(new Date(), { days: 1 }) },
  { id: '9', city: 'Dubai', country: 'UAE', country_code: 'AE', lat: 25.20, lng: 55.27, timestamp: sub(new Date(), { days: 1 }) },
  { id: '10', city: 'Moscow', country: 'Russia', country_code: 'RU', lat: 55.75, lng: 37.61, timestamp: sub(new Date(), { days: 2 }) },
  { id: '11', city: 'Rio de Janeiro', country: 'Brazil', country_code: 'BR', lat: -22.90, lng: -43.17, timestamp: sub(new Date(), { days: 3 }) },
  { id: '12', city: 'New Delhi', country: 'India', country_code: 'IN', lat: 28.61, lng: 77.20, timestamp: sub(new Date(), { days: 4 }) },
];
