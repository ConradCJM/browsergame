
export class WaveTimerBar {
    private barWidth: number;
    private barColor: string;
    private barBackgroundColor: string;
    private canvasHeight: number;
    private canvasWidth: number;

    constructor(
        canvasWidth: number,
        canvasHeight: number,
        barWidth: number = 2.5,
        barColor: string = '#00ff0079',
        barBackgroundColor: string = '#003300'
    ) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.barWidth = barWidth;
        this.barColor = barColor;
        this.barBackgroundColor = barBackgroundColor;
    }

    draw(ctx: CanvasRenderingContext2D, timerPercent: number) {
        const filledHeight = this.canvasHeight * timerPercent;

        //left bar background
        ctx.fillStyle = this.barBackgroundColor;
        ctx.fillRect(0, this.barWidth, this.barWidth, this.canvasHeight);

        //right bar background
        ctx.fillRect(this.canvasWidth - this.barWidth, this.barWidth, this.barWidth, this.canvasHeight);

        //left bar fill (fills from bottom up)
        ctx.fillStyle = this.barColor;
        ctx.fillRect(0, this.canvasHeight - filledHeight, this.barWidth, filledHeight);

        //right bar fill (fills from bottom up)
        ctx.fillRect(this.canvasWidth - this.barWidth, this.canvasHeight - filledHeight, this.barWidth, filledHeight);
    }

    getWidth() {
        return this.barWidth;
    }
}