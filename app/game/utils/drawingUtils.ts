export function drawPolygon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    sides: number,
    rotation: number = 0,
    fillColour: string,
    strokeColour: string = '#ffffff',
    lineWidth: number = 2
) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides + rotation;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fillColour;
    ctx.fill();
    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

export function drawIsometricPolygon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    primaryColour: string,
    secondaryColour: string,
    sides: number = 6,
    scaleX: number = 1,
    scaleY: number = 1,
    rotation: number = 0,
) {
    const isoX = (px: number, py: number, pz: number) => x + (px - py) * Math.cos(Math.PI / 6) * scaleX;
    const isoY = (px: number, py: number, pz: number) => y + (px + py) * Math.sin(Math.PI / 6) * scaleY - pz;

    const rotatedPoint = (angle: number) => {
        const localAngle = angle + rotation;
        return {
            px: size * Math.cos(localAngle),
            py: size * Math.sin(localAngle),
        };
    };

    ctx.fillStyle = secondaryColour;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const { px, py } = rotatedPoint(angle);
        const x2 = isoX(px, py, 0);
        const y2 = isoY(px, py, 0);
        if (i === 0) ctx.moveTo(x2, y2);
        else ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = primaryColour;
    const depth = size * 0.5;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const { px, py } = rotatedPoint(angle);
        const x2 = isoX(px, py, depth);
        const y2 = isoY(px, py, depth);
        if (i === 0) ctx.moveTo(x2, y2);
        else ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
export function drawEllipse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    fillColour: string
) {
    ctx.fillStyle = fillColour;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
}

export function drawHollowEllipse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    strokeColour: string,
    lineWidth: number = 2
) {
    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
}

export function drawIsometricEllipse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    primaryColour: string,
    secondaryColour: string,
    scaleX: number = 1,
    scaleY: number = 1,
    segments: number = 32,
    rotation: number = 0
) {
    const isoX = (px: number, py: number, pz: number) => x + (px - py) * Math.cos(Math.PI / 6) * scaleX;
    const isoY = (px: number, py: number, pz: number) => y + (px + py) * Math.sin(Math.PI / 6) * scaleY - pz;

    const rotatePoint = (px: number, py: number) => ({
        x: px * Math.cos(rotation) - py * Math.sin(rotation),
        y: px * Math.sin(rotation) + py * Math.cos(rotation),
    });

    ctx.fillStyle = secondaryColour;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const px = radiusX * Math.cos(angle);
        const py = radiusY * Math.sin(angle);
        const rotated = rotatePoint(px, py);
        const x2 = isoX(rotated.x, rotated.y, 0);
        const y2 = isoY(rotated.x, rotated.y, 0);
        if (i === 0) ctx.moveTo(x2, y2);
        else ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = primaryColour;
    const depth = Math.max(radiusX, radiusY) * 0.5;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const px = radiusX * Math.cos(angle);
        const py = radiusY * Math.sin(angle);
        const rotated = rotatePoint(px, py);
        const x2 = isoX(rotated.x, rotated.y, depth);
        const y2 = isoY(rotated.x, rotated.y, depth);
        if (i === 0) ctx.moveTo(x2, y2);
        else ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}