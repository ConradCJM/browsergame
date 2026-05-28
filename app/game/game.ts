import { Player } from '@/app/game/entities/player';
import { Input } from '@/app/game/systems/input';
import { enemy } from '@/app/game/entities/enemy';
import { enemyBullet } from '@/app/game/entities/enemyBullets';
import { EnemyType } from '@/app/game/constants';
import { Shockwave } from '@/app/game/entities/shockwave';
import { createLevel } from '@/app/game/systems/stagescript';
import { PlayerHpDisplay } from '@/app/game/ui/hpBar';
import { healItem } from '@/app/game/entities/healItem';
import { Level } from '@/app/game/constants';
import { WaveTimerBar } from '@/app/game/ui/waveTimerBar';

//import screens
import { Screen } from '@/app/game/screens/screenInterface';
import { MainMenuScreen } from '@/app/game/screens/mainMenuScreen';
import { GameScreen } from '@/app/game/screens/gameScreen';
import { GameOverScreen } from '@/app/game/screens/gameOverScreen';
import { LevelClearScreen } from '@/app/game/screens/levelClearScreen';
import { LevelSelectScreen } from '@/app/game/screens/levelSelectScreen';
import { PauseScreen } from '@/app/game/screens/pauseScreen';
import { playerBullet,xFollowingPlayerBullet } from '@/app/game/entities/playerBullet';


import {PlayerCharacter} from '@/app/game/constants';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private running = false;
    private lastTime = 0;
    private input: Input;
    private player: Player = new Player(this, 0, 0, PlayerCharacter.Archer); //placeholder player until one is added by level controller

    private enemies: enemy[] = [];
    private pendingEnemies: { spawnTime: number; x: number; y: number; type: EnemyType, hasHealItem: boolean }[] = [];
    private enemyBullets: enemyBullet[] = [];
    private playerBullets: playerBullet[] = [];
    private playerHpDisplay?: PlayerHpDisplay;
    private waveTimerBar?: WaveTimerBar;
    private healItems: healItem[] = [];
    private shockwaves: Shockwave[] = [];

    private pendingPlayerBullets: {
        spawnTime: number;
        x: number;
        y: number;
        dirX?: number;
        dirY?: number;
        speed?: number;
        xRadius?: number;
        yRadius?: number;
        colour?: string;
    }[] = [];

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
        bulletColour: string;
        bulletXGrowth: number;
        bulletYGrowth: number;
    }[] = [];

    private levelController: { update(dt: number): void, getWaveTimerPercent(): number } | null = null;
    private level: Level = Level.CampaignLevel1;

    //screen manager
    private currentScreen: Screen;
    private pausedGameScreen: GameScreen | null = null;
    private lastPauseTransitionTime = 0;
    private pauseTransitionCooldown = 0.2; // 200ms cooldown to prevent flickering

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.input = new Input();
        this.waveTimerBar = new WaveTimerBar(canvas.width, canvas.height);

        //initialize with main menu
        this.currentScreen = new MainMenuScreen(canvas.width, canvas.height, () => this.goToLevelSelect());
    }

    private startGame() {
        this.levelController = createLevel(this, this.level);

        const gameScreen = new GameScreen(
            this,
            () => this.gameOver(),
            () => this.levelClear(),
            () => this.pauseGame()
        );


        //tutorial level
        if (this.level === Level.Tutorial && 'getTutorialOverlay' in this.levelController) {
            gameScreen.setTutorialOverlay((this.levelController as any).getTutorialOverlay());
        }

        this.currentScreen = gameScreen;

    }

    private pauseGame() {
        const now = performance.now() / 1000;
        //don't allow pause if still in cooldown from last transition
        if (now - this.lastPauseTransitionTime < this.pauseTransitionCooldown) {
            return;
        }
        this.lastPauseTransitionTime = now;

        if (this.currentScreen instanceof GameScreen) {
            this.pausedGameScreen = this.currentScreen;
        }
        this.input.keys['escape'] = false; // Clear escape key to prevent immediate unpause
        this.currentScreen = new PauseScreen(
            () => this.unpauseGame(),
            () => this.startGame(),
            () => this.goToLevelSelect()
        );
    }

    private unpauseGame() {
        const now = performance.now() / 1000;
        //don't allow unpause if still in cooldown from last transition
        if (now - this.lastPauseTransitionTime < this.pauseTransitionCooldown) {
            return;
        }
        this.lastPauseTransitionTime = now;

        if (this.pausedGameScreen) {
            this.input.keys['escape'] = false; //clear escape key to prevent immediate re-pause
            this.currentScreen = this.pausedGameScreen;
            this.pausedGameScreen = null;
        }
    }

    private gameOver() {
        this.currentScreen = new GameOverScreen(
            () => this.startGame(),
            () => this.goToLevelSelect()
        );
    }
    createWaveTimerBar() {
        this.waveTimerBar = new WaveTimerBar(this.canvas.width, this.canvas.height);
    }

    killAllEnemies() {
        this.pendingEnemies = [];
        this.enemies.forEach(e => {
            e.takeDamage(9999);
        });
    }

    public levelClear() {
        this.currentScreen = new LevelClearScreen(
            () => this.startGame(),
            () => this.goToLevelSelect()
        );
    }

    private goToLevelSelect() {
        this.resetGame();
        this.currentScreen = new LevelSelectScreen((selectedLevel: Level) => {
            this.level = selectedLevel;  //set the selected level
            this.startGame();            //start the game with selected level
        });
    }

    getCanvas() {
        return this.canvas;
    }

    getInput() {
        return this.input;
    }

    getPendingPlayerBullets() {
        return this.pendingPlayerBullets;
    }

    getPendingEnemyBullets() {
        return this.pendingEnemyBullets;
    }

    getPlayerBullets() {
        return this.playerBullets;
    }

    getShockwaves() {
        return this.shockwaves;
    }

    getHealItems() {
        return this.healItems;
    }

    getPlayerHpDisplay() {
        return this.playerHpDisplay;
    }

    queuePlayerBullet(spec: any) {
        this.pendingPlayerBullets.push(spec);
    }

    queueEnemyBullet(spec: any) {
        this.pendingEnemyBullets.push(spec);
    }

    updateLevelController(dt: number) {
        if (this.levelController) {
            this.levelController.update(dt);
        }
    }

    drawWaveTimerBar(ctx: CanvasRenderingContext2D) {
        if (!this.levelController || !this.waveTimerBar) return;
        this.waveTimerBar.draw(ctx, this.levelController.getWaveTimerPercent());
    }

    addPlayer(player: Player) {
        const hpBarHeightOffset = 2.5;
        this.player = player;
        this.playerHpDisplay = new PlayerHpDisplay(0, this.canvas.height - hpBarHeightOffset - 3, this.canvas.width, player.getMaxHp());
    }

    addEnemy(startx: number, starty: number, type: EnemyType, hasHealItem: boolean) {
        this.enemies.push(new enemy(startx, starty, type, this, hasHealItem));
    }

    addEnemyBullet(bullet: enemyBullet) {
        this.enemyBullets.push(bullet);
    }

    addHealItem(x: number, y: number) {
        this.healItems.push(new healItem(x, y));
    }

    addEnemyToQueue(x: number, y: number, type: EnemyType, delay: number, hasHealItem: boolean) {
        this.pendingEnemies.push({ spawnTime: performance.now() / 1000 + delay, x, y, type, hasHealItem });
    }

    getEnemies() {
        return this.enemies;
    }

    getEnemyBullets() {
        return this.enemyBullets;
    }

    getPendingEnemies() {
        return this.pendingEnemies;
    }

    getPlayer() {
        return this.player;
    }

    getPlayerHpBarHeight() {
        if (!this.playerHpDisplay) return 0;
        return this.playerHpDisplay.getBarHeight();
    }

    getTimerBarWidth() {
        if (!this.waveTimerBar) return 0;
        return this.waveTimerBar.getWidth();
    }

    resetGame() {
        this.clearEntities();
        this.clearUiElements();
    }

    spawnPlayerBullet(startX: number, startY: number, dirX: number, dirY: number, speed?: number, xRadius?: number, yRadius?: number, colour?: string) {
        this.playerBullets.push(new playerBullet(startX, startY, dirX, dirY, speed, xRadius, yRadius, colour));
    }

    //ignore bug since player will always be defined when this is called
    spawnXFollowingPlayerBullet(player: Player, startX: number, startY: number, speed?: number, xRadius?: number, yRadius?: number, colour?: string) {
        this.playerBullets.push(new xFollowingPlayerBullet(this.player,startX, startY, speed, xRadius, yRadius, colour));
    }

    spawnPendingPlayerBullets(now: number) {
        this.pendingPlayerBullets = this.pendingPlayerBullets.filter(pending => {
            if (now >= pending.spawnTime) {
                this.playerBullets.push(new playerBullet(pending.x, pending.y, pending.dirX ?? 0, pending.dirY ?? -1, pending.speed, pending.xRadius, pending.yRadius, pending.colour));
                return false; //remove from pending
            }
            return true;
        });
    }
    removeDeadEnemiesAndCreateShockwaves() {
        this.enemies = this.enemies.filter(e => {
            if (e.isDead()) {
                this.shockwaves.push(new Shockwave(e.getX(), e.getY(), (e.getXRadius() + e.getYRadius()) / 2, 0.5, e.getColour()));
                console.log('Enemy killed');
                if (e.getHealItem()) {
                    console.log('dropping heal item');
                    this.addHealItem(e.getX(), e.getY());
                    console.log('Heal item added')
                }
                return false;
            }
            return true;
        });
    }

    spawnPendingEnemyBullets(now: number) {
        this.pendingEnemyBullets = this.pendingEnemyBullets.filter(pending => {
            if (now >= pending.spawnTime) {
                this.enemyBullets.push(new enemyBullet(pending.x, pending.y, pending.dirX, pending.dirY, pending.bulletXSpeed, pending.bulletYSpeed, pending.bulletXRadius, pending.bulletYRadius, pending.bulletColour, pending.bulletXGrowth, pending.bulletYGrowth));
                return false; //remove from pending
            }
            return true;
        });
    }

    spawnPendingEnemies(now: number) {
        this.pendingEnemies = this.pendingEnemies.filter(pending => {
            if (now >= pending.spawnTime) {
                this.addEnemy(pending.x, pending.y, pending.type, pending.hasHealItem);
                return false; //remove from pending
            }
            return true;
        });
    }
    updateAndFilterShockwaves(dt: number) {
        this.shockwaves = this.shockwaves.filter(sw => sw.update(dt));
    }

    updateAndFilterHealItems(dt: number, canvas: HTMLCanvasElement) {
        this.healItems.forEach(item => item.update(dt));
        this.healItems = this.healItems.filter(item => {
            if (item.isOffScreen(canvas.width, canvas.height)) {
                return false;
            }
            return true;
        });
    }

    updateAndFilterPlayerBullets(dt: number, canvas: HTMLCanvasElement) {
        this.playerBullets.forEach(b => b.update(dt));
        this.playerBullets = this.playerBullets.filter(b => !b.isOffScreen(canvas.width, canvas.height));
    }

    filterOffscreenEnemyBullets(canvas: HTMLCanvasElement) {
        this.enemyBullets = this.enemyBullets.filter(b => !b.isOffScreen(canvas.width, canvas.height));
    }

    private clearUiElements() {
        this.playerHpDisplay = undefined;
        this.waveTimerBar = undefined;
    }

    private clearEntities() {
        this.enemies = [];
        this.pendingEnemies = [];
        this.pendingEnemyBullets = [];
        this.enemyBullets = [];
        this.playerBullets = [];
        this.healItems = [];
        this.shockwaves = [];
        this.pendingPlayerBullets = [];
        this.player = null as any;
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
        const dt = Math.min((now - this.lastTime) / 1000, 0.016);
        this.lastTime = now;

        this.update(dt);
        this.render();

        if (this.running) {
            requestAnimationFrame(this.gameLoop);
        }
    };

    private update(dt: number) {
        this.currentScreen.handleInput(this.input);
        this.currentScreen.update(dt);
    }

    private render() {
        //clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //current screen
        this.currentScreen.render(this.ctx);
    }
}