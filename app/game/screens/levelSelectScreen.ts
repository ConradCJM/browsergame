import { Screen } from '@/app/game/screens/screenInterface';
import { Input } from '@/app/game/systems/input';

export class LevelSelectScreen implements Screen {
  constructor() {}

  update(dt: number): void {}

  handleInput(input: Input): void {}

  render(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '30px fantasy';
    ctx.textAlign = 'center';
    ctx.fillText('Level Select', ctx.canvas.width / 2, ctx.canvas.height / 2);
  }
}