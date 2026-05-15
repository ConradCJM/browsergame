export class Player {
    private hp = 3;
    private maxHp = 3;

    private hitIframesDuration = 1.67; //duration of invulnerability in seconds

    private x: number;
    private y: number;
    private Xspeed = 155; //pixels per second
    private Yspeed = 175; //pixels per second
    private focusSpeed = 75; //slow when focus

    private isFocused = false;

    private hitboxRadius = 2;
    private hitboxColor = '#cef8ff';

    private diamondWidth = 10;
    private diamondHeight = 14;
    private diamondColor = '#419aff';
    private focusTransparency = 0.2;

    getHp() {
        return this.hp;
    }

    getMaxHp() {
        return this.maxHp;
    }

    getHitIframesDuration() {
        return this.hitIframesDuration;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    






    //conmstructor
    constructor(startX: number, startY: number) {
        this.x = startX;
        this.y = startY;
    }

    //movement updater
    update(dt: number, keys: Record<string, boolean>, canvasWidth: number, canvasHeight: number) {
        const Xspeed = this.isFocused ? this.focusSpeed : this.Xspeed;
        const Yspeed = this.isFocused ? this.focusSpeed : this.Yspeed; 
        if (keys['arrowup'] || keys['w']) this.y -= Yspeed * dt;
        if (keys['arrowdown'] || keys['s']) this.y += Yspeed * dt;
        if (keys['arrowleft'] || keys['a']) this.x -= Xspeed * dt;
        if (keys['arrowright'] || keys['d']) this.x += Xspeed * dt;
        this.isFocused = keys['shift'];

        //keep player in map
        this.x = Math.max((this.hitboxRadius / 2), Math.min(this.x, canvasWidth - (this.hitboxRadius / 2)));
        this.y = Math.max((this.hitboxRadius / 2), Math.min(this.y, canvasHeight - (this.hitboxRadius / 2)));
    }

    //draw player
    draw(ctx: CanvasRenderingContext2D) {

        //focus transparency
        ctx.globalAlpha = this.isFocused ? this.focusTransparency : 1;

        //diamond
        ctx.fillStyle = this.diamondColor;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.diamondHeight);
        ctx.lineTo(this.x + this.diamondWidth, this.y);
        ctx.lineTo(this.x, this.y + this.diamondHeight);
        ctx.lineTo(this.x - this.diamondWidth, this.y);
        ctx.closePath();
        ctx.fill();

        //circle hitbox
        if (this.isFocused)
            ctx.globalAlpha = 1;
        ctx.fillStyle = this.hitboxColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2);
        ctx.fill();


    }

    getBulletPattern(now: number, playerBulletDesync: number, playerBulletSpread: number) {
        const bullets: { spawnTime: number; x: number; y: number; dirX?: number; dirY?: number }[] = [];

        if (this.isFocused) {
            //focused firing
            bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: 0, dirY: -1 });
            bullets.push({ spawnTime: now + playerBulletDesync, x: this.x + playerBulletSpread, y: this.y, dirX: 0, dirY: -1 });
            bullets.push({ spawnTime: now + playerBulletDesync, x: this.x - playerBulletSpread, y: this.y, dirX: 0, dirY: -1 });
            bullets.push({ spawnTime: now + playerBulletDesync * 2, x: this.x + playerBulletSpread * 2, y: this.y, dirX: 0, dirY: -1 });
            bullets.push({ spawnTime: now + playerBulletDesync * 2, x: this.x - playerBulletSpread * 2, y: this.y, dirX: 0, dirY: -1 });
            bullets.push({ spawnTime: now + playerBulletDesync * 3, x: this.x + playerBulletSpread * 3, y: this.y, dirX: -Math.sin(Math.PI / 90), dirY: -Math.cos(Math.PI / 6) });
            bullets.push({ spawnTime: now + playerBulletDesync * 3, x: this.x - playerBulletSpread * 3, y: this.y, dirX: Math.sin(Math.PI / 90), dirY: -Math.cos(Math.PI / 6) });

        } else {
            //spread firing
            bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: 0, dirY: -1 });
            bullets.push({ spawnTime: now + playerBulletDesync, x: this.x + playerBulletSpread, y: this.y, dirX: Math.sin(Math.PI / 9), dirY: -Math.cos(Math.PI / 9) });
            bullets.push({ spawnTime: now + playerBulletDesync, x: this.x - playerBulletSpread, y: this.y, dirX: -Math.sin(Math.PI / 9), dirY: -Math.cos(Math.PI / 9) });
            bullets.push({ spawnTime: now + playerBulletDesync * 2, x: this.x + playerBulletSpread * 2, y: this.y, dirX: Math.sin(Math.PI / 6), dirY: -Math.cos(Math.PI / 6) });
            bullets.push({ spawnTime: now + playerBulletDesync * 2, x: this.x - playerBulletSpread * 2, y: this.y, dirX: -Math.sin(Math.PI / 6), dirY: -Math.cos(Math.PI / 6) });
            bullets.push({ spawnTime: now + playerBulletDesync * 3, x: this.x + playerBulletSpread * 3, y: this.y, dirX: Math.sin(Math.PI / 18), dirY: -Math.cos(Math.PI / 6) });
            bullets.push({ spawnTime: now + playerBulletDesync * 3, x: this.x - playerBulletSpread * 3, y: this.y, dirX: -Math.sin(Math.PI / 18), dirY: -Math.cos(Math.PI / 6) });
        }

        return bullets;
    }

}
