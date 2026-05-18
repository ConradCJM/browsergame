import { Shockwave } from './shockwave';
export class Player {
    private hp = 5;
    private maxHp = 5;

    private hitIframesDuration = 3; //duration of invulnerability in seconds
    private isInHitIframes = false;
    private hitIframesTimer = 0;

    private x: number;
    private y: number;
    private Xspeed = 165; //pixels per second
    private Yspeed = 165; //pixels per second
    private focusSpeed = 75; //slow when focus

    private isFocused = false;

    private hitboxRadius = 2; //visual size of hitbox actual hitbox radius used in collision detection is half of this value
    private hitboxColor = '#cef8ff';

    private diamondWidth = 10;
    private diamondHeight = 14;
    private diamondColor = '#419aff';
    private focusTransparency = 0.2;

    private shockwaves: Shockwave[] = [];

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

    takeDamage(amount: number) {
        if (this.isInHitIframes) return; //ignore damage if in hit invulnerability frames
        this.isInHitIframes = true;
        this.hitIframesTimer = 0;
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.shockwaves.push(new Shockwave(this.x, this.y,500, 0.5));
    }

    drawClearEnemyBulletsEffect(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#24b300a4';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 50, 0, Math.PI * 2);
        ctx.fill();
    }

    getHitboxRadius() {
        return this.hitboxRadius/2;
    }






    //conmstructor
    constructor(startX: number, startY: number, maxHp?: number,hp?: number) {
        this.x = startX;
        this.y = startY;
        this.maxHp = maxHp ?? this.maxHp;
        this.hp = hp ?? this.hp;
    }

    //movement updater
    update(dt: number, keys: Record<string, boolean>, canvasWidth: number, canvasHeight: number) {
        if (this.isInHitIframes) {
            this.hitIframesTimer += dt;
        }
        if (this.hitIframesTimer >= this.hitIframesDuration) {
            this.isInHitIframes = false;
            this.hitIframesTimer = 0;
        }
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

        //shockwave effect
        this.shockwaves = this.shockwaves.filter(sw => sw.update(dt));
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

        //draw shockwave
        this.shockwaves.forEach(sw => sw.draw(ctx));
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
