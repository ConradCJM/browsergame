import { Screen } from '@/app/game/screens/screenInterface';
import { Button } from '@/app/game/ui/button';
import { Input } from '@/app/game/systems/input';

export class MainMenuScreen implements Screen {
  private buttons: Button[] = [];

  constructor(canvasWidth: number, canvasHeight: number, onPlayClick: () => void) {
    this.setupButtons(canvasWidth, canvasHeight, onPlayClick);
  }

  private setupButtons(canvasWidth: number, canvasHeight: number, onPlayClick: () => void) {
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = canvasWidth / 2 - buttonWidth / 2;
    const buttonY = canvasHeight - 120;

    this.buttons.push(
      new Button(buttonX, buttonY, buttonWidth, buttonHeight, 'Play Game', onPlayClick)
    );
  }

  update(dt: number): void {}

  handleInput(input: Input): void {
    this.buttons.forEach(button => {
      button.update(input.mouseX, input.mouseY);
    });

    if (input.mouseClicked) {
      this.buttons.forEach(button => button.handleClick());
      input.mouseClicked = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '48px fantasy';
    ctx.textAlign = 'center';
    ctx.fillText('Game', ctx.canvas.width / 2, 100);

    this.buttons.forEach(button => button.draw(ctx));
  }
}