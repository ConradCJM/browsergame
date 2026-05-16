import { EnemyType } from '@/app/game/constants';
import { Game } from '@/app/game/game';
import { aimedSpreadToDirection, aimedSpreadToPlayer } from '@/app/game/patterns';
export class enemy {
    private hp: number;
    private maxHp: number;
    private type: EnemyType = EnemyType.Basic;

    private x: number;
    private y: number;
    private enemyColor = '#ff0000';
    private speed = 20; //pixels per second

    private XRadius = 10;
    private YRadius = 10;

    private bulletSpeed = 50;
    private bulletXRadius = 3;
    private bulletYRadius = 3;
    private bulletColor = '#24b300a4';

    //reference to game for adding bullets
    private game: Game;

    private attackTimer = 0;
    private attackRate: number; //attacks every x seconds

    private phase = 0; //for more complex attack patterns
    private maxPhase: number; //0 for no phases, 1 means two phases (phase 0 and phase 1)
    private phaseTimer = 0;
    private maxPhaseTime: number; //time in seconds for each phase
    private phaseThresholds: number[]; //hp thresholds for changing phases (bosses only) (as percentage of max hp) 
    private phaseCoolDown = 0; //time in seconds before enemy can change phases again after hp threshold is reached

    private currentAimAngle = 1.5; //for patterns that require continuous aiming
    private aimRotationSpeed = 2; //radians per second
    private offsetPattern = [0, Math.PI / 60, -Math.PI / 60]; //for patterns that have a fixed offset from aiming direction (e.g. always aim slightly to the left or right of the player)
    private aimOffset = 0; //for patterns that aim at player but have a fixed offset (e.g. always aim slightly to the left or right of the player)


    constructor(startX: number, startY: number, type: EnemyType, game: Game) {
        this.x = startX;
        this.y = startY;
        this.type = type;
        this.game = game;

        //basic stats
        this.hp = 55;
        this.maxHp = 55;
        this.attackTimer = 0;
        this.attackRate = 0.5;

        this.bulletSpeed = 150;
        this.bulletXRadius = 3;
        this.bulletYRadius = 3;
        this.bulletColor = '#b30000a4';

        this.maxPhase = 3;
        this.maxPhaseTime = 10;
        this.phaseThresholds = [];

        //type-based stat modifications
        if (this.type === EnemyType.Fast) {
            this.hp = 30;
            this.maxHp = 30;
            this.attackRate = 0.15;

            this.bulletSpeed = 85;
            this.bulletXRadius = 2;
            this.bulletYRadius = 2.5;
            this.bulletColor = '#fbff00a4';

            this.maxPhase = 0;
            this.maxPhaseTime = 0;
            this.phaseThresholds = [];
        } else if (this.type === EnemyType.Tanky) {
            this.hp = 150;
            this.maxHp = 150;
            this.attackRate = 1.25;

            this.bulletSpeed = 35;
            this.bulletXRadius = 4;
            this.bulletYRadius = 4;
            this.bulletColor = '#240068a4';

            this.maxPhase = 0;
            this.maxPhaseTime = 0;
            this.phaseThresholds = [];
        } else if (this.type === EnemyType.Elite) {
            this.hp = 200;
            this.maxHp = 200;
            this.attackRate = 0.5;

            this.bulletSpeed = 65;
            this.bulletXRadius = 3.5;
            this.bulletYRadius = 3.5;
            this.bulletColor = '#0e7900a4';

            this.maxPhase = 1;
            this.phaseTimer = 0;
            this.maxPhaseTime = 10;
        }
    }
    //draw enemy
    draw(ctx: CanvasRenderingContext2D) {

        //circle
        if (this.type === EnemyType.Basic) {
            this.enemyColor = '#ff0000';
        } else if (this.type === EnemyType.Fast) {
            this.enemyColor = '#fbff00';
        } else if (this.type === EnemyType.Tanky) {
            this.enemyColor = '#240068';
        } else if (this.type === EnemyType.Elite) {
            this.enemyColor = '#0e7900';
        }

        if (this.type === EnemyType.Basic || this.type === EnemyType.Elite) {
            ctx.beginPath();
            ctx.fillStyle = this.enemyColor;
            ctx.arc(this.x, this.y, this.XRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    update(dt: number) {
        this.updatePosition(dt);
        this.updateAim(dt);
        this.updateAttack(dt);
        this.updatePhase(dt);
    }

    updatePosition(dt: number) {

        if (this.type === EnemyType.Basic) {
            this.speed = 50;
            this.y += Math.sin(performance.now() / 1000) * this.speed / 2 * dt;

            let targetX:number;

            if (this.phase === 0) {
                targetX = 325;
            }
            else if (this.phase === 2){
                targetX = 75;
            }
            else {
                targetX = 200;
            }


            
            this.moveTo(targetX, this.y, this.speed * dt);




        }


    }
    private moveTo(targetX: number, targetY: number, maxMovement: number) {
        const move = (current: number, target: number, maxDelta: number) => {
            const delta = target - current;
            if (Math.abs(delta) <= maxDelta) {
                return target;
            }
            return current + Math.sign(delta) * maxDelta;
        };

        this.x = move(this.x, targetX, maxMovement);
        this.y = move(this.y, targetY, maxMovement);
    }



    updateAim(dt: number) {

        //gradually rotate aim towards player
        const targetAngle = Math.atan2(this.game.getPlayer().getY() - this.y, this.game.getPlayer().getX() - this.x);
        const angleDiff = targetAngle - this.currentAimAngle;

        //shortest rotation path
        const shortestAngle = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.currentAimAngle += shortestAngle * this.aimRotationSpeed * dt;
    }

    updateAttack(dt: number) {
        this.attackTimer += dt;
        if (this.attackTimer >= this.attackRate) {
            this.attack();
            this.attackTimer = 0;
        }
    }

    updatePhase(dt: number) {
        //track phase timer
        this.phaseTimer += dt;
        if (this.phaseTimer >= this.maxPhaseTime) {
            if (this.phase < this.maxPhase) {
                this.phase++;
            }
            else {
                this.phase = 0;
            }
            this.phaseTimer = 0;
            this.attackTimer = this.phaseCoolDown; //reset attack timer on phase change to give player a moment to react to new pattern
        }
    }


    attack() {
        const attackCount = Math.floor(this.phaseTimer / this.attackRate);
        this.aimOffset = this.offsetPattern[attackCount % this.offsetPattern.length];

        const now = performance.now() / 1000;
        let specs: {
            dirX: number,
            dirY: number,
            delay: number,
            bulletSpeed?: number,
            bulletXRadius?: number,
            bulletYRadius?: number,
            bulletColor?: String
        }[] = [];
        if (this.type === EnemyType.Basic) {

            if (this.phase === 0 || this.phase === 2) {
                this.phaseCoolDown = 0.5;
                this.attackRate = 0.75;
                this.maxPhaseTime = 7.5;
                const bulletCount = 5;
                const burstCount = 5;
                const burstInterval = 0.075;

                const dirX = Math.cos(this.currentAimAngle);
                const dirY = Math.sin(this.currentAimAngle);
                specs = aimedSpreadToDirection(dirX, dirY, burstCount, burstInterval, bulletCount, Math.PI / 30, 0);
                specs.forEach(spec => {
                    spec.bulletSpeed = 300;
                    spec.bulletXRadius = 5;
                    spec.bulletYRadius = 10;
                    spec.bulletColor = '#b30000a4';
                })
            }
            else {
                this.offsetPattern = [0, Math.PI / 60, Math.PI / 90, Math.PI / 180, -Math.PI / 180, -Math.PI / 60, -Math.PI / 90];
                this.phaseCoolDown = 0.75;
                this.attackRate = 0.15;
                this.maxPhaseTime = 10;
                const burstCount = 5;
                const burstInterval = 0.065;
                const bulletCount = 3;

                specs = aimedSpreadToPlayer(this.x, this.y, this.game.getPlayer(), burstCount, burstInterval, bulletCount, Math.PI / 12, this.aimOffset);

                specs.forEach(spec => {
                    spec.bulletSpeed = 150;
                    spec.bulletXRadius = 3;
                    spec.bulletYRadius = 10;
                    spec.bulletColor = '#b30000a4';
                })
            }
        }
        else if (this.type === EnemyType.Fast) {

        }
        specs.forEach(spec => {
            this.game.queueEnemyBullet({
                spawnTime: now + spec.delay,
                x: this.x,
                y: this.y,
                dirX: spec.dirX,
                dirY: spec.dirY,
                bulletSpeed: spec.bulletSpeed ?? this.bulletSpeed,
                bulletXRadius: spec.bulletXRadius ?? this.bulletXRadius,
                bulletYRadius: spec.bulletYRadius ?? this.bulletYRadius,
                bulletColor: spec.bulletColor ?? this.bulletColor
            });
        });
    }
}