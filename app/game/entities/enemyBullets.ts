export class enemyBullet {
    private x: number;
    private y: number;
    private vx: number; // velocity x
    private vy: number; // velocity y
    private colour = '#24b300a4';//placeholder (add colour as parameter later)
    private Xradius = 3;
    private Yradius = 3;
    private Xspeed = 50;
    private Yspeed = 50;
    private bulletXGrowth = 0;
    private bulletYGrowth = 0;
    private rotation?: number;

    constructor(startX: number,
        startY: number,
        directionX: number,
        directionY: number,
        Xspeed: number,
        YSpeed: number,
        Xradius?: number,
        Yradius?: number,
        colour?: string,
        bulletXGrowth?: number,
        bulletYGrowth?: number,
        rotation?: number,
    ) {
        this.x = startX;
        this.y = startY;
        this.Xradius = Xradius ?? this.Xradius;
        this.Yradius = Yradius ?? this.Yradius;
        this.colour = colour ?? this.colour;
        this.Xspeed = Xspeed ?? this.Xspeed;
        this.Yspeed = YSpeed ?? this.Xspeed; //if Yspeed is not provided, use Xspeed for a consistent speed in all directions
        this.bulletXGrowth = bulletXGrowth ?? this.bulletXGrowth;
        this.bulletYGrowth = bulletYGrowth ?? this.bulletYGrowth;
        this.rotation = rotation;

        //normalize direction
        const length = Math.sqrt(directionX ** 2 + directionY ** 2);
        this.vx = (directionX / length) * this.Xspeed;
        this.vy = (directionY / length) * this.Yspeed;
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

        //optional growth of hitbox over time
        this.Xradius += (this.Xradius * this.bulletXGrowth) * dt;
        this.Yradius += (this.Yradius * this.bulletYGrowth) * dt;
    }
    draw(ctx: CanvasRenderingContext2D) {
        const angle = this.rotation ?? Math.atan2(this.vy, this.vx) + Math.PI / 2;
        ctx.fillStyle = this.colour;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.Xradius, this.Yradius, angle, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
        return (this.x + this.Xradius < 0) ||
            (this.x - this.Xradius > canvasWidth) ||
            (this.y + this.Yradius < 0) ||
            (this.y - this.Yradius > canvasHeight);
    }

}