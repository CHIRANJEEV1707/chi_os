
'use client';

import { useUiStore } from '@/store/uiStore';
import { useEffect, useRef } from 'react';
import { useAchievementStore } from '@/store/achievementStore';
import AchievementNotification from './achievements/AchievementNotification';

export default function GlobalEffects() {
    const isGlitching = useUiStore((state) => state.isGlitching);
    const { unlock } = useAchievementStore();
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    const konamiIndex = useRef(0);

    useEffect(() => {
        if (isGlitching) {
            document.body.classList.add('glitch-active');
        } else {
            document.body.classList.remove('glitch-active');
        }
    }, [isGlitching]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === konamiCode[konamiIndex.current]) {
                konamiIndex.current++;
                if (konamiIndex.current === konamiCode.length) {
                    unlock('konami');
                    konamiIndex.current = 0;
                }
            } else {
                konamiIndex.current = 0;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [unlock]);

    return (
        <>
            <AchievementNotification />
        </>
    );
}
