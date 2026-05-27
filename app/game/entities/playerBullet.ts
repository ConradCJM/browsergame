export class playerBullet {
    private x: number;
    private y: number;
    private vx: number; // velocity x
    private vy: number; // velocity y
    private speed = 400; // pixels per second
    private Xradius = 3;
    private Yradius = 7;
    private colour = '#41e9ff';
    private transparency = 0.2;
    private outsideMapMargin = 50; //how far outside the map the bullet can go before being removed

    constructor(startX: number, startY: number, directionX: number, directionY: number) {
        this.x = startX;
        this.y = startY;

        //normalize direction
        const length = Math.sqrt(directionX ** 2 + directionY ** 2);
        this.vx = (directionX / length) * this.speed;
        this.vy = (directionY / length) * this.speed;
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }

    getXRadius() {
        return this.Xradius;
    }
    getYRadius() {
        return this.Yradius;
    }

    update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;//rotate to match velocity direction
        ctx.globalAlpha = this.transparency;
        ctx.fillStyle = this.colour;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.Xradius, this.Yradius, angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
        return this.x + this.outsideMapMargin < 0 ||
            this.x - this.outsideMapMargin > canvasWidth ||
            this.y + this.outsideMapMargin < 0 ||
            this.y - this.outsideMapMargin > canvasHeight;
    }
}