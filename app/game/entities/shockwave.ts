export class Shockwave {
    private x: number;
    private y: number;
    private currentRadius: number = 0;
    private maxRadius: number = 150;
    private duration: number = 0.3;
    private elapsedTime: number = 0;
    private color = '#81ff6299';

    constructor(x: number, y: number, maxRadius?: number, duration?: number,color?: string) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius ?? this.maxRadius;
        this.duration = duration ?? this.duration;
        this.color = color ?? this.color;
    }

    update(dt: number): boolean {
        this.elapsedTime += dt;
        this.currentRadius = (this.elapsedTime / this.duration) * this.maxRadius;
        return this.elapsedTime < this.duration;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}