export class Player {
    hp = 3;
    maxHp = 3;

    hitIframesDuration = 1.67; //duration of invulnerability in seconds

    x: number;
    y: number;
    speed = 200; //pixels per second
    focusSpeed = 90; //slow when focus
    
    isFocused = false;

    hitboxRadius = 2;
    hitboxColor = '#cef8ff';

    diamondWidth = 10;
    diamondHeight = 14;          
    diamondColor = '#419aff';  
    focusTransparency = 0.2;  

    //conmstructor
    constructor(startX: number, startY: number) {
        this.x = startX;
        this.y = startY;
    }

    //movement updater
    update(dt: number, keys: Record<string, boolean>, canvasWidth: number, canvasHeight: number) {
        const speed = this.isFocused ? this.focusSpeed : this.speed;
        if (keys['arrowup'] || keys['w']) this.y -= speed * dt;
        if (keys['arrowdown'] || keys['s']) this.y += speed * dt;
        if (keys['arrowleft'] || keys['a']) this.x -= speed * dt;
        if (keys['arrowright'] || keys['d']) this.x += speed * dt;
        this.isFocused = keys['shift'];

        //keep player in map
        this.x = Math.max((this.hitboxRadius/2), Math.min(this.x, canvasWidth-(this.hitboxRadius/2)));
        this.y = Math.max((this.hitboxRadius/2), Math.min(this.y, canvasHeight-(this.hitboxRadius/2)));
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
    } else {
        //spread firing
        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: 0, dirY: -1 });
        bullets.push({ spawnTime: now + playerBulletDesync, x: this.x + playerBulletSpread, y: this.y, dirX: Math.sin(Math.PI / 9), dirY: -Math.cos(Math.PI / 6) });
        bullets.push({ spawnTime: now + playerBulletDesync, x: this.x - playerBulletSpread, y: this.y, dirX: -Math.sin(Math.PI / 9), dirY: -Math.cos(Math.PI / 6) });
        bullets.push({ spawnTime: now + playerBulletDesync * 2, x: this.x + playerBulletSpread * 2, y: this.y, dirX: Math.sin(Math.PI / 6), dirY: -Math.cos(Math.PI / 5)});
        bullets.push({ spawnTime: now + playerBulletDesync * 2, x: this.x - playerBulletSpread * 2, y: this.y, dirX: -Math.sin(Math.PI / 6), dirY: -Math.cos(Math.PI / 5) });
    }
    
    return bullets;
}
    
}
