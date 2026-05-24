import { Screen } from '@/app/game/screens/screenInterface';
import { Button } from '@/app/game/ui/button';
import { Input } from '@/app/game/systems/input';
import { Level } from '@/app/game/constants';

export class LevelSelectScreen implements Screen {
  private buttons: Button[] = [];

  constructor(onLevelSelect?: (level: Level) => void) {
    
    this.setupButtons(onLevelSelect);
  }

  private setupButtons(onLevelSelect?: (level: Level) => void) {
    const buttonWidth = 55;
    const buttonHeight = 55;
    const startX = 25;
    const startY = 150;
    const spacing = 80;
    const buttonColor = '#004902';
    const hoverColor = '#00ff00a0';
    const textColor = '#ffffff';
    const font = '18px fantasy';

    // Create buttons for each level
    this.buttons.push(
      new Button(startX, startY, buttonWidth, buttonHeight, 'Tutorial', 
        () => onLevelSelect?.(Level.Tutorial),buttonColor,hoverColor,textColor, font)
    );
    this.buttons.push(
      new Button(startX+ spacing, startY , buttonWidth, buttonHeight, 'Level 1', 
        () => onLevelSelect?.(Level.CampaignLevel1),buttonColor,hoverColor,textColor, font));
    this.buttons.push(
      new Button(startX+ spacing * 2, startY , buttonWidth, buttonHeight, 'Boss 1', 
        () => onLevelSelect?.(Level.BossLevel1),buttonColor,hoverColor,textColor, font));
  }

  update(dt: number): void {}

  handleInput(input: Input): void {
    //update hover state for all buttons
    this.buttons.forEach(button => {
      button.update(input.mouseX, input.mouseY);
    });

    //handle clicks
    if (input.mouseClicked) {
      this.buttons.forEach(button => button.handleClick());
      input.mouseClicked = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '30px fantasy';
    ctx.textAlign = 'center';
    ctx.fillText('Level Select', ctx.canvas.width / 2, 25);

    //draw all buttons
    this.buttons.forEach(button => button.draw(ctx));
  }
}