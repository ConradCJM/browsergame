export function drawPolygon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    sides: number,
    rotation: number = 0,
    fillColor: string,
    strokeColor: string = '#ffffff',
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
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

export function drawIsometricPolygon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    primaryColor: string,
    secondaryColor: string,
    sides: number = 6,
    scaleX: number = 1,
    scaleY: number = 1
) {
    const isoX = (px: number, py: number, pz: number) => x + (px - py) * Math.cos(Math.PI / 6) * scaleX;
    const isoY = (px: number, py: number, pz: number) => y + (px + py) * Math.sin(Math.PI / 6) * scaleY - pz;

    // Draw front face
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const px = size * Math.cos(angle);
        const py = size * Math.sin(angle);
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

    // Draw top face
    ctx.fillStyle = primaryColor;
    const depth = size * 0.5;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const px = size * Math.cos(angle);
        const py = size * Math.sin(angle);
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
    fillColor: string
) {
    ctx.fillStyle = fillColor;
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
    strokeColor: string,
    lineWidth: number = 2
) {
    ctx.strokeStyle = strokeColor;
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
    primaryColor: string,
    secondaryColor: string,
    scaleX: number = 1,
    scaleY: number = 1,
    segments: number = 32
) {
    const isoX = (px: number, py: number, pz: number) => x + (px - py) * Math.cos(Math.PI / 6) * scaleX;
    const isoY = (px: number, py: number, pz: number) => y + (px + py) * Math.sin(Math.PI / 6) * scaleY - pz;

    // Draw front face (secondary color)
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const px = radiusX * Math.cos(angle);
        const py = radiusY * Math.sin(angle);
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

    // Draw top face (primary color)
    ctx.fillStyle = primaryColor;
    const depth = Math.max(radiusX, radiusY) * 0.5;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const px = radiusX * Math.cos(angle);
        const py = radiusY * Math.sin(angle);
        const x2 = isoX(px, py, depth);
        const y2 = isoY(px, py, depth);
        if (i === 0) ctx.moveTo(x2, y2);
        else ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}