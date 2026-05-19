export class hpBar {
    private x: number
    private y: number;
    private width: number;
    private height: number;
    private color = '#ff0000';
    private backgroundColor = '#000000';
    private borderColor = '#ffffff';
    private borderWidth = 2;

    private currentHp: number;
    private maxHp: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        currentHp: number,
        maxHp: number,
        color?: string,
        backgroundColor?: string,
        borderColor?: string,
        borderWidth?: number) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.currentHp = currentHp;
        this.maxHp = maxHp;

        this.color = color ?? this.color;
        this.backgroundColor = backgroundColor ?? this.backgroundColor;
        this.borderColor = borderColor ?? this.borderColor;
        this.borderWidth = borderWidth ?? this.borderWidth;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const radius = this.height / 2; //creates pill-shaped ends

        //draw background
        ctx.beginPath();
        ctx.fillStyle = this.backgroundColor;
        ctx.roundRect(this.x, this.y, this.width, this.height, radius);
        ctx.fill();

        //draw border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.borderWidth;
        ctx.stroke();

        //draw HP fill
        ctx.beginPath();
        const hpWidth = (this.currentHp / this.maxHp) * this.width;
        ctx.fillStyle = this.color;
        ctx.roundRect(this.x, this.y, hpWidth, this.height, radius);
        ctx.fill();
    }
    updateHp(currentHp: number) {
        this.currentHp = currentHp;
    }
}
//boss health bar class
export class BossHealthBar extends hpBar {
    constructor(x: number, y: number, width: number, height: number,
        currentHp: number, maxHp: number) {
        // Boss bars typically: wider, different colors, at top of screen
        super(x, y, width, height, currentHp, maxHp,
            '#ff009d7c',   //hp colour
            '#1a1a1a',    //background
            '#ffffff',    //border
            3);           // thicker border
    }
}

//player health display class
export class PlayerHpDisplay {
    private x: number;
    private y: number;
    private fontSize: number = 20;
    private fontColor = '#ffffff';
    private fontFamily = 'Arial';

    constructor(x: number, y: number, fontSize?: number) {
        this.x = x;
        this.y = y;
        if (fontSize) this.fontSize = fontSize;
    }

    draw(ctx: CanvasRenderingContext2D, currentHp: number, maxHp: number) {
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.fontColor;
        ctx.textAlign = 'left';
        ctx.fillText(`HP: ${currentHp}/${maxHp}`, this.x, this.y);
    }
}