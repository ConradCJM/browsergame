import { Screen } from '@/app/game/screens/screenInterface';
import { Input } from '@/app/game/systems/input';

export class GameOverScreen implements Screen {
  private onRetry: () => void;
  private onLevelSelect: () => void;

  constructor(onRetry: () => void, onLevelSelect: () => void) {
    this.onRetry = onRetry;
    this.onLevelSelect = onLevelSelect;
  }

  update(dt: number): void {}

  handleInput(input: Input): void {
    if (input.keys['r']) {
      this.onRetry();
    }
    if (input.keys['l']) {
      this.onLevelSelect();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '30px fantasy';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);

    ctx.font = '20px fantasy';
    ctx.fillText('Press R to Retry or L for Level Select', ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
  }
}