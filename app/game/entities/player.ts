export class Player {
    hp = 3;
    maxHp = 3;

    hitIframesDuration = 1.67; //duration of invulnerability in seconds

    x: number;
    y: number;
    speed = 225; //pixels per second
    focusSpeed = 100; //slow when focus
    
    isFocused = false;

    hitboxRadius = 4;
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
        if (this.isFocused) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = this.hitboxColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
    }
}
