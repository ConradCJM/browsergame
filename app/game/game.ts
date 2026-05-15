import { Player } from './entities/player';
import { Input } from './systems/input';
import { playerBullet } from './entities/playerBullet';
import { enemy } from './entities/enemy';
import { enemyBullet } from './entities/enemyBullets';
import { EnemyType } from './constants';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private running = false;
    private lastTime = 0;
    private input: Input;
    private player: Player;

    private enemies: enemy[] = [];
    private enemyBullets: enemyBullet[] = [];

    private playerBullets: playerBullet[] = [];
    private playerBulletSpread = 6; //disrtance between bullets
    private playerBulletDesync = 0.05; //time between each bullet in a burst

    //list of pending player bullets
    private pendingPlayerBullets: { spawnTime: number; x: number; y: number; dirX?: number; dirY?: number }[] = [];

    //pending enemy bullets (patterns that spawn bullets over time instead of all at once)
    private pendingEnemyBullets: any[] = [];

    queueEnemyBullet(spec: any) {
        this.pendingEnemyBullets.push(spec);
    }

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.input = new Input();
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 50);
        this.enemies.push(new enemy(this.canvas.width / 2, 100, EnemyType.Basic, this));
    }

    getPlayer() {
        return this.player;
    }


    addEnemyBullet(bullet: enemyBullet) {
        this.enemyBullets.push(bullet);
    }

    getEnemyBullets() {
        return this.enemyBullets;
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

        //enemy stuff
        this.enemies.forEach(e => e.update(dt));
        this.enemyBullets.forEach(b => b.update(dt));
        this.enemyBullets = this.enemyBullets.filter(b => !b.isOffScreen(this.canvas.width, this.canvas.height));

        //player stuff
        this.player.update(dt, this.input.keys, this.canvas.width, this.canvas.height);

        if (this.input.keys[' ']) {
            const now = performance.now() / 1000;
            if (now - this.input.lastShootTime >= this.input.shootCooldown) {
                this.input.lastShootTime = now;
                const bulletPattern = this.player.getBulletPattern(now, this.playerBulletDesync, this.playerBulletSpread);
                this.pendingPlayerBullets.push(...bulletPattern);
            }
        }

        //spawn pending player bullets when their time comes
        const now = performance.now() / 1000;
        this.pendingPlayerBullets = this.pendingPlayerBullets.filter(pending => {
            if (now >= pending.spawnTime) {
                this.playerBullets.push(new playerBullet(pending.x, pending.y, pending.dirX ?? 0, pending.dirY ?? -1));
                return false; //remove from pending
            }
            return true;
        });

        //spawn pending enemy bullets when their time comes
        this.pendingEnemyBullets = this.pendingEnemyBullets.filter(pending => {
            if (now >= pending.spawnTime) {
                this.enemyBullets.push(new enemyBullet(pending.x, pending.y, pending.dirX, pending.dirY, pending.bulletSpeed, pending.bulletXRadius, pending.bulletYRadius, pending.bulletColor));
                return false;
            }
            return true;
        });

        //update player bullets
        this.playerBullets.forEach(b => b.update(dt));

        //remove offscreen player bullets
        this.playerBullets = this.playerBullets.filter(b => !b.isOffScreen(this.canvas.width, this.canvas.height));
    }



    private render() {
        //clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //player
        this.player.draw(this.ctx);

        //enemies
        this.enemies.forEach(e => e.draw(this.ctx));

        //bullets
        this.playerBullets.forEach(b => b.draw(this.ctx));
        this.enemyBullets.forEach(b => b.draw(this.ctx));
    }
}