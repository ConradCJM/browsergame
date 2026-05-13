'use client';
import { GameCanvas } from '@/app/components/gamecanvas';

//vibe coded ts but it works and I dont like doing front end lol
export default function Home() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#000' }}>
      <GameCanvas />
    </main>
  );
}
