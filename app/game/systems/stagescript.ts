import { Game } from "../game";
import { EnemyType } from "@/app/game/constants";
import { Level } from "@/app/game/constants";
import { Player } from "@/app/game/entities/player";
import { TutorialOverlay, TutorialMessage } from "@/app/game/ui/tutorialOverlay";
import { PlayerCharacter } from "@/app/game/constants";

interface LevelController {
    update(dt: number): void;
    getWaveTimerPercent(): number;
    getTutorialOverlay?(): TutorialOverlay;
}
//change this to test different characters in campaign levels without going through character select screen
const testCharacter = PlayerCharacter.Swordsman;
const testCharEnabled = false;

export function createLevel(game: Game, level: Level): LevelController {
    game.resetGame();
    game.createWaveTimerBar();
    let currentWave = 0;
    let waveQueued: boolean[] = [];
    let waveTimer = 0;
    let maxWaveTime: number[] = [];
    const selectedCharacter = testCharEnabled ? testCharacter : game.getSelectedCharacter();
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

        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, selectedCharacter, playerStats.maxHp, playerStats.startHp));

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
        playerStats.maxHp = 2; //boss has 1 stage and has rng 
        playerStats.startHp = 2;

        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, selectedCharacter, playerStats.maxHp, playerStats.startHp));
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
        game.addPlayer(new Player(game, game.getCanvas().width / 2, game.getCanvas().height - 50, selectedCharacter));
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
                    game.addEnemyToQueue(0, 50, EnemyType.Basic, 4.33, true);
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
        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, selectedCharacter, playerStats.maxHp, playerStats.startHp));
        game.addEnemyToQueue(-300, 100, EnemyType.TeleportingBoss, 3, false);
        return {
            update(dt: number) {
                if (hasAllEnemiesDefeated()) {
                    game.levelClear();
                }
            }, getWaveTimerPercent() { return 1; }
        }
    }
    if (level === Level.CampaignLevel2) {

        currentWave = 0;
        waveQueued = [false, false, false, false, false, false, false];
        waveTimer = 0;
        maxWaveTime = [0, 37, 24, 45, 0, 0, 0];

        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, selectedCharacter));



        return {
            update(dt: number) {
                if (currentWave === 0 && !waveQueued[0] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(-100, 75, EnemyType.TeleportingMiniboss, 1, true);
                    waveTimer = 0;
                    waveQueued[0] = true;
                    currentWave = 1;
                }
                else if (currentWave === 1 && !waveQueued[1] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 1, true);
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 3, false);
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 5, false);
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 7, false);

                    game.addEnemyToQueue(200, 100, EnemyType.Fast, 2, false);
                    game.addEnemyToQueue(250, 75, EnemyType.Fast, 3, false);
                    game.addEnemyToQueue(200, 100, EnemyType.Fast, 4, true);

                    game.addEnemyToQueue(-25, 150, EnemyType.Tanky, 4, true);
                    game.addEnemyToQueue(-25, 175, EnemyType.Tanky, 5, false);
                    waveTimer = 0;
                    waveQueued[1] = true;
                    currentWave = 2;
                }
                else if (currentWave === 2 && !waveQueued[2] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(150, 125, EnemyType.Fast, 1, true);
                    game.addEnemyToQueue(200, 100, EnemyType.Fast, 2, false);
                    game.addEnemyToQueue(250, 75, EnemyType.Fast, 3, false);
                    game.addEnemyToQueue(200, 100, EnemyType.Fast, 4, true);

                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 5, false);
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 7, false);

                    game.addEnemyToQueue(-25, 150, EnemyType.Tanky, 4, true);
                    waveTimer = 0;
                    waveQueued[2] = true;
                    currentWave = 3;
                }
                else if (currentWave === 3 && !waveQueued[3] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(150, 125, EnemyType.Fast, 1, false);
                    game.addEnemyToQueue(200, 100, EnemyType.Fast, 2, true);

                    game.addEnemyToQueue(-20, 125, EnemyType.Tanky, 1, false);
                    game.addEnemyToQueue(-25, 100, EnemyType.Tanky, 2, false);
                    game.addEnemyToQueue(-25, 150, EnemyType.Tanky, 4, false);
                    game.addEnemyToQueue(-25, 175, EnemyType.Tanky, 5, false);

                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 5, false);
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 7, true);

                    waveTimer = 0;
                    waveQueued[3] = true;
                    currentWave = 4;
                }
                else if (currentWave === 4 && !waveQueued[4] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {

                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 1, false);
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 3, false);
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 5, true);
                    game.addEnemyToQueue(0, 75, EnemyType.Basic, 7, false);
                    game.addEnemyToQueue(0, 50, EnemyType.Basic, 25, false);
                    game.addEnemyToQueue(0, 50, EnemyType.Basic, 27, false);

                    game.addEnemyToQueue(200, 125, EnemyType.SentryMiniboss, 10, true);

                    game.addEnemyToQueue(150, 125, EnemyType.Fast, 1, false);
                    game.addEnemyToQueue(200, 100, EnemyType.Fast, 2, false);
                    game.addEnemyToQueue(250, 75, EnemyType.Fast, 3, true);
                    game.addEnemyToQueue(200, 100, EnemyType.Fast, 4, false);
                    game.addEnemyToQueue(175, 100, EnemyType.Fast, 15, false);
                    game.addEnemyToQueue(225, 100, EnemyType.Fast, 20, false);

                    game.addEnemyToQueue(-50, 200, EnemyType.Tanky, 3, false);
                    game.addEnemyToQueue(-50, 200, EnemyType.Tanky, 5, false);
                    game.addEnemyToQueue(-50, 200, EnemyType.Tanky, 7, true);
                    game.addEnemyToQueue(-50, 200, EnemyType.Tanky, 9, false);
                    game.addEnemyToQueue(-50, 200, EnemyType.Tanky, 11, false);



                    waveTimer = 0;
                    waveQueued[4] = true;
                    currentWave = 5;
                }
                else if (currentWave === 5 && !waveQueued[5] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(100, 75, EnemyType.SentryMiniboss, 3, true);
                    game.addEnemyToQueue(300, 75, EnemyType.SentryMiniboss, 3, false);
                    game.addEnemyToQueue(-50, 200, EnemyType.TeleportingMiniboss, 3, true);

                    waveTimer = 0;
                    waveQueued[5] = true;
                    currentWave = 6;
                }
                else if (currentWave === 6 && !waveQueued[6] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(-200, 100, EnemyType.TeleportingBoss, 3, false);

                    waveTimer = 0;
                    waveQueued[6] = true;
                    currentWave = 7;
                }
                else if (currentWave === 7 && hasAllEnemiesDefeated()) {
                    game.levelClear();
                }
            }, getWaveTimerPercent() {
                if (currentWave === 0 || maxWaveTime[currentWave - 1] === 0) return 1;
                return Math.min(waveTimer / maxWaveTime[currentWave - 1], 1);
            }
        }
    }
    if (level === Level.CampaignLevel3) {
        /*number of waves: 6

        wave 0: introduce chasers
        wave 1: introduce mini chasers
        wave 2: mix of chasers and mini chasers & introduce trapper chaser
        wave 3: spawn mini chasers on sides of screen + chasers at the top of the screen
        wave 4: introduce spawner miniboss that spawns chaser types
        wave 5: all types of chasers spawn + spawner miniboss
        wave 6: boss wave

        */
        currentWave = 0;
        waveQueued = [false, false, false, false, false, false, false];
        waveTimer = 0;
        maxWaveTime = [10, 10, 10, 0, 0, 0, 0];

        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, selectedCharacter));



        return {
            update(dt: number) {
                waveTimer += dt;
                if (currentWave === 0 && !waveQueued[0] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(0, -10, EnemyType.Chaser, 5, false);
                    game.addEnemyToQueue(50, -10, EnemyType.Chaser, 4, false);
                    game.addEnemyToQueue(100, -10, EnemyType.Chaser, 3, false);
                    game.addEnemyToQueue(150, -10, EnemyType.Chaser, 2, false);
                    game.addEnemyToQueue(200, -10, EnemyType.Chaser, 1, true);
                    game.addEnemyToQueue(250, -10, EnemyType.Chaser, 2, false);
                    game.addEnemyToQueue(300, -10, EnemyType.Chaser, 3, false);
                    game.addEnemyToQueue(350, -10, EnemyType.Chaser, 4, false);
                    game.addEnemyToQueue(400, -10, EnemyType.Chaser, 5, false);

                    waveTimer = 0;
                    waveQueued[0] = true;
                    currentWave = 1;
                }
                else if (currentWave === 1 && !waveQueued[1] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(0, -10, EnemyType.MiniChaser, 3, false);
                    game.addEnemyToQueue(50, -10, EnemyType.MiniChaser, 2.5, false);
                    game.addEnemyToQueue(100, -10, EnemyType.MiniChaser, 2, false);
                    game.addEnemyToQueue(150, -10, EnemyType.MiniChaser, 1.5, false);
                    game.addEnemyToQueue(200, -10, EnemyType.MiniChaser, 1, true);
                    game.addEnemyToQueue(250, -10, EnemyType.MiniChaser, 1.5, false);
                    game.addEnemyToQueue(300, -10, EnemyType.MiniChaser, 2, false);
                    game.addEnemyToQueue(350, -10, EnemyType.MiniChaser, 2.5, false);
                    game.addEnemyToQueue(400, -10, EnemyType.MiniChaser, 3, false);
                    waveTimer = 0;
                    waveQueued[1] = true;
                    currentWave = 2;
                }
                else if (currentWave === 2 && !waveQueued[2] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(0, -10, EnemyType.Chaser, 1, false);
                    game.addEnemyToQueue(50, -10, EnemyType.Chaser, 5, false);
                    game.addEnemyToQueue(100, -10, EnemyType.Chaser, 1.5, false);
                    game.addEnemyToQueue(150, -10, EnemyType.Chaser, 1, false);
                    game.addEnemyToQueue(200, -10, EnemyType.Chaser, 4, true);
                    game.addEnemyToQueue(250, -10, EnemyType.Chaser, 2, false);
                    game.addEnemyToQueue(300, -10, EnemyType.Chaser, 2, false);
                    game.addEnemyToQueue(350, -10, EnemyType.Chaser, 6, false);
                    game.addEnemyToQueue(400, -10, EnemyType.Chaser, 1, false);

                    game.addEnemyToQueue(50, -10, EnemyType.MiniChaser, 1.5, false);
                    game.addEnemyToQueue(150, -10, EnemyType.MiniChaser, 1, false);
                    game.addEnemyToQueue(250, -10, EnemyType.MiniChaser, 1.5, false);
                    game.addEnemyToQueue(350, -10, EnemyType.MiniChaser, 2, false);
                    game.addEnemyToQueue(350, -10, EnemyType.MiniChaser, 5, false);
                    game.addEnemyToQueue(50, -10, EnemyType.MiniChaser, 3, false);
                    game.addEnemyToQueue(200, -10, EnemyType.MiniChaser, 1, false);
                    game.addEnemyToQueue(200, -10, EnemyType.MiniChaser, 5, false);

                    game.addEnemyToQueue(100, -10, EnemyType.TrapperChaser, 2, false);
                    game.addEnemyToQueue(300, -10, EnemyType.TrapperChaser, 2, false);



                    waveTimer = 0;
                    waveQueued[2] = true;
                    currentWave = 3;

                }
                else if (currentWave === 3 && !waveQueued[3] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(0, -10, EnemyType.Chaser, 5, false);
                    game.addEnemyToQueue(50, -10, EnemyType.Chaser, 4, false);
                    game.addEnemyToQueue(100, -10, EnemyType.Chaser, 3, false);
                    game.addEnemyToQueue(150, -10, EnemyType.Chaser, 2, false);
                    game.addEnemyToQueue(200, -10, EnemyType.Chaser, 1, false);
                    game.addEnemyToQueue(250, -10, EnemyType.Chaser, 2, false);
                    game.addEnemyToQueue(300, -10, EnemyType.Chaser, 3, false);
                    game.addEnemyToQueue(350, -10, EnemyType.Chaser, 4, false);
                    game.addEnemyToQueue(400, -10, EnemyType.Chaser, 5, false);

                    game.addEnemyToQueue(0, -10, EnemyType.Chaser, 15, false);
                    game.addEnemyToQueue(50, -10, EnemyType.Chaser, 14, false);
                    game.addEnemyToQueue(100, -10, EnemyType.Chaser, 13, false);
                    game.addEnemyToQueue(150, -10, EnemyType.Chaser, 12, false);
                    game.addEnemyToQueue(200, -10, EnemyType.Chaser, 11, false);
                    game.addEnemyToQueue(250, -10, EnemyType.Chaser, 12, false);
                    game.addEnemyToQueue(300, -10, EnemyType.Chaser, 13, false);
                    game.addEnemyToQueue(350, -10, EnemyType.Chaser, 14, false);
                    game.addEnemyToQueue(400, -10, EnemyType.Chaser, 15, false);

                    game.addEnemyToQueue(-10, 0, EnemyType.MiniChaser, 1, false);
                    game.addEnemyToQueue(-10, 100, EnemyType.MiniChaser, 1.5, false);
                    game.addEnemyToQueue(-10, 200, EnemyType.MiniChaser, 2, false);
                    game.addEnemyToQueue(-10, 300, EnemyType.MiniChaser, 2.5, false);
                    game.addEnemyToQueue(-10, 400, EnemyType.MiniChaser, 3, false);
                    game.addEnemyToQueue(-10, 500, EnemyType.MiniChaser, 3.5, false);
                    game.addEnemyToQueue(-10, 600, EnemyType.MiniChaser, 4, false);

                    game.addEnemyToQueue(410, 0, EnemyType.MiniChaser, 1, false);
                    game.addEnemyToQueue(410, 100, EnemyType.MiniChaser, 1.5, false);
                    game.addEnemyToQueue(410, 200, EnemyType.MiniChaser, 2, false);
                    game.addEnemyToQueue(410, 300, EnemyType.MiniChaser, 2.5, false);
                    game.addEnemyToQueue(410, 400, EnemyType.MiniChaser, 3, false);
                    game.addEnemyToQueue(410, 500, EnemyType.MiniChaser, 3.5, false);
                    game.addEnemyToQueue(410, 600, EnemyType.MiniChaser, 4, false);

                    waveTimer = 0;
                    waveQueued[3] = true;
                    currentWave = 4;
                }
                else if (currentWave === 4 && !waveQueued[4] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(200, 100, EnemyType.SpawnerMiniboss, 1, true);

                    waveQueued[4] = true;
                    currentWave = 5;
                    waveTimer = 0;
                }
                else if (currentWave === 5 && !waveQueued[5] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(100, 50, EnemyType.SpawnerMiniboss, 1, true);
                    game.addEnemyToQueue(200, 50, EnemyType.SpawnerMiniboss, 7, true);
                    game.addEnemyToQueue(300, 50, EnemyType.SpawnerMiniboss, 14, true);

                    game.addEnemyToQueue(0, -10, EnemyType.Chaser, 5, false);
                    game.addEnemyToQueue(50, -10, EnemyType.Chaser, 3, false);
                    game.addEnemyToQueue(100, -10, EnemyType.Chaser, 1, false);

                    game.addEnemyToQueue(150, -10, EnemyType.Chaser, 5, false);
                    game.addEnemyToQueue(200, -10, EnemyType.Chaser, 3, false);
                    game.addEnemyToQueue(250, -10, EnemyType.Chaser, 1, false);

                    game.addEnemyToQueue(300, -10, EnemyType.Chaser, 5, false);
                    game.addEnemyToQueue(350, -10, EnemyType.Chaser, 3, false);
                    game.addEnemyToQueue(400, -10, EnemyType.Chaser, 1, false);


                    game.addEnemyToQueue(0, -10, EnemyType.MiniChaser, 1, false);
                    game.addEnemyToQueue(50, -10, EnemyType.MiniChaser, 3, false);
                    game.addEnemyToQueue(100, -10, EnemyType.MiniChaser, 5, false);

                    game.addEnemyToQueue(150, -10, EnemyType.MiniChaser, 1, false);
                    game.addEnemyToQueue(200, -10, EnemyType.MiniChaser, 3, false);
                    game.addEnemyToQueue(250, -10, EnemyType.MiniChaser, 5, false);

                    game.addEnemyToQueue(300, -10, EnemyType.MiniChaser, 1, false);
                    game.addEnemyToQueue(350, -10, EnemyType.MiniChaser, 3, false);
                    game.addEnemyToQueue(400, -10, EnemyType.MiniChaser, 5, false);


                    game.addEnemyToQueue(0, -10, EnemyType.TrapperChaser, 7, false);
                    game.addEnemyToQueue(50, -10, EnemyType.TrapperChaser, 7, false);
                    game.addEnemyToQueue(100, -10, EnemyType.TrapperChaser, 7, false);

                    game.addEnemyToQueue(150, -10, EnemyType.TrapperChaser, 9, false);
                    game.addEnemyToQueue(200, -10, EnemyType.TrapperChaser, 9, false);
                    game.addEnemyToQueue(250, -10, EnemyType.TrapperChaser, 9, false);

                    game.addEnemyToQueue(300, -10, EnemyType.TrapperChaser, 11, false);
                    game.addEnemyToQueue(350, -10, EnemyType.TrapperChaser, 11, false);
                    game.addEnemyToQueue(400, -10, EnemyType.TrapperChaser, 11, false);

                    waveQueued[5] = true;
                    currentWave = 6;
                    waveTimer = 0;
                }
                else if (currentWave === 6 && !waveQueued[6] && (hasAllEnemiesDefeated() || waveTimeExceeded())) {
                    game.addEnemyToQueue(200, 100, EnemyType.SpawnerBoss, 3, false);

                    waveQueued[6] = true;
                    currentWave = 7;
                    waveTimer = 0;
                }
                else if (currentWave === 7 && hasAllEnemiesDefeated()) {
                    game.levelClear();
                }
            }, getWaveTimerPercent() {
                if (maxWaveTime[currentWave] === 0) return 1;
                return Math.min(waveTimer / maxWaveTime[currentWave], 1);
            }
        }

    }
    if (level === Level.BossLevel3) {
        playerStats.maxHp = 4; // 3 stages with some rng elements so give player extra hp to compensate
        playerStats.startHp = 4;
        game.addPlayer(new Player(game, playerStats.startX, playerStats.startY, selectedCharacter, playerStats.maxHp, playerStats.startHp));
        game.addEnemyToQueue(200, 100, EnemyType.SpawnerBoss, 1.5, false);

        return {
            update(dt: number) {
                if (hasAllEnemiesDefeated()) {
                    game.levelClear();
                }
            }, getWaveTimerPercent() { return 1; }
        }
    }

    return { update() { }, getWaveTimerPercent() { return 0; } };
}
