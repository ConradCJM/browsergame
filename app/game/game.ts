import { Player } from './entities/player';
import { Input } from './systems/input';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private running = false;
    private lastTime = 0;
    private input: Input;
    private player: Player;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.input = new Input();
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 50);
    }



    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop(performance.now());
    }

    stop() {
        this.running = false;
    }

    private gameLoop = (now: number) => {
        const dt = Math.min((now - this.lastTime) / 1000, 0.016); //60fps
        this.lastTime = now;

        this.update(dt);
        this.render();

        if (this.running) {
            requestAnimationFrame(this.gameLoop);
        }
    };

    private update(dt: number) {
        this.player.update(dt, this.input.keys, this.canvas.width, this.canvas.height);
        //update game state here
        //enemy AI
        //bnullet positions
        //collision checks
    }



    private render() {
        //clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //player
        this.player.draw(this.ctx);

    }
}