
'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Globe, Users, Calendar, Plus, Minus } from 'lucide-react';
import { formatDistanceToNowStrict, isToday } from 'date-fns';
import { useVisitorStore } from '@/store/visitorStore';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const getFlagEmoji = (countryCode?: string) => {
    if (!countryCode) return '🌍';
    try {
        return countryCode
            .toUpperCase()
            .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
    } catch {
        return '🌍';
    }
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex-1 p-2 border border-[#003300] bg-[#001200] text-center">
        <p className="font-headline text-base md:text-lg text-amber-400 flex items-center justify-center gap-2">
            {icon}
            <span>{value}</span>
        </p>
        <p className="font-body text-xs text-[#00b32c] mt-1">{label}</p>
    </div>
);

export default function Visitors() {
    const { visitors, currentVisitor } = useVisitorStore();
    const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });

    const handleZoomIn = () => {
        if (position.zoom >= 8) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
    };

    const handleMoveEnd = (position: { coordinates: [number, number], zoom: number }) => {
        setPosition(position);
    };

    const mapDots = useMemo(() => {
        const cityData: Record<string, { lat: number; lng: number; count: number, country: string, country_code: string, lastVisit: Date, isCurrent: boolean }> = {};
        
        visitors.forEach(v => {
            if (!v.city || !v.lat || !v.lng) return;
            const isCurrent = currentVisitor?.id === v.id;
            if (!cityData[v.city]) {
                cityData[v.city] = { lat: v.lat, lng: v.lng, count: 0, country: v.country, country_code: v.country_code, lastVisit: v.timestamp, isCurrent: false };
            }
            cityData[v.city].count++;
            if (v.timestamp > cityData[v.city].lastVisit) {
                cityData[v.city].lastVisit = v.timestamp;
            }
            if (isCurrent) {
                cityData[v.city].isCurrent = true;
            }
        });

        return Object.entries(cityData).map(([city, data]) => {
            return {
                id: city,
                coordinates: [data.lng, data.lat] as [number, number],
                size: data.isCurrent ? 6 : Math.min(3 + data.count * 0.5, 8),
                label: `${getFlagEmoji(data.country_code)} ${city}, ${data.country}`,
                count: data.count,
                lastVisit: data.lastVisit,
                isCurrent: data.isCurrent
            };
        }).filter(dot => dot.coordinates[0] && dot.coordinates[1]);
    }, [visitors, currentVisitor]);

    const totalVisits = visitors.length;
    const totalCities = useMemo(() => new Set(visitors.map(v => v.city)).size, [visitors]);
    const totalCountries = useMemo(() => new Set(visitors.map(v => v.country)).size, [visitors]);
    const todayVisits = useMemo(() => visitors.filter(v => isToday(v.timestamp)).length, [visitors]);
    
    return (
        <div className="p-0 font-body h-full flex flex-col overflow-y-auto bg-[#050a05]">
            <header className="flex-shrink-0 bg-[#000a00] p-3 border-b border-[#002200]">
                <div className="flex justify-between items-center">
                    <p className="font-headline text-[7px] text-primary">{'>'} VISITORS.map</p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="font-headline text-[6px] text-primary">LIVE</p>
                    </div>
                </div>
                <p className="font-body text-sm text-[#00b32c] mt-1">{'>'} Tracking visitors from around the world</p>
            </header>
            
            <div className="flex-shrink-0 grid grid-cols-4 gap-2 p-3 border-b border-[#002200]">
                <StatCard icon="🌍" label="TOTAL VISITS" value={totalVisits} />
                <StatCard icon="🏙️" label="CITIES" value={totalCities} />
                <StatCard icon="🗺️" label="COUNTRIES" value={totalCountries} />
                <StatCard icon="📅" label="TODAY" value={todayVisits} />
            </div>

            <div className="flex-grow relative bg-[#000800] border-b border-[#002200] p-2 flex items-center justify-center">
                <ComposableMap
                    projection="geoNaturalEarth1"
                    projectionConfig={{ scale: 140 }}
                    style={{ width: '100%', height: 'auto', maxHeight: '240px' }}
                >
                    <ZoomableGroup
                      zoom={position.zoom}
                      center={position.coordinates}
                      onMoveEnd={handleMoveEnd}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) =>
                            geographies.map(geo => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#001a00"
                                    stroke="#004400"
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: 'none' },
                                        hover: { outline: 'none', fill: '#002800' },
                                        pressed: { outline: 'none' }
                                    }}
                                />
                            ))
                            }
                        </Geographies>
                        <TooltipProvider>
                        {mapDots.map(dot => (
                            <Tooltip key={dot.id}>
                                <TooltipTrigger asChild>
                                    <Marker coordinates={dot.coordinates}>
                                        {dot.isCurrent && <circle r={6} className="ping-pulse-outer" />}
                                        <circle
                                            r={dot.isCurrent ? 6 : 4}
                                            fill={dot.isCurrent ? '#ff4141' : '#00ff41'}
                                            style={{ filter: `drop-shadow(0 0 3px ${dot.isCurrent ? '#ff4141' : '#00ff41'})` }}
                                        />
                                    </Marker>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-headline text-base">{dot.label}</p>
                                    <p className="text-sm">{dot.count} visit{dot.count > 1 ? 's' : ''}</p>
                                    {dot.lastVisit && <p className="text-xs text-muted-foreground">Last visit: {formatDistanceToNowStrict(dot.lastVisit, { addSuffix: true })}</p>}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        </TooltipProvider>
                    </ZoomableGroup>
                </ComposableMap>
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                    <button onClick={handleZoomIn} className="w-6 h-6 flex items-center justify-center bg-black/50 border border-primary/50 text-primary hover:bg-accent hover:text-black">
                        <Plus size={14} />
                    </button>
                    <button onClick={handleZoomOut} className="w-6 h-6 flex items-center justify-center bg-black/50 border border-primary/50 text-primary hover:bg-accent hover:text-black">
                        <Minus size={14} />
                    </button>
                </div>
                <p className="absolute bottom-2 left-3 font-body text-[11px] text-[#003300]">🔴 = You are here</p>
            </div>

            <div className="flex-shrink-0 p-3 h-[180px] flex flex-col">
                <p className="font-headline text-[6px] text-[#00b32c] mb-1">{'>'} RECENT VISITORS</p>
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="flex flex-col-reverse justify-end gap-0.5">
                        {visitors.slice(0, 50).map((v) => (
                             <div key={v.id} className={cn(
                                "flex justify-between items-center text-sm p-1 animate-in fade-in slide-in-from-top-2 duration-300",
                                currentVisitor?.id === v.id && "bg-[#001a00] border-l-2 border-primary"
                             )}>
                                <span className="text-primary">
                                    {currentVisitor?.id === v.id && <span className="font-headline text-[5px] text-amber-400 mr-2">[YOU ARE HERE]</span>}
                                    {getFlagEmoji(v.country_code)} {v.city}, {v.country}
                                </span>
                                <span className="text-[#004400]">
                                    {formatDistanceToNowStrict(v.timestamp, { addSuffix: true })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="text-center p-2 border-t border-[#002200] flex-shrink-0">
                <p className="font-body text-[11px] text-[#002800]">{'>'} No personal data stored. City-level only.</p>
            </footer>
        </div>
    );
}
