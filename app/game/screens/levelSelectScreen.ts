import { Screen } from '@/app/game/screens/screenInterface';
import { Button } from '@/app/game/ui/button';
import { Input } from '@/app/game/systems/input';
import { Level } from '@/app/game/constants';

export class LevelSelectScreen implements Screen {
  private buttons: Button[] = [];
  private onMainMenu?: () => void;

  constructor(onLevelSelect?: (level: Level) => void, onMainMenu?: () => void) {
    this.onMainMenu = onMainMenu;
    this.setupButtons(onLevelSelect);
  }

  private setupButtons(onLevelSelect?: (level: Level) => void) {
    const canvasWidth = 400;
    const buttonsPerRow = 5;

    const buttonWidth = 55;
    const buttonHeight = 55;
    const startX = 12.5;
    const startY = 150;
    const spacing = canvasWidth/buttonsPerRow;
    const buttonColour = '#004902';
    const hoverColour = '#00ff00a0';
    const textColour = '#ffffff';
    const font = '18px fantasy';

    // Create buttons for each level
    this.buttons.push(
      new Button(startX, startY, buttonWidth, buttonHeight, 'Tutorial', 
        () => onLevelSelect?.(Level.Tutorial),buttonColour,hoverColour,textColour, font)
    );
    this.buttons.push(
      new Button(startX+ spacing, startY , buttonWidth, buttonHeight, 'Level 1', 
        () => onLevelSelect?.(Level.CampaignLevel1),buttonColour,hoverColour,textColour, font));
    this.buttons.push(
      new Button(startX+ spacing * 2, startY , buttonWidth, buttonHeight, 'Boss 1', 
        () => onLevelSelect?.(Level.BossLevel1),buttonColour,hoverColour,textColour, font));
    this.buttons.push(
      new Button(startX+ spacing * 3, startY , buttonWidth, buttonHeight, 'Level 2', 
        () => onLevelSelect?.(Level.CampaignLevel2),buttonColour,hoverColour,textColour, font));
    this.buttons.push(
      new Button(startX+ spacing * 4, startY , buttonWidth, buttonHeight, 'Boss 2', 
        () => onLevelSelect?.(Level.BossLevel2),buttonColour,hoverColour,textColour, font));
  }

  update(dt: number): void {}

  handleInput(input: Input): void {
    //M key to return to main menu
    if (input.keys['m']) {
      input.keys['m'] = false;
      this.onMainMenu?.();
      return;
    }

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

    // Draw key bindings
        ctx.fillStyle = '#ffffff';
        ctx.font = '26px fantasy';
        ctx.textAlign = 'center';
        ctx.fillText('M: Main Menu', ctx.canvas.width / 2, 565);
  }
}