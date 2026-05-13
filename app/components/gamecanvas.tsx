'use client';
import { useEffect, useRef } from 'react';
import { Game } from '@/app/game/game';

//vibe coded ts, not sure if this is how you would normally do it in react but it works and is pretty clean and I dont wanna do the front end

export function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        gameRef.current = new Game(canvasRef.current);
        gameRef.current.start();

        return () => gameRef.current?.stop();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={400}
            height={600}
            style={{ border: '2px solid #0f0', display: 'block', backgroundColor: '#000' }}
        />
    );
}