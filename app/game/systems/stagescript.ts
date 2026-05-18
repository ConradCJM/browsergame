import { Game } from "../game";
import { EnemyType } from "@/app/game/constants";

export function createLevel(game: Game, level: number) {
    if (level === 1) {

        game.addEnemyToQueue(75, 50, EnemyType.Basic, 0);
        game.addEnemyToQueue(75, 50, EnemyType.Basic, 4);
        game.addEnemyToQueue(325, 100, EnemyType.Tanky, 6);

        game.addEnemyToQueue(75, 50, EnemyType.Basic, 8);


        game.addEnemyToQueue(200, 75, EnemyType.Fast, 12);
        game.addEnemyToQueue(200, 60, EnemyType.Fast, 14);

        game.addEnemyToQueue(325, 50, EnemyType.Tanky, 18);

        game.addEnemyToQueue(25, 50, EnemyType.Basic, 22);
        game.addEnemyToQueue(175, 50, EnemyType.Fast, 23);

        game.addEnemyToQueue(200, 50, EnemyType.Basic, 25);

        game.addEnemyToQueue(200, 90, EnemyType.Tanky, 30);
        game.addEnemyToQueue(200, 110, EnemyType.Tanky, 34);
        game.addEnemyToQueue(225, 40, EnemyType.Fast, 33);
        game.addEnemyToQueue(200, 130, EnemyType.Tanky, 38);


        game.addEnemyToQueue(200, 50, EnemyType.SentryBoss, 40);


    }
}

