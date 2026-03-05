
'use client';
import Snake from '@/components/games/Snake';

export default function Games() {
    // For now, this component just renders the Snake game.
    // In the future, it could act as a menu or router for multiple games.
    return (
        <div className="w-full h-full">
            <Snake />
        </div>
    );
}

    