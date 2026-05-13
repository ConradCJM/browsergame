export class Player {
    x: number;
    y: number;
    speed = 200; //pixels/second
    focusSpeed = 100; //slow when focus
    
    isFocused = false;

    hitboxRadius = 2;
    hitboxColor = '#ffffff';

    diamondWidth = 8;
    diamondHeight = 12;          
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
        this.x = Math.max(0, Math.min(this.x, canvasWidth));
        this.y = Math.max(0, Math.min(this.y, canvasHeight));
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
