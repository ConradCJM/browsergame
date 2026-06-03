export function ringPattern(
    burstCount: number = 1,
    burstInterval: number = 0.05,
    spreadAngle: number = Math.PI / 12,
    angleOffset: number | number[] | (() => number) = 0,
    startAngle: number = Math.PI / 2,
): { dirX: number; dirY: number; delay: number }[] {
    const specs = [];
    const isOffsetArray = Array.isArray(angleOffset);
    const isOffsetFunction = typeof angleOffset === 'function';
    const bulletCount = Math.round((2 * Math.PI) / spreadAngle);
    
    for (let j = 0; j < burstCount; j++) {
        let offset: number;
        if (isOffsetFunction) {
            offset = (angleOffset as () => number)();
        } else if (isOffsetArray) {
            offset = angleOffset[j % angleOffset.length];
        } else {
            offset = angleOffset;
        }

        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + (i * spreadAngle) + (j * spreadAngle / bulletCount) + offset;      
            specs.push({
                dirX: Math.cos(angle),
                dirY: Math.sin(angle),
                delay: j * burstInterval
            });
        }
    }
    return specs
}