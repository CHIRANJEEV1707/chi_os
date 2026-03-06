
'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Globe, MapPin, Users, Calendar } from 'lucide-react';
import { formatDistanceToNowStrict, isToday } from 'date-fns';
import { useVisitorStore } from '@/store/visitorStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

// A simple equirectangular projection
const project = (lat: number, lng: number) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return { x: -1, y: -1 };
    const x = (lng + 180) * (MAP_WIDTH / 360);
    const y = (90 - lat) * (MAP_HEIGHT / 180);
    return { x, y };
};

const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '🌍';
    try {
        return countryCode
            .toUpperCase()
            .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
    } catch {
        return '🌍';
    }
};

const WorldMapSVG = () => (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full h-auto bg-[#000a00]">
        <path d="M499.999 0.001C387.413 0.001 292.012 87.973 277.031 200.638C263.305 197.834 246.331 196.47 228.601 196.47C182.802 196.47 165.828 208.571 161.965 212.986C160.033 211.055 158.102 210.12 155.12 210.12C151.173 210.12 149.241 212.051 146.259 216.918C144.328 214.986 142.396 214.021 140.465 214.021C136.518 214.021 133.535 216.918 131.604 220.781C128.621 218.849 126.69 217.884 122.743 217.884C118.796 217.884 116.864 220.781 113.882 225.648C110.899 222.75 107.917 221.785 104.934 221.785C100.022 221.785 96.074 225.648 93.092 231.48C84.349 229.549 74.521 228.583 65.777 228.583C25.312 228.583 -11.956 248.868 6.643 283.07C25.242 317.272 56.121 327.922 65.777 327.922C81.836 327.922 96.81 323.055 109.816 317.272L110.899 320.17C113.882 327.922 116.864 330.82 121.777 330.82C125.724 330.82 128.707 328.888 130.638 325.025C132.57 330.82 136.518 333.717 141.43 333.717C144.328 333.717 146.259 332.752 148.191 330.82C150.122 334.683 153.105 336.614 157.052 336.614C161.031 336.614 163.916 333.717 166.898 328.888L171.811 336.614C175.758 343.41 180.707 346.307 186.638 346.307C191.55 346.307 195.498 343.41 199.445 337.579C202.428 343.41 206.375 346.307 212.306 346.307C218.238 346.307 223.15 343.41 227.097 336.614L230.08 340.477C233.062 344.34 237.01 346.307 240.957 346.307C246.888 346.307 251.801 343.41 254.783 337.579L257.766 343.41C260.748 349.241 264.696 352.138 270.627 352.138C276.558 352.138 281.471 349.241 284.453 343.41L292.205 357.97C295.188 363.801 300.101 366.698 305.013 366.698C310.945 366.698 316.876 362.835 319.859 357.004L322.841 362.835C325.824 368.666 330.736 371.564 336.668 371.564C342.599 371.564 348.531 367.7 350.462 361.869L352.394 366.698C355.376 372.53 360.289 375.427 366.22 375.427C372.151 375.427 378.083 371.564 380.014 365.732L382.997 371.564C385.979 377.395 391.876 381.258 397.808 381.258C404.722 381.258 411.635 375.427 414.618 368.666L423.361 386.121C426.344 391.952 431.256 395.783 437.188 395.783C443.119 395.783 449.051 391.952 451.964 386.121L458.877 397.717C461.86 403.548 466.772 406.446 472.704 406.446C478.635 406.446 484.567 403.548 487.549 397.717L494.463 409.313C497.445 415.145 502.358 418.042 508.289 418.042C514.221 418.042 520.152 414.179 523.135 408.347L528.047 417.076C530.014 420.94 532.997 422.871 536.944 422.871C540.891 422.871 544.839 420.94 546.77 417.076L552.668 428.672C557.58 438.298 565.332 443.165 574.075 443.165C582.819 443.165 590.571 438.298 595.483 428.672L600.396 437.401C602.361 441.264 605.344 443.196 609.291 443.196C613.238 443.196 617.185 441.264 619.117 437.401L622.1 443.196C625.082 449.027 630.029 451.924 635.926 451.924C641.823 451.924 646.77 449.027 649.753 443.196L653.665 450.958C656.648 456.789 661.561 459.687 667.492 459.687C673.424 459.687 678.336 456.789 681.319 450.958L691.047 469.35C694.03 475.182 698.942 478.079 704.874 478.079C710.805 478.079 715.718 475.182 718.7 469.35L724.632 479.045C727.614 484.876 732.527 487.773 738.458 487.773C744.39 487.773 749.302 484.876 752.285 479.045L758.216 488.739C762.163 495.535 768.061 498.432 774.975 498.432C779.887 498.432 783.834 496.5 786.817 493.637C801.763 490.74 815.659 487.843 829.554 485.911C834.467 472.253 839.379 459.561 844.292 447.832C872.903 446.866 892.833 429.621 892.833 408.347C892.833 393.799 884.09 383.149 873.99 377.353C878.867 364.661 882.815 352.933 884.746 343.41C890.678 340.513 893.778 333.717 893.778 327.922C893.778 320.17 888.729 313.374 881.816 310.477L879.884 300.783C876.901 286.199 865.239 276.573 852.514 274.641C855.497 262.54 858.479 250.474 860.38 240.413C868.164 242.345 876.907 243.31 886.635 243.31C925.137 243.31 954.083 227.417 968.96 200.638C983.836 173.858 989.836 142.253 989.836 112.513C989.836 50.516 905.158 0.001 500 0C499.999 0 499.999 0.001 499.999 0.001Z"
            fill="#001a00" stroke="#002800" strokeWidth="0.5"/>
    </svg>
);


const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex-1 p-2 border border-primary/30 bg-black/30 text-center">
        <p className="font-headline text-lg md:text-xl text-amber-400 flex items-center justify-center gap-2">
            {icon}
            <span>{value}</span>
        </p>
        <p className="font-body text-xs md:text-sm text-primary/70 mt-1">{label}</p>
    </div>
);

export default function Visitors() {
    const { visitors, currentVisitor } = useVisitorStore();
    
    const mapDots = useMemo(() => {
        const cityData: Record<string, { lat: number; lng: number; count: number, country: string, country_code: string, lastVisit: Date | undefined }> = {};
        visitors.forEach(v => {
            if (!cityData[v.city]) {
                cityData[v.city] = { lat: v.lat, lng: v.lng, count: 0, country: v.country, country_code: v.country_code, lastVisit: undefined };
            }
            cityData[v.city].count++;
            const visitTimestamp = v.timestamp;
            if (!cityData[v.city].lastVisit || visitTimestamp > cityData[v.city].lastVisit!) {
                cityData[v.city].lastVisit = visitTimestamp;
            }
        });

        return Object.entries(cityData).map(([city, data]) => {
            const { x, y } = project(data.lat, data.lng);
            return {
                id: city, x, y,
                size: Math.min(3 + data.count, 10),
                label: `${getFlagEmoji(data.country_code)} ${city}, ${data.country}`,
                count: data.count,
                lastVisit: data.lastVisit,
                isCurrent: currentVisitor?.city === city
            };
        }).filter(dot => dot.x > 0 && dot.y > 0);
    }, [visitors, currentVisitor]);

    const totalVisits = visitors.length;
    const totalCities = useMemo(() => new Set(visitors.map(v => v.city)).size, [visitors]);
    const totalCountries = useMemo(() => new Set(visitors.map(v => v.country)).size, [visitors]);
    const todayVisits = useMemo(() => visitors.filter(v => isToday(v.timestamp)).length, [visitors]);
    
    return (
        <div className="p-2 font-body h-full flex flex-col">
            <header className="flex-shrink-0">
                <p className="font-headline text-[7px] text-muted-foreground">&gt; VISITORS.map — LIVE</p>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="font-body text-sm text-primary/80">&gt; TRACKING ACTIVE</p>
                </div>
                <div className="w-full border-t border-dotted border-primary/30 my-2"></div>
            </header>

            <div className="flex gap-2 mb-2">
                <StatCard icon={<Globe size={16} />} label="TOTAL VISITS" value={totalVisits} />
                <StatCard icon={<MapPin size={16} />} label="UNIQUE CITIES" value={totalCities} />
                <StatCard icon={<Users size={16} />} label="COUNTRIES" value={totalCountries} />
                <StatCard icon={<Calendar size={16} />} label="TODAY" value={todayVisits} />
            </div>

            <div className="flex-grow relative bg-black border border-primary/20">
                <WorldMapSVG />
                <svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0">
                  <TooltipProvider>
                    {mapDots.map(dot => (
                        <Tooltip key={dot.id}>
                            <TooltipTrigger asChild>
                                <g transform={`translate(${dot.x}, ${dot.y})`}>
                                   {dot.isCurrent && (
                                     <circle r={dot.size} fill="#39ff14" className="ping-pulse-outer" />
                                   )}
                                   <circle
                                        r={dot.size}
                                        fill={dot.isCurrent ? '#39ff14' : '#00ff41'}
                                        style={{ filter: `drop-shadow(0 0 3px ${dot.isCurrent ? '#39ff14' : '#00ff41'})`}}
                                    />
                                </g>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-headline text-base">{dot.label}</p>
                                <p className="text-sm">{dot.count} visit{dot.count > 1 ? 's' : ''}</p>
                                {dot.lastVisit && <p className="text-xs text-muted-foreground">Last visit: {formatDistanceToNowStrict(dot.lastVisit, { addSuffix: true })}</p>}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                  </TooltipProvider>
                </svg>
            </div>

            <div className="h-24 flex-shrink-0 mt-2 border border-primary/20 bg-black/30 p-2 overflow-y-auto">
                <div className="flex flex-col-reverse">
                    {visitors.slice(0, 50).map((v, i) => (
                        <p key={v.id} className={cn("text-sm", i === 0 && visitors.length > SEED_VISITORS.length && 'text-green-400 animate-pulse')}>
                            {getFlagEmoji(v.country_code)} {v.city}, {v.country} - {formatDistanceToNowStrict(v.timestamp, { addSuffix: true })}
                        </p>
                    ))}
                </div>
            </div>
            <p className="text-center text-xs text-muted-foreground/50 mt-1">&gt; No personal data stored. City-level only.</p>
        </div>
    );
}
