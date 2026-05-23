export class healItem {
    private x: number;
    private y: number;
    private xRadius = 15;
    private yRadius = 1;
    private color = '#00a50b';
    private speed = 25; //pixels per second
    private healAmount = 1;

    private height = 10;
    private width = 10;

    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getXRadius() {
        return this.xRadius;
    }
    getYRadius() {
        return this.yRadius;
    }
    getHealAmount() {
        return this.healAmount;
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    update(dt: number) {
        this.y += this.speed * dt;
    }
    draw(ctx: CanvasRenderingContext2D) {
        console.log('Drawing heal item at', this.x, this.y);
        this.drawCross(ctx, this.x, this.y, this.xRadius);
    }

    private drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        const thickness = 10; //thickness of the cross arms

        //horizontal bar
        ctx.fillRect(x - size, y - thickness / 2, size * 2, thickness);

        //vertical bar
        ctx.fillRect(x - thickness / 2, y - size, thickness, size * 2);
    }
    isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
        return this.y - this.yRadius > canvasHeight;
    }
}