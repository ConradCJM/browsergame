export class enemyBullet {
    private x: number;
    private y: number;
    private vx: number; // velocity x
    private vy: number; // velocity y
    private color = '#24b300a4';//placeholder (add colour as parameter later)
    private Xradius = 3;
    private Yradius = 3;
    private speed = 50;
    private bulletXGrowth = 0;
    private bulletYGrowth = 0;

    constructor(startX: number, startY: number, directionX: number, directionY: number, speed: number, Xradius?: number, Yradius?: number, color?: string, bulletXGrowth?: number, bulletYGrowth?: number) {
        this.x = startX;
        this.y = startY;
        this.Xradius = Xradius || this.Xradius;
        this.Yradius = Yradius || this.Yradius;
        this.color = color || this.color;
        this.speed = speed;
        this.bulletXGrowth = bulletXGrowth || this.bulletXGrowth;
        this.bulletYGrowth = bulletYGrowth || this.bulletYGrowth;

        //normalize direction
        const length = Math.sqrt(directionX ** 2 + directionY ** 2);
        this.vx = (directionX / length) * this.speed;
        this.vy = (directionY / length) * this.speed;
    }
    update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        //optional growth of hitbox over time
        this.Xradius += (this.Xradius * this.bulletXGrowth) * dt;
        this.Yradius += (this.Yradius * this.bulletYGrowth) * dt;
    }
    draw(ctx: CanvasRenderingContext2D) {
        const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.Xradius, this.Yradius, angle, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
        return this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight;
    }

}