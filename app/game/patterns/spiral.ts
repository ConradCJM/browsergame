export function spiralPattern(
    burstCount: number = 1,
    burstInterval: number = 0.05,
    bulletCount: number = 6,
    bulletInterval: number = 0.1,
    spreadAngle: number = Math.PI / 12,
    angleOffset: number | number[] = 0,
    startAngle: number = Math.PI/2,
    clockwise: boolean = true
): { dirX: number; dirY: number; delay: number }[] {
    const specs = [];
    const isOffsetArray = Array.isArray(angleOffset);

    for (let j = 0; j < burstCount; j++) {
        const offset = isOffsetArray ? angleOffset[j % angleOffset.length] : angleOffset;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = clockwise? startAngle+ (i * spreadAngle) + (j * spreadAngle / bulletCount) + offset: startAngle - (i * spreadAngle) - (j * spreadAngle / bulletCount) + offset;
            specs.push({
                dirX: Math.cos(angle),
                dirY: Math.sin(angle),
                delay: j * burstInterval + i * bulletInterval
            });
        }
    }
    return specs
}