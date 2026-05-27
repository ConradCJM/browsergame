import { Screen } from '@/app/game/screens/screenInterface';
import { Input } from '@/app/game/systems/input';

export class PauseScreen implements Screen {
  private onUnpause: () => void;
  private onRetry: () => void;
  private onLevelSelect: () => void;
  private lastEscapePressed = false;
  private lastRPressed = false;
  private lastLPressed = false;

  constructor(onUnpause: () => void, onRetry: () => void, onLevelSelect: () => void) {
    this.onUnpause = onUnpause;
    this.onRetry = onRetry;
    this.onLevelSelect = onLevelSelect;
  }

  update(dt: number): void {}

  handleInput(input: Input): void {
    const isEscapePressed = input.keys['escape'];
    if (isEscapePressed && !this.lastEscapePressed) {
      this.onUnpause();
    }
    this.lastEscapePressed = isEscapePressed;

    const isRPressed = input.keys['r'];
    if (isRPressed && !this.lastRPressed) {
      this.onRetry();
    }
    this.lastRPressed = isRPressed;

    const isLPressed = input.keys['l'];
    if (isLPressed && !this.lastLPressed) {
      this.onLevelSelect();
    }
    this.lastLPressed = isLPressed;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '48px fantasy';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2 - 60);

    ctx.font = '24px fantasy';
    ctx.fillText('ESC - Resume', ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.fillText('R - Restart', ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
    ctx.fillText('L - Level Select', ctx.canvas.width / 2, ctx.canvas.height / 2 + 80);
  }
}
