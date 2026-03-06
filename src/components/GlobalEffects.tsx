'use client';

import { useUiStore } from '@/store/uiStore';
import { useEffect } from 'react';

export default function GlobalEffects() {
    const isGlitching = useUiStore((state) => state.isGlitching);

    useEffect(() => {
        if (isGlitching) {
            document.body.classList.add('glitch-active');
        } else {
            document.body.classList.remove('glitch-active');
        }
    }, [isGlitching]);

    return null; // This component doesn't render anything
}
