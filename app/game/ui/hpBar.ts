export class hpBar {
    private x: number
    private y: number;
    private width: number;
    private height: number;
    private colour = '#ff0000';
    private backgroundColour = '#000000';
    private borderColour = '#ffffff';
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
        colour?: string,
        backgroundColour?: string,
        borderColour?: string,
        borderWidth?: number) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.currentHp = currentHp;
        this.maxHp = maxHp;

        this.colour = colour ?? this.colour;
        this.backgroundColour = backgroundColour ?? this.backgroundColour;
        this.borderColour = borderColour ?? this.borderColour;
        this.borderWidth = borderWidth ?? this.borderWidth;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const radius = this.height / 2; //creates pill-shaped ends

        //draw background
        ctx.beginPath();
        ctx.fillStyle = this.backgroundColour;
        ctx.roundRect(this.x, this.y, this.width, this.height, radius);
        ctx.fill();

        //draw border
        ctx.strokeStyle = this.borderColour;
        ctx.lineWidth = this.borderWidth;
        ctx.stroke();

        //draw HP fill
        ctx.beginPath();
        const hpWidth = (this.currentHp / this.maxHp) * this.width;
        ctx.fillStyle = this.colour;
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
        // Boss bars typically: wider, different colours, at top of screen
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
    private screenWidth: number;
    private barCount: number = 5;
    private barHeight: number = 15;
    private barSpacing: number = 5;  //small gap between bars
    private litColour = '#00ddffa9';
    private unlockedColour = '#444444';
    private borderColour = '#ffffff';
    private borderWidth = 2;

    constructor(x: number, y: number, screenWidth: number, barCount?: number) {
        this.x = x;
        this.y = y;
        this.screenWidth = screenWidth;
        if (barCount) this.barCount = barCount;
    }

    draw(ctx: CanvasRenderingContext2D, currentHp: number, maxHp: number) {
        const litBars = Math.ceil((currentHp / maxHp) * this.barCount);

        //calculate bar width to fit screen
        const totalSpacing = this.barSpacing * (this.barCount - 1);
        const barWidth = (this.screenWidth - totalSpacing) / this.barCount;

        for (let i = 0; i < this.barCount; i++) {
            const barX = this.x + i * (barWidth + this.barSpacing);

            ctx.fillStyle = i < litBars ? this.litColour : this.unlockedColour;
            ctx.fillRect(barX, this.y, barWidth, this.barHeight);

            ctx.strokeStyle = this.borderColour;
            ctx.lineWidth = this.borderWidth;
            ctx.strokeRect(barX, this.y, barWidth, this.barHeight);
        }
    }

    getBarHeight() {
        return this.barHeight;
    }
}