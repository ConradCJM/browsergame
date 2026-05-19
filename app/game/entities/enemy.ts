import { EnemyType } from '@/app/game/constants';
import { Game } from '@/app/game/game';
import { aimedSpreadToDirection, aimedSpreadToPlayer, spiralPattern, ringPattern } from '@/app/game/patterns';
import { BossHealthBar } from '@/app/game/entities/hpBar';
export class enemy {
    private hp: number;
    private maxHp: number;
    private type: EnemyType = EnemyType.Basic;
    private timeAlive: number = 0; //for patterns that change over time

    private isInvincible = false; //for enemies that have invincibility frames for some stages or if the enemy needs to be clicked (clicking feature is still being planned)

    private x: number;
    private y: number;
    private enemyColor = '#ff0000';
    private speed = 20; //pixels per second

    private centerX = 200;
    private centerY = 70;

    private XRadius = 10;
    private YRadius = 10;

    private bulletXSpeed = 50;
    private bulletYSpeed = 50;
    private bulletXRadius = 3;
    private bulletYRadius = 3;
    private bulletColor = '#24b300a4';
    private bulletXGrowth = 0;
    private bulletYGrowth = 0;

    //reference to game for adding bullets
    private game: Game;

    private attackTimer = 0;
    private attackRate: number; //attacks every x seconds

    private phase = 0; //for more complex attack patterns
    private maxPhase: number; //0 for no phases, 1 means two phases (phase 0 and phase 1)
    private phaseTimer = 0;
    private maxPhaseTime: number; //time in seconds for each phase
    private phaseCoolDown = 0; //time in seconds before enemy can change phases

    private bossPhase = 0; //for bosses with separate phases that change the entire attack pattern, not just modify it
    private maxBossPhase = 0;
    private bossHealthBar: BossHealthBar | null = null; //only used for bosses

    private currentAimAngle = Math.PI / 2; //for patterns that require continuous aiming
    private aimRotationSpeed = 2; //radians per second
    private offsetPattern = [0, Math.PI / 60, -Math.PI / 60]; //for patterns that have a fixed offset from aiming direction (e.g. always aim slightly to the left or right of the player)
    private aimOffset = 0; //for patterns that aim at player but have a fixed offset (e.g. always aim slightly to the left or right of the player)


    constructor(startX: number, startY: number, type: EnemyType, game: Game) {
        this.x = startX;
        this.y = startY;
        this.type = type;
        this.game = game;

        //basic stats
        this.hp = 30;
        this.maxHp = 30;
        this.attackTimer = 0;
        this.attackRate = 0.5;

        this.bulletXSpeed = 150;
        this.bulletYSpeed = 150;
        this.bulletXRadius = 3;
        this.bulletYRadius = 3;
        this.bulletColor = '#b30000a4';

        this.maxPhase = 3;
        this.maxPhaseTime = 10;

        //type-based stat modifications
        if (this.type === EnemyType.Fast) {
            this.centerX = this.x
            this.centerY = this.y;
            this.hp = 30;
            this.maxHp = 30;
            this.attackRate = 0.15;

            this.bulletXSpeed = 85;
            this.bulletYSpeed = 85;
            this.bulletXRadius = 2;
            this.bulletYRadius = 2.5;
            this.bulletColor = '#fbff00a4';

            this.maxPhase = 1;
            this.maxPhaseTime = 0.15;
            this.XRadius = 12;
            this.YRadius = 5;
        } else if (this.type === EnemyType.Tanky) {
            this.hp = 75;
            this.maxHp = 75;
            this.attackRate = 1.25;

            this.bulletXSpeed = 35;
            this.bulletYSpeed = 35;
            this.bulletXRadius = 4;
            this.bulletYRadius = 4;
            this.bulletColor = '#5900ffa4';

            this.maxPhase = 0;
            this.maxPhaseTime = 0;
        } else if (this.type === EnemyType.SentryBoss) {
            this.XRadius = 40;
            this.YRadius = 40;
            this.hp = 1000;
            this.maxHp = 1000;
            this.attackRate = 0.5;

            this.bulletXSpeed = 65;
            this.bulletYSpeed = 65;
            this.bulletXRadius = 3.5;
            this.bulletYRadius = 3.5;
            this.bulletColor = '#0e7900a4';

            this.maxPhase = 3;
            this.phaseTimer = 0;
            this.maxPhaseTime = 10;
            this.maxBossPhase = 1;
        }

        if (this.maxBossPhase > 0) {
            this.bossHealthBar = new BossHealthBar(50, 12, 300, 8, this.hp, this.maxHp);
        }
    }
    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;

        // Add this line to update the health bar
        if (this.bossHealthBar) {
            this.bossHealthBar.updateHp(this.hp);
        }
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getXRadius() {
        return this.XRadius;
    }
    getYRadius() {
        return this.YRadius;
    }

    getColor() {
        return this.enemyColor;
    }

    getHp() {
        return this.hp;
    }

    isDead(): boolean {
        return this.hp <= 0;
    }

    subFromAttackTimer(value: number) {
        this.attackTimer = - value;
    }

    update(dt: number) {
        this.timeAlive += dt;
        this.updatePosition(dt);
        this.updateAim(dt);
        this.updateAttack(dt);
        this.updatePhase(dt);
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
        if (this.maxPhaseTime === 0 || this.maxPhase === 0) return; //no phases, skip
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

    updatePosition(dt: number) {

        if (this.type === EnemyType.Basic) {
            this.speed = 50;
            this.y += Math.sin(this.timeAlive) * this.speed / 2 * dt;

            let targetX: number;

            if (this.phase === 0) {
                targetX = 325;
            }
            else if (this.phase === 2) {
                targetX = 75;
            }
            else {
                targetX = 200;
            }

            this.moveTo(targetX, this.y, this.speed * dt);

        }
        else if (this.type === EnemyType.Fast) {
            //infinity symbol movement
            const speed = 1.5; //radians per second
            const angle = this.timeAlive * speed;
            const amplitude = 150;
            const centerX = this.centerX;
            const centerY = this.centerY;

            // Lemniscate parametric equations (thanks co-pilot for the formula :D)
            const denominator = 1 + Math.sin(angle) ** 2;
            this.x = centerX + amplitude * Math.cos(angle) / denominator;
            this.y = centerY + amplitude * Math.sin(2 * angle) / (2 * denominator);
        }
        else if (this.type === EnemyType.Tanky) {
            const minX = 50;
            const maxX = 350;
            const centerX = (minX + maxX) / 2;
            const amplitude = (maxX - minX) / 2;
            this.speed = 20;
            const baseSpeed = 50; // reference speed

            this.x = centerX + Math.sin(this.timeAlive * (this.speed / baseSpeed)) * amplitude;
        }
        else if (this.type === EnemyType.SentryBoss) {
            this.speed = 10;
            this.y += Math.sin(this.timeAlive) * this.speed * dt;
            this.x = 200;
        }
    }

    //draw enemy
    draw(ctx: CanvasRenderingContext2D) {

        //color
        if (this.type === EnemyType.Basic) {
            this.enemyColor = '#ff0000';
        } else if (this.type === EnemyType.Fast) {
            this.enemyColor = '#fbff00';
        } else if (this.type === EnemyType.Tanky) {
            this.enemyColor = '#5900ff';
        } else if (this.type === EnemyType.SentryBoss) {
            this.enemyColor = '#0e7900';
        }

        if (this.bossHealthBar) {
            this.bossHealthBar.draw(ctx);
        }


        //shape
        if (this.type === EnemyType.Basic) {
            ctx.beginPath();
            ctx.fillStyle = this.enemyColor;
            ctx.arc(this.x, this.y, this.XRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (this.type === EnemyType.Tanky) {

            ctx.beginPath();
            ctx.fillStyle = this.enemyColor;
            ctx.fillRect(this.x - this.XRadius, this.y - this.YRadius, this.XRadius * 2, this.YRadius * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - this.XRadius, this.y - this.YRadius, this.XRadius * 2, this.YRadius * 2);

        }
        else if (this.type === EnemyType.Fast) {
            ctx.beginPath();
            ctx.fillStyle = this.enemyColor;
            ctx.ellipse(this.x, this.y, this.XRadius, this.YRadius, 0, 0, Math.PI * 2);
            ctx.fill();


        }
        else if (this.type === EnemyType.SentryBoss) {
            //hexagon
            ctx.beginPath();
            ctx.fillStyle = this.enemyColor;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = this.x + this.XRadius * Math.cos(angle);
                const y = this.y + this.XRadius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        }
        //add outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

    }


    attack() {
        const attackCount = Math.floor(this.phaseTimer / this.attackRate);
        this.aimOffset = this.offsetPattern[attackCount % this.offsetPattern.length];

        const now = performance.now() / 1000;
        let specs: {
            spawnX?: number,
            spawnY?: number,
            dirX: number,
            dirY: number,
            delay: number,
            bulletXSpeed?: number,
            bulletYSpeed?: number,
            bulletXRadius?: number,
            bulletYRadius?: number,
            bulletColor?: String,
            bulletXGrowth?: number,
            bulletYGrowth?: number
        }[] = [];
        if (this.type === EnemyType.Basic) {
            this.phaseCoolDown = 0;
            this.attackRate = this.phase % 2 === 1 ? 1 : 0.75;
            this.maxPhaseTime = 7.5;
            const bulletCount = this.phase % 2 === 1 ? 3 : 1;
            const burstCount = this.phase % 2 === 1 ? 3 : 1;
            const burstInterval = 0.075;

            const dirX = Math.cos(this.currentAimAngle);
            const dirY = Math.sin(this.currentAimAngle);
            specs = aimedSpreadToDirection(dirX, dirY, burstCount, burstInterval, bulletCount, Math.PI / 30, 0);
            specs.forEach(spec => {
                spec.bulletXSpeed = 225;
                spec.bulletYSpeed = 225;
                spec.bulletXRadius = 3;
                spec.bulletYRadius = 6;
                spec.bulletColor = '#b30000ff';
            })

        }
        else if (this.type === EnemyType.Fast) {

            this.aimOffset = 0;
            this.phaseCoolDown = 0;
            this.attackRate = Math.max(0.1, 1 - (this.timeAlive / 60)); //attack faster over time, up to a limit
            this.maxPhaseTime = Math.max(0.1, 1 - (this.timeAlive / 60));;
            const burstCount = 1;
            const burstInterval = 1;
            const bulletCount = Math.min(3, Math.ceil(this.timeAlive / 5));
            const spreadAngle = Math.PI / 40;
            const bulletInterval = 0.1;
            const clockwise = [true, false];

            specs = spiralPattern(burstCount, burstInterval, bulletCount, bulletInterval, spreadAngle, this.aimOffset, this.currentAimAngle, clockwise[this.phase % 2]);

            specs.forEach(spec => {
                spec.bulletXSpeed = 250;
                spec.bulletYSpeed = 250;
                spec.bulletXRadius = Math.max(1.25, 3 - (this.timeAlive / 24)); //start larger and shrink over time
                spec.bulletYRadius = 15;
                spec.bulletColor = '#fbff00ff';
            })


        }
        else if (this.type === EnemyType.Tanky) {
            this.offsetPattern = [0, Math.PI / 20];
            this.phaseCoolDown = 0;
            this.attackRate = 10;

            const burstCount = 2;
            const burstInterval = 0.5;
            const bulletInterval = 0.05;
            const bulletCount = 20;
            const spreadAngle = Math.PI / 10;

            specs = spiralPattern(burstCount, burstInterval, bulletCount, bulletInterval, spreadAngle, this.offsetPattern, this.currentAimAngle, true);

            specs.forEach(spec => {
                spec.bulletXSpeed = 50;
                spec.bulletYSpeed = 50;
                spec.bulletXRadius = 5;
                spec.bulletYRadius = 5;
                spec.bulletColor = '#5900ffb4';
                spec.bulletXGrowth = 0.135;
                spec.bulletYGrowth = 0.135;
            })
        }
        else if (this.type === EnemyType.SentryBoss) {
            if (this.phase === 0 || this.phase === 2) {
                this.offsetPattern = [0, Math.PI / 60, Math.PI / 90, Math.PI / 180, -Math.PI / 180, -Math.PI / 60, -Math.PI / 90];
                this.phaseCoolDown = 0.75;
                this.attackRate = Math.max(0.10, this.hp / this.maxHp / 1.5); //attack faster as hp drops
                this.maxPhaseTime = 6.75;
                const burstCount = 6;
                const burstInterval = 0.065;
                const bulletCount = this.hp >= this.maxHp / 2 ? 1 : 3;

                specs = aimedSpreadToPlayer(this.x, this.y, this.game.getPlayer(), burstCount, burstInterval, bulletCount, Math.PI / 12, this.aimOffset);

                specs.forEach(spec => {
                    spec.bulletXSpeed = 150;
                    spec.bulletYSpeed = 150;
                    spec.bulletXRadius = 3;
                    spec.bulletYRadius = 10;
                    spec.bulletColor = 'rgba(30, 255, 0, 0.4)';
                })
            }
            else if (this.phase === 1) {
                this.offsetPattern = [0, Math.PI / 20];
                this.phaseCoolDown = 0;
                this.attackRate = 0.1;
                this.maxPhaseTime = 0.1;
                const burstCount = 2 + Math.floor((1 - (this.hp / this.maxHp)) * 8); //more bursts as hp drops
                const burstInterval = 0.5;
                const spreadAngle = Math.PI / 10;

                specs = ringPattern(burstCount, burstInterval, spreadAngle, this.offsetPattern, this.currentAimAngle);
                specs.forEach(spec => {
                    spec.bulletXSpeed = 60;
                    spec.bulletYSpeed = 60;
                    spec.bulletXRadius = 20;
                    spec.bulletYRadius = 20;
                    spec.bulletColor = 'rgba(30, 255, 0, 0.46)';
                    spec.bulletXGrowth = 0.015;
                    spec.bulletYGrowth = 0.015;
                })
            }
            else if (this.phase === 3) {
                this.phaseCoolDown = 0;
                this.attackRate = 0.1;
                this.maxPhaseTime = 0.1;
                const burstCount = 1 + Math.floor((1 - (this.hp / this.maxHp)) * 10); //more bullet bursts as hp drops
                const burstInterval = 0.75;
                const bulletCount = 1 + Math.floor(this.timeAlive / 60); //more bullets per burst as time goes on
                

                //CUSTOM SHOT PATTERN Bullet Rain (if im gonna use this later again il make it a function in another file)
                for (let j = 0; j < burstCount; j++) {
                    for (let i = 0; i < bulletCount; i++) {

                        specs.push({
                            dirY: 1,
                            dirX: 0, 
                            delay: j * burstInterval

                        });
                    }
                }
                specs.forEach(spec => {
                    spec.spawnY = -2; //spawn above screen
                    spec.spawnX = Math.random() * 400; //spawn at random x position


                    spec.bulletXSpeed = 0;
                    spec.bulletYSpeed = 150;
                    spec.bulletXRadius = 50;
                    spec.bulletYRadius = 2;
                    spec.bulletColor = 'rgba(30, 255, 0, 1)';
                })
            }

        }
        specs.forEach(spec => {
            this.game.queueEnemyBullet({
                spawnTime: now + spec.delay,
                x: spec.spawnX ?? this.x,
                y: spec.spawnY ?? this.y,
                dirX: spec.dirX,
                dirY: spec.dirY,
                bulletXSpeed: spec.bulletXSpeed ?? this.bulletXSpeed,
                bulletYSpeed: spec.bulletYSpeed ?? this.bulletYSpeed,
                bulletXRadius: spec.bulletXRadius ?? this.bulletXRadius,
                bulletYRadius: spec.bulletYRadius ?? this.bulletYRadius,
                bulletColor: spec.bulletColor ?? this.bulletColor,
                bulletXGrowth: spec.bulletXGrowth ?? this.bulletXGrowth,
                bulletYGrowth: spec.bulletYGrowth ?? this.bulletYGrowth
            });
        });
    }
}