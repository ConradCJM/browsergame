import { Screen } from '@/app/game/screens/screenInterface';
import { Input } from '@/app/game/systems/input';
import { Game } from '@/app/game/game';
import { checkCollisions } from '@/app/game/systems/collision';
import { TutorialOverlay } from '@/app/game/ui/tutorialOverlay';

export class GameScreen implements Screen {
    private game: Game;
    private onGameOver: () => void;
    private onLevelClear: () => void;
    private onPause: () => void;
    private tutorialOverlay: TutorialOverlay | undefined;
    private lastMouseClick: { x: number; y: number } | undefined;
    private lastEscapePressed = false;

    constructor(game: Game, onGameOver: () => void, onLevelClear: () => void, onPause: () => void) {
        this.game = game;
        this.onGameOver = onGameOver;
        this.onLevelClear = onLevelClear;
        this.onPause = onPause;

        document.addEventListener('click', (e) => {
            const canvas = this.game.getCanvas();
            const rect = canvas.getBoundingClientRect();
            this.lastMouseClick = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });
    }
    setTutorialOverlay(overlay: TutorialOverlay): void {
        this.tutorialOverlay = overlay;
    }

    update(dt: number): void {
        const player = this.game.getPlayer();
        if (!player) return;

        //check tutorial overlay actions (if tutorial is active)
        if (this.tutorialOverlay && !this.tutorialOverlay.isDone()) {
            if (this.tutorialOverlay.checkAction({
                spacedPressed: this.game.getInput().keys[' '],
                shiftPressed: this.game.getInput().keys['shift'],
                mouseClick: this.lastMouseClick
            })) {
                this.tutorialOverlay.advance();
                this.lastMouseClick = undefined; //reset click after processing
            }
        }

        //enemy stuff
        this.game.getEnemies().forEach(e => e.update(dt));
        this.game.getEnemyBullets().forEach(b => b.update(dt));
        this.game.getEnemyBullets().forEach(b => {
            if (b.isOffScreen(this.game.getCanvas().width, this.game.getCanvas().height)) {
                const idx = this.game.getEnemyBullets().indexOf(b);
                if (idx > -1) this.game.getEnemyBullets().splice(idx, 1);
            }
        });

        //player update
        player.update(dt, this.game.getInput().keys, this.game.getCanvas().width, this.game.getCanvas().height);

        //player attack
        if (this.game.getInput().keys[' ']) {
            const now = performance.now() / 1000;
            if (now - this.game.getInput().lastShootTime >= this.game.getPlayer().getAttackCooldown()) { //ignore this bug since player will always be defined at this time
                this.game.getInput().lastShootTime = now;
                const bulletPattern = player.getBulletPattern(now);
                bulletPattern.forEach(pattern => this.game.queuePlayerBullet(pattern));
            }
        }

        const now = performance.now() / 1000;
        this.game.spawnPendingPlayerBullets(now);
        this.game.spawnPendingEnemyBullets(now);
        this.game.spawnPendingEnemies(now);
        this.game.spawnPendingDamageZones(now);

        //update damage zones
        this.game.getDamageZones().forEach(zone => zone.update(dt));
        this.game.getWarningDamageZones().forEach(w => w.elapsedTime += dt);

        //remove expired damage zones
        const validDamageZones = this.game.getDamageZones().filter(zone => zone.getElapsed() < zone.getDuration());
        this.game.getDamageZones().length = 0;
        this.game.getDamageZones().push(...validDamageZones);

        //remove expired warning zones
        const validWarnings = this.game.getWarningDamageZones().filter(w => w.elapsedTime < w.warningDuration);
        this.game.getWarningDamageZones().length = 0;
        this.game.getWarningDamageZones().push(...validWarnings);

        //update level controller
        this.game.updateLevelController(dt);

        //collision checks
        checkCollisions(player, this.game.getEnemies(), this.game.getPlayerBullets(), this.game.getEnemyBullets(), this.game.getShockwaves(), this.game.getHealItems(), this.game.getDamageZones());

        //remove dead enemies and create shockwaves
        this.game.removeDeadEnemiesAndCreateShockwaves();

        //update and filter shockwaves and heal items
        this.game.updateAndFilterShockwaves(dt);
        this.game.updateAndFilterHealItems(dt, this.game.getCanvas());
        this.game.updateAndFilterPlayerBullets(dt, this.game.getCanvas());
        this.game.filterOffscreenEnemyBullets(this.game.getCanvas());

        //game over check
        if (player.getHp() <= 0) {
            this.onGameOver();
        }
    }

    handleInput(input: Input): void {
        //check for pause (only trigger on key press transition, not while held)
        const isEscapePressed = input.keys['escape'];
        if (isEscapePressed && !this.lastEscapePressed) {
            this.onPause();
        }
        this.lastEscapePressed = isEscapePressed;
    }

    render(ctx: CanvasRenderingContext2D): void {
        const player = this.game.getPlayer();

        //player
        if (player) {
            player.draw(ctx);
        }

        //healing items
        this.game.getHealItems().forEach(item => item.draw(ctx));

        //shockwaves
        this.game.getShockwaves().forEach(sw => sw.draw(ctx));

        //damage zone warnings (semi-transparent preview)
        this.game.getWarningDamageZones().forEach(warning => {
            warning.zone.drawWarning(ctx);
        });

        //active damage zones
        this.game.getDamageZones().forEach(zone => {
            zone.draw(ctx);
        });

        //bullets
        this.game.getPlayerBullets().forEach(b => b.draw(ctx));
        this.game.getEnemyBullets().forEach(b => b.draw(ctx));

        //enemies
        this.game.getEnemies().forEach(e => e.draw(ctx));

        if (this.tutorialOverlay && !this.tutorialOverlay.isDone()) {
            this.tutorialOverlay.draw(ctx, this.game.getCanvas().width, this.game.getCanvas().height);
        }

        //player health bar
        if (player) {
            this.game.getPlayerHpDisplay()?.draw(ctx, player.getHp(), player.getMaxHp());
        }

        //wave timer bar
        this.game.drawWaveTimerBar(ctx);


    }
}