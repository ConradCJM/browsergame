export interface TutorialMessage {
    text: string;
    position: { x: number; y: number };
    pointTo?: 'hpBar' | 'waveTimer' | 'player';
    requiredAction?: 'space' | 'shift' | 'both' | 'clickable';
    actionHint?: string;  // e.g., "Press SPACE to shoot"
}

export class TutorialOverlay {
    private messages: TutorialMessage[] = [];
    private currentMessageIndex = 0;
    private isComplete = false;
    private clickBounds = { x: 0, y: 0, width: 0, height: 0 };

    constructor(messages: TutorialMessage[]) {
        this.messages = messages;
    }

    getCurrentMessage(): TutorialMessage | null {
        return this.messages[this.currentMessageIndex] ?? null;
    }
    getCurrentMessageIndex(): number {
        return this.currentMessageIndex;
    }

    //check if player performed required action
    checkAction(input: {
        spacedPressed: boolean;
        shiftPressed: boolean;
        mouseClick?: { x: number; y: number };
    }): boolean {
        const msg = this.getCurrentMessage();
        if (!msg) return false;

        switch (msg.requiredAction) {
            case 'space':
                return input.spacedPressed;
            case 'shift':
                return input.shiftPressed;
            case 'both':
                return input.spacedPressed && input.shiftPressed;
            case 'clickable':
                if (input.mouseClick) {
                    const { x, y } = input.mouseClick;
                    return x >= this.clickBounds.x &&
                        x <= this.clickBounds.x + this.clickBounds.width &&
                        y >= this.clickBounds.y &&
                        y <= this.clickBounds.y + this.clickBounds.height;
                }
                return false;
            default:
                return false;
        }
    }

    advance(): void {
        if (this.currentMessageIndex < this.messages.length - 1) {
            this.currentMessageIndex++;
        } else {
            this.isComplete = true;
        }
    }

    isDone(): boolean {
        return this.isComplete;
    }

    draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
        const msg = this.getCurrentMessage();
        if (!msg) return;

        //draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        //draw message text
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px fantasy';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const lineHeight = 30;
        const lines = this.wrapText(ctx, msg.text, 300);

        lines.forEach((line, i) => {
            ctx.fillText(line, msg.position.x, msg.position.y + i * lineHeight);
        });

        //draw arrow pointing to target
        if (msg.pointTo === 'hpBar' || msg.pointTo === 'waveTimer') {
            this.drawArrow(ctx, msg, canvasWidth, canvasHeight);
        }

        //draw hint or clickable box
        if (msg.requiredAction === 'clickable') {
            this.drawClickableHint(ctx, msg, canvasWidth, canvasHeight);
        } else if (msg.actionHint) {
            ctx.fillStyle = '#ffff00';
            ctx.font = '16px fantasy';
            ctx.fillText(`>>> ${msg.actionHint} <<<`, msg.position.x, msg.position.y + lines.length * lineHeight + 20);
        }
    }

    private drawArrow(ctx: CanvasRenderingContext2D, msg: TutorialMessage, canvasWidth: number, canvasHeight: number): void {
        let targetX = 0, targetY = 0;

        //calculate arrow target based on pointTo
        switch (msg.pointTo) {
            case 'hpBar':
                targetX = 200;
                targetY = 590;
                break;
            case 'waveTimer':
                targetX = 390;
                targetY = 400;
                break;
            case 'player':
                targetX = canvasWidth / 2;
                targetY = canvasHeight - 50;
                break;
        }

        //draw arrow line
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(200, 400);
        if (msg.pointTo === 'hpBar') {
            ctx.lineTo(targetX, targetY - 10);
        }
        else if (msg.pointTo === 'waveTimer') {
            ctx.lineTo(targetX - 10, targetY);
        }

        ctx.stroke();

        //draw arrowhead
        let angle = Math.PI / 2;
        if (msg.pointTo === 'waveTimer') {
            angle = 0;
        }
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(targetX - 12 * Math.cos(angle - Math.PI / 6), targetY - 12 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(targetX - 12 * Math.cos(angle + Math.PI / 6), targetY - 12 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }

    private drawClickableHint(ctx: CanvasRenderingContext2D, msg: TutorialMessage, canvasWidth: number, canvasHeight: number): void {
        const boxWidth = 150;
        const boxHeight = 50;
        const boxX = msg.position.x;
        const boxY = msg.position.y + 100;


        //draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px fantasy';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Click to Continue', boxX + boxWidth / 2, boxY + boxHeight / 2);

        //store bounds for click detection
        this.clickBounds = { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
    }

    private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) lines.push(currentLine);
        return lines;
    }
}