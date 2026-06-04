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
    setX(x: number) {
        this.x = x;
    }
    setY(y: number) {
        this.y = y;
    }
    getY() {
        return this.y;
    }
    getVx() {
        return this.vx;
    }
    getVy() {
        return this.vy;
    }
    setVx(vx: number) {
        this.vx = vx;
    }
    setVy(vy: number) {
        this.vy = vy;
    }
    setDirection(directionX: number, directionY: number) {
        const length = Math.sqrt(directionX ** 2 + directionY ** 2);
        this.vx = (directionX / length) * this.Xspeed;
        this.vy = (directionY / length) * this.Yspeed;
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
        return ((this.x + this.Xradius < 0) ||
            (this.x - this.Xradius > canvasWidth) ||
            (this.y + this.Yradius < 0) ||
            (this.y - this.Yradius > canvasHeight)) || (this.Xradius <= 0) || (this.Yradius <= 0); //also consider bullets with no size as offscreen to prevent invisible bullets that can still damage the player
    }

}//placeholder for now
export class redirectingEnemyBullet extends enemyBullet {}

//placeholder for now
export class homingEnemyBullet extends enemyBullet {}


export class momentumChangingEnemyBullet extends enemyBullet {
    private changes: { time: number, newDx: number, newDy: number }[];
    private timer: number = 0;

    constructor(startX: number,
        startY: number,
        directionX: number,
        directionY: number,
        Xspeed: number,
        YSpeed: number,
        changes: { time: number, newDx: number, newDy: number }[],
        Xradius?: number,
        Yradius?: number,
        colour?: string,
        bulletXGrowth?: number,
        bulletYGrowth?: number,
        rotation?: number,
    ) {
        super(startX, startY, directionX, directionY, Xspeed, YSpeed, Xradius, Yradius, colour, bulletXGrowth, bulletYGrowth, rotation);
        this.changes = changes;
    }

    update(dt: number) {
        super.update(dt);
        this.timer += dt;

        //check if it's time to change momentum
        while (this.changes.length > 0 && this.timer >= this.changes[0].time) {
            const change = this.changes.shift()!;
            this.setDirection(change.newDx, change.newDy);
        }
    }
}