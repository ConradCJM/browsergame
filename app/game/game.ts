import { Player } from '@/app/game/entities/player';
import { Input } from '@/app/game/systems/input';
import { playerBullet } from '@/app/game/entities/playerBullet';
import { enemy } from '@/app/game/entities/enemy';
import { enemyBullet } from '@/app/game/entities/enemyBullets';
import { EnemyType } from '@/app/game/constants';
import { checkCollisions } from '@/app/game/systems/collision';
import { Shockwave } from '@/app/game/entities/shockwave';
import { createLevel } from '@/app/game/systems/stagescript';
import { PlayerHpDisplay } from '@/app/game/entities/hpBar';


export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private running = false;
    private lastTime = 0;
    private input: Input;
    private player: Player;

    private enemies: enemy[] = [];
    private pendingEnemies: { spawnTime: number; x: number; y: number; type: EnemyType }[] = [];
    private enemyBullets: enemyBullet[] = [];

    private playerBullets: playerBullet[] = [];
    private playerBulletSpread = 6; //disrtance between bullets
    private playerBulletDesync = 0.05; //time between each bullet in a burst

    private playerHpDisplay: PlayerHpDisplay = new PlayerHpDisplay(10, 20, 16);

    //list of pending player bullets
    private pendingPlayerBullets: {
        spawnTime: number;
        x: number;
        y: number;
        dirX?: number;
        dirY?: number
    }[] = [];

    //pending enemy bullets (patterns that spawn bullets over time instead of all at once)
    private pendingEnemyBullets: {
        spawnTime: number;
        x: number;
        y: number;
        dirX: number;
        dirY: number;
        bulletXSpeed: number;
        bulletYSpeed: number;
        bulletXRadius: number;
        bulletYRadius: number;
        bulletColor: string;
        bulletXGrowth: number;
        bulletYGrowth: number;
    }[] = [];

    //shockwave effects
    private shockwaves: Shockwave[] = [];

    ///level controller didnt think i would actually need to use interfaces that i learned in class lol
    private levelController: { update(dt: number): void } | null = null

    addEnemyToQueue(x: number, y: number, type: EnemyType, delay: number) {
        this.pendingEnemies.push({ spawnTime: performance.now() / 1000 + delay, x, y, type });
    }

    queueEnemyBullet(spec: any) {
        this.pendingEnemyBullets.push(spec);
    }

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.input = new Input();
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 50);

        // this.levelController = createLevel(this, 1);
        this.addEnemyToQueue(200,50, EnemyType.SentryBoss, 2);
    }
    addEnemy(startx: number, starty: number, type: EnemyType) {
        this.enemies.push(new enemy(startx, starty, type, this));
    }

    getEnemies() {
        return this.enemies;
    }

    getPendingEnemies() {
        return this.pendingEnemies;
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

    killAllEnemies() {
        this.enemies.forEach(e => {
            e.takeDamage(9999);
        });
    }


    private update(dt: number) {

        //enemy stuff
        this.enemies.forEach(e => e.update(dt));
        this.enemyBullets.forEach(b => b.update(dt));
        this.enemyBullets = this.enemyBullets.filter(b => !b.isOffScreen(this.canvas.width, this.canvas.height));

        //player stuff
        this.player.update(dt, this.input.keys, this.canvas.width, this.canvas.height);

        //player attack
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
                this.enemyBullets.push(new enemyBullet(pending.x, pending.y, pending.dirX, pending.dirY, pending.bulletXSpeed, pending.bulletYSpeed, pending.bulletXRadius, pending.bulletYRadius, pending.bulletColor, pending.bulletXGrowth, pending.bulletYGrowth));
                return false;
            }
            return true;
        });

        //spawn pending enemies when their time comes
        this.pendingEnemies = this.pendingEnemies.filter(pending => {
            if (now >= pending.spawnTime) {
                this.addEnemy(pending.x, pending.y, pending.type);
                return false;
            }
            return true;
        });

        //update level-specific logic
        if (this.levelController) {
            this.levelController.update(dt);
        }

        //update player bullets
        this.playerBullets.forEach(b => b.update(dt));

        //remove offscreen player bullets
        this.playerBullets = this.playerBullets.filter(b => !b.isOffScreen(this.canvas.width, this.canvas.height));

        checkCollisions(this.player, this.enemies, this.playerBullets, this.enemyBullets, this.shockwaves);

        //remove dead enemies & create shockwave
        this.enemies = this.enemies.filter(e => {
            if (e.isDead()) {
                this.shockwaves.push(new Shockwave(e.getX(), e.getY(), (e.getXRadius() + e.getYRadius()) / 2, 0.5, e.getColor()));
                return false; // Remove enemy
            }
            return true;
        });
        //update shockwaves and remove finished ones
        this.shockwaves = this.shockwaves.filter(sw => sw.update(dt));


        if (this.player.getHp() <= 0) {
            this.stop();
            alert('You died! Refresh to play again.');
        }
    }



    private render() {
        //clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //shockwaves
        this.shockwaves.forEach(sw => sw.draw(this.ctx));

        //bullets
        this.playerBullets.forEach(b => b.draw(this.ctx));
        this.enemyBullets.forEach(b => b.draw(this.ctx));

        //player
        this.player.draw(this.ctx);

        //enemies
        this.enemies.forEach(e => e.draw(this.ctx));

        //player health bar
        this.playerHpDisplay.draw(this.ctx, this.player.getHp(), this.player.getMaxHp());


    }
}