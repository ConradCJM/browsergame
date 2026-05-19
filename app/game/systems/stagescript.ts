import { Game } from "../game";
import { EnemyType } from "@/app/game/constants";

interface LevelController {
    update(dt: number): void;
}

export function createLevel(game: Game, level: number): LevelController {
    let currentWave = 0;
    let waveQueued:boolean[] = [];
    let waveTimer = 0;
    let maxWaveTime:number[] = [];
    if (level === 1) {
        currentWave = 0;
        waveQueued = [false, false, false, false];
        waveTimer = 0;
        maxWaveTime = [20, 30, 40, 65]; // 0 = no time limit for that wave

        //queue wave 0 immediately
        game.addEnemyToQueue(75, 50, EnemyType.Basic, 0);
        game.addEnemyToQueue(75, 50, EnemyType.Basic, 4);
        game.addEnemyToQueue(-50, 100, EnemyType.Tanky, 6);
        game.addEnemyToQueue(75, 50, EnemyType.Basic, 8);
        waveQueued[0] = true;
        currentWave = 1;

        return {
            update(dt: number) {
                waveTimer += dt;

                //wave 1
                if (currentWave === 1 && 
                    !waveQueued[1] &&
                    ((game.getEnemies().length === 0 && game.getPendingEnemies().length === 0) ||
                    (maxWaveTime[0] > 0 && waveTimer > maxWaveTime[0]))) {
                    game.addEnemyToQueue(200, 75, EnemyType.Fast, 0);
                    game.addEnemyToQueue(200, 60, EnemyType.Fast, 2);
                    game.addEnemyToQueue(-50, 50, EnemyType.Tanky, 8);
                    waveQueued[1] = true;
                    currentWave = 2;
                    waveTimer = 0;
                }
                //wave 2
                else if (currentWave === 2 && 
                    !waveQueued[2] &&
                    ((game.getEnemies().length === 0 && game.getPendingEnemies().length === 0) ||
                    (maxWaveTime[1] > 0 && waveTimer > maxWaveTime[1]))) {
                    game.addEnemyToQueue(-50, 50, EnemyType.Tanky, 0);
                    game.addEnemyToQueue(25, 50, EnemyType.Basic, 2);
                    game.addEnemyToQueue(200, 50, EnemyType.Basic, 4);
                    game.addEnemyToQueue(175, 50, EnemyType.Fast, 10);
                    waveQueued[2] = true;
                    currentWave = 3;
                    waveTimer = 0;
                }
                //wave 3
                else if (currentWave === 3 && 
                    !waveQueued[3] &&
                    ((game.getEnemies().length === 0 && game.getPendingEnemies().length === 0) ||
                    (maxWaveTime[2] > 0 && waveTimer > maxWaveTime[2]))) {
                    game.addEnemyToQueue(-50, 90, EnemyType.Tanky, 0);
                    game.addEnemyToQueue(-50, 100, EnemyType.Tanky, 1);
                    game.addEnemyToQueue(225, 40, EnemyType.Fast, 3);
                    game.addEnemyToQueue(-50, 110, EnemyType.Tanky, 2);
                    game.addEnemyToQueue(175, 40, EnemyType.Fast, 3);
                    game.addEnemyToQueue(-50, 120, EnemyType.Tanky, 3);
                    game.addEnemyToQueue(-50, 130, EnemyType.Tanky, 4);
                    game.addEnemyToQueue(-50, 140, EnemyType.Tanky, 5);
                    waveQueued[3] = true;
                    currentWave = 4;
                    waveTimer = 0;
                }
                //boss wave (wave 4)
                else if (currentWave === 4 &&
                    ((game.getEnemies().length === 0 && game.getPendingEnemies().length === 0) ||
                    (maxWaveTime[3] > 0 && waveTimer > maxWaveTime[3]))) {
                    game.killAllEnemies(); //kill all enemies if player manages to survive until time limit
                    game.addEnemyToQueue(200, 50, EnemyType.SentryBoss, 0);
                    currentWave = 5;
                }
            }
        };
    }

    return { update() {} };
}