export class playerBullet {
    x: number;
    y: number;
    vx: number; // velocity x
    vy: number; // velocity y
    speed = 400; // pixels per second
    Xradius = 3;
    Yradius = 7;
    color = '#41e9ff';
    transparency = 0.2;

    constructor(startX: number, startY: number, directionX: number, directionY: number) {
        this.x = startX;
        this.y = startY;

        //normalize direction
        const length = Math.sqrt(directionX ** 2 + directionY ** 2);
        this.vx = (directionX / length) * this.speed;
        this.vy = (directionY / length) * this.speed;
    }

    update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;//rotate to match velocity direction
        ctx.globalAlpha = this.transparency;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.Xradius, this.Yradius, angle, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
        return this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight;
    }
}