import { Player } from "./player";
export class playerBullet {
    private x: number;
    private y: number;
    private vx: number; // velocity x
    private vy: number; // velocity y
    private speed = 400; // pixels per second
    private Xradius = 3;
    private Yradius = 7;
    private colour = '#41e9ff';
    private outsideMapMargin = 50; //how far outside the map the bullet can go before being removed

    constructor(startX: number, startY: number, directionX: number, directionY: number, speed?: number, xRadius?: number, yRadius?: number, colour?: string) {
        this.x = startX;
        this.y = startY;

        this.speed = speed ?? this.speed;
        this.Xradius = xRadius ?? this.Xradius;
        this.Yradius = yRadius ?? this.Yradius;
        this.colour = colour ?? this.colour;

        //normalize direction
        const length = Math.sqrt(directionX ** 2 + directionY ** 2);
        this.vx = (directionX / length) * this.speed;
        this.vy = (directionY / length) * this.speed;
    }

    getColour() {
        return this.colour;
    }
    getX() {
        return this.x;
    }
    setX(x: number) {
        this.x = x;
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
        ctx.globalAlpha = 1
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
export class xFollowingPlayerBullet extends playerBullet {
    private player: Player;
    private xOffset: number = 0;
    private previousPlayerX: number;

    constructor(player: Player, startX: number, startY: number, dirX: number, dirY: number, xOffset?: number, speed?: number, xRadius?: number, yRadius?: number, colour?: string) {
        super(startX, startY, dirX, dirY, speed, xRadius, yRadius, colour);
        this.player = player;
        this.xOffset = xOffset ?? 0;
        // Apply offset to starting position
        this.setX(startX + this.xOffset);
        this.previousPlayerX = player.getX();
    }

    update(dt: number) {
        super.update(dt);
        
        //calculate how much the player moved
        const currentPlayerX = this.player.getX();
        const playerDeltaX = currentPlayerX - this.previousPlayerX;
        
        //apply the same movement to the bullet
        this.setX(this.getX() + playerDeltaX);
        
        //update for next frame
        this.previousPlayerX = currentPlayerX;
    }
}