import { Input } from '@/app/game/systems/input';

export interface Screen {
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  handleInput(input: Input): void;
}