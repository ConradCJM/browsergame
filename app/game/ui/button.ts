export class Button {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private text: string;
    private isHovered = false;
    private onClick: () => void;
    private hoverColour: string;
    private normalColour: string;
    private textColour: string;
    private font: string;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        onClick: () => void,
        normalColour: string = '#004902',
        hoverColour: string = '#00ff00a0',
        textColour: string = '#ffffff',
        font: string = '24px fantasy'
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.onClick = onClick;
        this.normalColour = normalColour;
        this.hoverColour = hoverColour;
        this.textColour = textColour;
        this.font = font;
    }

    update(mouseX: number, mouseY: number) {
        this.isHovered = mouseX >= this.x && 
                         mouseX <= this.x + this.width &&
                         mouseY >= this.y && 
                         mouseY <= this.y + this.height;
    }

    draw(ctx: CanvasRenderingContext2D) {
        //draw button background
        ctx.fillStyle = this.isHovered ? this.hoverColour : this.normalColour;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        //draw button text
        ctx.fillStyle = this.textColour;
        ctx.font = this.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }

    handleClick(): boolean {
        if (this.isHovered) {
            this.onClick();
            return true;
        }
        return false;
    }

    isClicked(mouseX: number, mouseY: number): boolean {
        return this.isHovered;
    }
}
