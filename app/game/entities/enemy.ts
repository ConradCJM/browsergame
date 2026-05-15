import { EnemyType } from '@/app/game/constants';
import { enemyBullet } from '@/app/game/entities/enemyBullets';
import {Game} from '@/app/game/game';
im
export class enemy{
    hp: number;
    maxHp: number;
    type: EnemyType = EnemyType.Basic;

    x: number;
    y: number;
    enemyColor = '#ff0000';

    bulletSpeed = 50;
    bulletXRadius = 3;
    bulletYRadius = 3;
    bulletColor = '#24b300a4';

    //reference to game for adding bullets
    game: Game;

    attackTimer = 0;
    attackRate: number; //attacks every x seconds

    constructor(startX: number, startY: number, type: EnemyType, game: Game) {
        this.x = startX;
        this.y = startY;
        this.type = type;
        this.game = game;

        //basic stats
        this.hp = 55;
        this.maxHp = 55;
        this.attackTimer= 0;
        this.attackRate = 0.5;
        this.bulletSpeed = 50;
        this.bulletXRadius = 3;
        this.bulletYRadius = 3;
        this.bulletColor = '#b30000a4';

        //type-based stat modifications
        if (this.type === EnemyType.Fast) {
            this.hp = 30;
            this.maxHp = 30;
            this.attackRate = 0.15;

            this.bulletSpeed = 85;
            this.bulletXRadius = 2;
            this.bulletYRadius = 2.5;
            this.bulletColor = '#fbff00a4';
        } else if (this.type === EnemyType.Tanky) {
            this.hp = 150;
            this.maxHp = 150;
            this.attackRate = 1.25;

            this.bulletSpeed = 35;
            this.bulletXRadius = 4;
            this.bulletYRadius = 4;
            this.bulletColor = '#240068a4';
        } else if (this.type === EnemyType.Elite) {
            this.hp = 200;
            this.maxHp = 200;
            this.attackRate = 0.5;

            this.bulletSpeed = 65;
            this.bulletXRadius = 3.5;
            this.bulletYRadius = 3.5;
            this.bulletColor = '#0e7900a4';
        }  
    }
    //draw enemy
    draw(ctx: CanvasRenderingContext2D) {

        //circle
        if(this.type === EnemyType.Basic){
            this.enemyColor = '#ff0000';
        } else if(this.type === EnemyType.Fast){
            this.enemyColor = '#fbff00';
        } else if(this.type === EnemyType.Tanky){
            this.enemyColor = '#240068';
        } else if(this.type === EnemyType.Elite){
            this.enemyColor = '#0e7900';
        }
        ctx.beginPath();
        ctx.fillStyle = this.enemyColor;
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
    }

    update(dt: number) {
        this.attackTimer += dt;

        if (this.attackTimer >= this.attackRate) {
            this.attack();
            this.attackTimer = 0;
        }
    }

    attack(){
        this.game.addEnemyBullet(new enemyBullet(this.x, this.y, 0, 1, this.bulletSpeed, this.bulletXRadius, this.bulletYRadius, this.bulletColor));
    }
}