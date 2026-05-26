import { Game } from "../game";
import { EnemyType } from "@/app/game/constants";
import { Level } from "@/app/game/constants";
import { Player } from "@/app/game/entities/player";
import { TutorialOverlay, TutorialMessage } from "@/app/game/ui/tutorialOverlay";

interface LevelController {
    update(dt: number): void;
    getWaveTimerPercent(): number;
    getTutorialOverlay?(): TutorialOverlay;
}

export function createLevel(game: Game, level: Level): LevelController {
    game.resetGame();
    game.createWaveTimerBar();
    let currentWave = 0;
    let waveQueued: boolean[] = [];
    let waveTimer = 0;
    let maxWaveTime: number[] = [];
    let playerStats = {
        maxHp: 6,
        startHp: 2,
        startX: game.getCanvas().width / 2,
        startY: game.getCanvas().height - 50,
    };
    //helper function to check if all enemies have been defeated
    function hasAllEnemiesDefeated() {
        return (game.getEnemies().length === 0 && game.getPendingEnemies().length === 0);
    }
    function waveTimeExceeded() {
        return maxWaveTime[currentWave - 1] > 0 && waveTimer > maxWaveTime[currentWave - 1];
    }
    if (level === Level.Tutorial) {
        //tutorial configuration
        const TUTORIAL_DELAY = 2; // seconds before first enemy spawns
        currentWave = 1;
        const TUTORIAL_WAVE_TIMES = [0, 10, 10, 0];

        //helper to create tutorial message with consistent defaults
        const createTutorialMessage = (
            text: string,
            requiredAction: TutorialMessage['requiredAction'],
            options?: { pointTo?: TutorialMessage['pointTo']; actionHint?: string }
        ): TutorialMessage => ({
            text,
            position: { x: 50, y: 100 },
            pointTo: options?.pointTo || 'player',
            requiredAction,
            actionHint: options?.actionHint
        });

        playerStats.maxHp = 10;
        playerStats.startHp = 6;
        waveTimer = 0;
        maxWaveTime = TUTORIAL_WAVE_TIMES;
        waveQueued = [false, false, false, false];

        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, playerStats.maxHp, playerStats.startHp));

        //create tutorial messages
        const tutorialMessages: TutorialMessage[] = [
            createTutorialMessage("Welcome to the tutorial! Use WASD to move around the arena.", 'clickable'),
            createTutorialMessage("Press SPACE to shoot enemies.", 'space', { actionHint: 'Press SPACE' }),
            createTutorialMessage("Hold SHIFT to focus and slow down for precision and see your hitbox.", 'shift', { actionHint: 'Hold SHIFT' }),
            createTutorialMessage("Press SPACE and SHIFT together for focused fire!", 'both', { actionHint: 'Press SPACE + SHIFT' }),
            createTutorialMessage("Dodge the enemy projectiles coming your way!", 'clickable', { actionHint: 'Dodge the enemy bullets' }),
            createTutorialMessage("Shoot enemies to defeat them.", 'clickable', { actionHint: 'Shoot the enemy' }),
            createTutorialMessage("Collect heal items to restore health. They are green crosses and drop from some enemies when defeated.", 'clickable'),
            createTutorialMessage("This is your HP bar: it shows your health. Don't let it drop to 0 or it's game over!", 'clickable', { pointTo: 'hpBar' }),
            createTutorialMessage("This is the wave timer: Survive until the next wave arrives OR defeat all enemies to start the next wave early.", 'clickable', { pointTo: 'waveTimer' }),
            createTutorialMessage("Defeat all waves of enemies to clear the level. Good luck!", 'clickable')
        ];

        const tutorialOverlay = new TutorialOverlay(tutorialMessages);
        let tutorialDelay = TUTORIAL_DELAY;

        return {
            update(dt: number) {
                tutorialDelay -= dt;
                waveTimer += dt;

                //delay enemy spawning while showing initial messages
                if (tutorialDelay > 0) {
                    return;
                }

                //wait for tutorial to be fully completed before spawning next waves
                if (!tutorialOverlay.isDone()) {
                    return;
                }

                //spawn first wave immediately after tutorial messages are done
                if (!waveQueued[0]) {
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 1, true);
                    waveQueued[0] = true;
                    waveTimer = 0;
                }

                //wave 2: Single basic enemy
                if (!waveQueued[1] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    currentWave = 2;
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 1, true);
                    waveQueued[1] = true;
                    waveTimer = 0;
                }
                //wave 3: Fast enemy
                else if (!waveQueued[2] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    currentWave = 3;
                    game.addEnemyToQueue(200, 75, EnemyType.Fast, 1, true);
                    waveQueued[2] = true;
                    waveTimer = 0;
                }
                //wave 4: Tanky enemy
                else if (!waveQueued[3] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    currentWave = 4;
                    game.addEnemyToQueue(-50, 200, EnemyType.Tanky, 1, true);
                    waveQueued[3] = true;
                    waveTimer = 0;
                }
                // Tutorial complete
                else if (hasAllEnemiesDefeated()) {
                    game.levelClear();
                }
            },
            getWaveTimerPercent() {
                return Math.min(waveTimer / maxWaveTime[currentWave - 1], 1);
            },
            getTutorialOverlay() {
                return tutorialOverlay;
            }
        };
    }
    if (level === Level.BossLevel1) {
        playerStats.maxHp = 1;
        playerStats.startHp = 1;

        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, playerStats.maxHp, playerStats.startHp));
        game.addEnemyToQueue(200, 100, EnemyType.SentryBoss, 3, false);

        return {
            update(dt: number) {
                if (game.getEnemies().length === 0 && game.getPendingEnemies().length === 0) {
                    game.levelClear();
                }
            }, getWaveTimerPercent() { return 1; }
        };
    }
    if (level === Level.CampaignLevel1) {
        game.addPlayer(new Player(game, game.getCanvas().width / 2, game.getCanvas().height - 50, playerStats.maxHp, playerStats.startHp));
        currentWave = 0;
        waveQueued = [false, false, false, false, false];
        waveTimer = 0;
        maxWaveTime = [20, 30, 40, 65, 0]; // 0 = no time limit for that wave

        //queue wave 0 immediately
        game.addEnemyToQueue(75, 50, EnemyType.Basic, 2, true);
        game.addEnemyToQueue(75, 50, EnemyType.Basic, 4, false);
        game.addEnemyToQueue(75, 50, EnemyType.Basic, 8, false);
        waveQueued[0] = true;
        currentWave = 1;

        //helper function to check if all enemies have been defeated
        function hasAllEnemiesDefeated() {
            return (game.getEnemies().length === 0 && game.getPendingEnemies().length === 0);
        }
        function waveTimeExceeded() {
            return maxWaveTime[currentWave - 1] > 0 && waveTimer > maxWaveTime[currentWave - 1];
        }

        return {
            update(dt: number) {
                waveTimer += dt;

                //wave 1
                if (currentWave === 1 &&
                    !waveQueued[1] &&
                    (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(200, 75, EnemyType.Fast, 1, false);
                    game.addEnemyToQueue(200, 60, EnemyType.Fast, 2, false);
                    game.addEnemyToQueue(-50, 50, EnemyType.Tanky, 8, true);
                    waveQueued[1] = true;
                    currentWave = 2;
                    waveTimer = 0;
                }
                //wave 2
                else if (currentWave === 2 &&
                    !waveQueued[2] &&
                    (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(-50, 50, EnemyType.Tanky, 1, false);
                    game.addEnemyToQueue(25, 50, EnemyType.Basic, 2, false);
                    game.addEnemyToQueue(200, 50, EnemyType.Basic, 4, false);
                    game.addEnemyToQueue(175, 50, EnemyType.Fast, 10, true);
                    waveQueued[2] = true;
                    currentWave = 3;
                    waveTimer = 0;
                }
                //wave 3
                else if (currentWave === 3 &&
                    !waveQueued[3] &&
                    (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(-50, 90, EnemyType.Tanky, 1, false);
                    game.addEnemyToQueue(-50, 100, EnemyType.Tanky, 2, true);
                    game.addEnemyToQueue(225, 40, EnemyType.Fast, 3.33, false);
                    game.addEnemyToQueue(-50, 110, EnemyType.Tanky, 3, false);
                    game.addEnemyToQueue(175, 40, EnemyType.Fast, 3.67, false);
                    game.addEnemyToQueue(-50, 120, EnemyType.Tanky, 4, true);
                    game.addEnemyToQueue(-50, 130, EnemyType.Tanky, 5, false);
                    game.addEnemyToQueue(-50, 140, EnemyType.Tanky, 6, false);
                    waveQueued[3] = true;
                    currentWave = 4;
                    waveTimer = 0;
                }
                //miniboss wave (wave 4)
                else if (currentWave === 4 &&
                    !waveQueued[4] &&
                    (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(200, 75, EnemyType.SentryMiniboss, 2, true);
                    waveQueued[4] = true;
                    currentWave = 5;
                    waveTimer = 0;
                }

                //boss wavce5
                else if (currentWave === 5 &&
                    (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(200, 100, EnemyType.SentryBoss, 2, false);
                    currentWave = 6;
                }
                else if (currentWave === 6 && hasAllEnemiesDefeated()) {
                    game.levelClear();
                }
            },
            getWaveTimerPercent() {
                if (currentWave === 0 || maxWaveTime[currentWave - 1] === 0) return 1;
                return Math.min(waveTimer / maxWaveTime[currentWave - 1], 1);
            }
        };
    }
    if (level === Level.BossLevel2) {
        playerStats.maxHp = 3;
        playerStats.startHp = 3;
        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, playerStats.maxHp, playerStats.startHp));
        game.addEnemyToQueue(-300, 100, EnemyType.TeleportingBoss, 3, false);
        return {
            update(dt: number) {
                if (game.getEnemies().length === 0 && game.getPendingEnemies().length === 0) {
                    game.levelClear();
                }
            }, getWaveTimerPercent() { return 1; }
        }
    }
    if (level === Level.CampaignLevel2) {
        playerStats.maxHp = 6;
        playerStats.startHp = 3;

        currentWave = 0;
        waveQueued = [];
        waveTimer = 0;
        maxWaveTime = [];

        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, playerStats.maxHp, playerStats.startHp));

        return {
            update(dt: number) {
                if (game.getEnemies().length === 0 && game.getPendingEnemies().length === 0) {
                    game.levelClear();
                }
            }, getWaveTimerPercent() {
                if (currentWave === 0 || maxWaveTime[currentWave - 1] === 0) return 1;
                return Math.min(waveTimer / maxWaveTime[currentWave - 1], 1);
            }
        }
    }

    return { update() { }, getWaveTimerPercent() { return 0; } };
}
