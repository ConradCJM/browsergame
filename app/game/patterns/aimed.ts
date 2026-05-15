// app/game/patterns/aimed.ts

import { Player } from '@/app/game/entities/player';

// Helper: Calculate direction from enemy to player
function getDirectionToPlayer(enemyX: number, enemyY: number, player: Player): { dirX: number; dirY: number } {
    const dx = player.getX() - enemyX;
    const dy = player.getY() - enemyY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
        dirX: distance > 0 ? dx / distance : 0,
        dirY: distance > 0 ? dy / distance : 0
    };
}

//spread of bullets aimed at player
export function aimedSpreadToPlayer(
    enemyX: number,
    enemyY: number,
    player: Player,
    burstCount: number = 1,
    burstInterval: number = 0.05,
    bulletCount: number = 6,
    spreadAngle: number = Math.PI / 12,
    aimOffset: number = 0,
): { dirX: number; dirY: number; delay: number }[] {
    const { dirX, dirY } = getDirectionToPlayer(enemyX, enemyY, player);
    const specs = [];
    const baseAngle = Math.atan2(dirY, dirX) + aimOffset;
    const lowerBound = -Math.floor(bulletCount / 2);
    const upperBound = Math.floor(bulletCount / 2);
    
    for (let j = 0; j < burstCount; j++) {
        for (let i = lowerBound; i <= upperBound; i++) {
            const angle = baseAngle + (i * spreadAngle);
            specs.push({
                dirX: Math.cos(angle),
                dirY: Math.sin(angle),
                delay: j * burstInterval
            });
        }
    }
    
    return specs;
}

//spread of bullets aimed at direction
export function aimedSpreadToDirection(
    dirX: number,
    dirY: number,
    burstCount: number = 1,
    burstInterval: number = 0.05,
    bulletCount: number = 6,
    spreadAngle: number = Math.PI / 12,
    aimOffset: number = 0,
): { dirX: number; dirY: number; delay: number }[] {
    const baseAngle = Math.atan2(dirY, dirX) + aimOffset;
    const specs = [];
    const lowerBound = -Math.floor(bulletCount / 2);
    const upperBound = Math.floor(bulletCount / 2);
    
    for (let j = 0; j < burstCount; j++) {
        for (let i = lowerBound; i <= upperBound; i++) {
            const angle = baseAngle + (i * spreadAngle);
            specs.push({
                dirX: Math.cos(angle),
                dirY: Math.sin(angle),
                delay: j * burstInterval
            });
        }
    }
    
    return specs;
}