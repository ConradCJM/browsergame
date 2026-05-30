import { Shockwave } from './shockwave';
import { Game } from '../game';
import { drawPolygon, drawEllipse, drawHollowEllipse } from "@/app/game/utils/drawingUtils";
import { PlayerCharacter } from "@/app/game/constants";
export class Player {
    private hp = 3;
    private maxHp = 5;

    private hitIframesDuration = 2; //duration of invulnerability in seconds
    private isInHitIframes = false;
    private hitIframesTimer = 0;

    private x: number;
    private y: number;
    private Xspeed = 165; //pixels per second
    private Yspeed = 165; //pixels per second
    private focusSpeed = 75; //slow when focus

    private fireRate = 0.2; //time between shots in seconds

    private focusTeleport?: boolean;
    private focusTeleportDistance?: number = 100; //distance teleported when using focus teleport
    private focusTeleportCooldown?: number = 0; //cooldown time for focus teleport in seconds
    private focusTeleportTimer?: number = 0;

    private isFocused = false;
    private wasFocused = false;

    private hitboxRadius = 2; //visual size of hitbox actual hitbox radius used in collision detection is half of this value
    private hitboxColour = '#cef8ff';

    private modelWidth = 10;
    private modelHeight = 14;
    private colour = '#419aff';
    private focusTransparency = 0.2;

    private minHpProtection = false; //if true, hp cannot drop below 1

    private shockwaves: Shockwave[] = [];

    private game: Game;

    private characterType: PlayerCharacter;

    getHp() {
        return this.hp;
    }

    heal(amount: number) {
        this.hp += amount;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    getMaxHp() {
        return this.maxHp;
    }

    getHitIframesDuration() {
        return this.hitIframesDuration;
    }

    isInvincible() {
        return this.isInHitIframes;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getAttackCooldown() {
        return this.fireRate;
    }

    takeDamage(amount: number) {
        if (this.isInHitIframes) return; //ignore damage if in hit invulnerability frames
        this.isInHitIframes = true;
        this.hitIframesTimer = 0;
        this.hp -= amount;
        if (this.minHpProtection && this.hp < 1) this.hp = 1;
        else if (this.hp < 0) this.hp = 0;
        this.shockwaves.push(new Shockwave(this.x, this.y, 500, 0.35, this.colour));
    }

    setMinHpProtection(value: boolean) {
        this.minHpProtection = value;
    }

    getHitboxRadius() {
        return this.hitboxRadius / 2;
    }


    //conmstructor
    constructor(game: Game, startX: number, startY: number, playerCharacter: PlayerCharacter, maxHp?: number, hp?: number) {
        this.game = game;
        this.x = startX;
        this.y = startY;

        this.characterType = playerCharacter;

        //basic character
        if (this.characterType === PlayerCharacter.Archer) {
            this.focusTeleport = false;

            this.maxHp = 5;
            this.hp = 2;

            this.fireRate = 0.2;

            this.hitIframesDuration = 2;

            this.Xspeed = 165;
            this.Yspeed = 165;
            this.focusSpeed = 75;

            this.colour = '#67aeff';
        }
        else if (this.characterType === PlayerCharacter.Sentinel) {
            this.focusTeleport = false;

            this.maxHp = 6;
            this.hp = 3;

            this.fireRate = 0.25;

            this.hitIframesDuration = 2;

            this.Xspeed = 100;
            this.Yspeed = 100;
            this.focusSpeed = 45;

            this.colour = '#5200bd';
        }
        else if (this.characterType === PlayerCharacter.Mage) {
            this.focusTeleport = true;
            this.focusTeleportDistance = 100;
            this.focusTeleportCooldown = 1;

            this.maxHp = 3;
            this.hp = 1;

            this.fireRate = 0.025;

            this.hitIframesDuration = 2;

            this.Xspeed = 275;
            this.Yspeed = 275;
            this.focusSpeed = 125;

            this.colour = '#ff00ff';
        }

        //override for set hp values (boss levels and tutorial)
        this.maxHp = maxHp ?? this.maxHp;
        this.hp = hp ?? this.hp;
    }

    //movement updater
    update(dt: number, keys: Record<string, boolean>, canvasWidth: number, canvasHeight: number) {
        if (this.isInHitIframes) {
            this.hitIframesTimer += dt;
        }
        if (this.hitIframesTimer >= this.hitIframesDuration) {
            this.isInHitIframes = false;
            this.hitIframesTimer = 0;
        }
        const Xspeed = this.isFocused ? this.focusSpeed : this.Xspeed;
        const Yspeed = this.isFocused ? this.focusSpeed : this.Yspeed;
        if (keys['arrowup'] || keys['w']) this.y -= Yspeed * dt;
        if (keys['arrowdown'] || keys['s']) this.y += Yspeed * dt;
        if (keys['arrowleft'] || keys['a']) this.x -= Xspeed * dt;
        if (keys['arrowright'] || keys['d']) this.x += Xspeed * dt;
        this.isFocused = keys['shift'];
        //update focus teleport cooldown
        if (this.focusTeleportTimer! > 0) {
            this.focusTeleportTimer! -= dt;
        }

        //teleport when unfocusing (shift released) if enabled and cooldown is ready
        if (this.focusTeleport && this.wasFocused && !this.isFocused && this.focusTeleportTimer! <= 0) {
            //calculate teleport direction based on held keys
            let teleportDirX = 0;
            let teleportDirY = 0;

            if (keys['arrowup'] || keys['w']) teleportDirY = -1;
            if (keys['arrowdown'] || keys['s']) teleportDirY = 1;
            if (keys['arrowleft'] || keys['a']) teleportDirX = -1;
            if (keys['arrowright'] || keys['d']) teleportDirX = 1;

            //only teleport if a direction is held
            if (teleportDirX !== 0 || teleportDirY !== 0) {

                //normalize diagonal movement
                const magnitude = Math.sqrt(teleportDirX * teleportDirX + teleportDirY * teleportDirY);
                teleportDirX /= magnitude;
                teleportDirY /= magnitude;

                this.x += teleportDirX * this.focusTeleportDistance!;
                this.y += teleportDirY * this.focusTeleportDistance!;
                this.focusTeleportTimer = this.focusTeleportCooldown;
            }
        }

        this.wasFocused = this.isFocused;

        //keep player in map
        const barWidth = this.game.getTimerBarWidth();
        const playerHpBarHeight = this.game.getPlayerHpBarHeight();
        this.x = Math.max(barWidth + (this.hitboxRadius / 2), Math.min(this.x, canvasWidth - barWidth - (this.hitboxRadius / 2)));
        this.y = Math.max((this.hitboxRadius / 2), Math.min(this.y, canvasHeight - playerHpBarHeight - 3 - (this.hitboxRadius / 2)));

        //shockwave effect
        this.shockwaves = this.shockwaves.filter(sw => sw.update(dt));
    }

    //draw player
    draw(ctx: CanvasRenderingContext2D) {



        //focus transparency
        ctx.globalAlpha = this.isFocused ? this.focusTransparency : 1;

        if (this.hp === 1) {
            drawHollowEllipse(ctx, this.x, this.y, this.modelWidth, this.modelHeight, this.colour, 2);
        } else if (this.hp === 2) {
            drawEllipse(ctx, this.x, this.y, this.modelWidth, this.modelHeight, this.colour);
        } else {
            drawPolygon(ctx, this.x, this.y, this.modelHeight, this.hp, -Math.PI / 2, this.colour);
        }

        //circle hitbox
        if (this.isFocused)
            ctx.globalAlpha = 1;
        ctx.fillStyle = this.hitboxColour;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2);
        ctx.fill();

        //draw shockwave
        this.shockwaves.forEach(sw => sw.draw(ctx));
    }

    getBulletPattern(now: number) {

        if (this.isFocused) {
            switch (this.characterType) {
                case PlayerCharacter.Archer:
                    return this.getArcherFocusedBulletPattern(now); // 25 dps -> 1hp?: 29dps
                case PlayerCharacter.Sentinel:
                    return this.getSentinelFocusedBulletPattern(now); //min: 28dps -> max: 31 dps
                case PlayerCharacter.Mage:
                    return this.getMageFocusBulletPattern(now); //1hp 40 dps: -> 2hp: 33 dps -> 3hp: 23 dps
            }

        } else {
            switch (this.characterType) {
                case PlayerCharacter.Archer:
                    return this.getArcherSpreadBulletPattern(now); // 25 dps (assuming all bullets hit)
                case PlayerCharacter.Sentinel:
                    return this.getSentinelSpreadBulletPattern(now); // 12 dps (assuming all bullets hit)
                case PlayerCharacter.Mage:
                    return this.getMageSpreadBulletPattern(now); ////1hp 7 dps: -> 2hp: 15 dps -> 3hp: 22 dps
            }

        }
        return []; //empty 
    }

    //archer bullet patterns
    getArcherFocusedBulletPattern(now: number) {
        const bullets: { spawnTime: number; x: number; y: number; dirX?: number; dirY?: number, speed?: number, xRadius?: number, yRadius?: number, colour?: string }[] = [];
        const bulletColour = 'rgba(103, 174, 255, 0.50)';
        this.fireRate = this.hp === 1? 0.275: 0.2;
        //arrow type shape
        //head point
        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: 0, dirY: -1, speed: 600 });

        //head wings/points
        bullets.push({ spawnTime: now + 0.01, x: this.x + 5, y: this.y, dirX: 0, dirY: -1, speed: 600, xRadius: 3, yRadius: 7 });
        bullets.push({ spawnTime: now + 0.01, x: this.x - 5, y: this.y, dirX: 0, dirY: -1, speed: 600, xRadius: 3, yRadius: 7 });

        //last stand mechanic: more damage slightly slower firerate
        if (this.hp === 1) {
            
            // increase damage by 3 
            bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: 0, dirY: -1, speed: 600 });

            //head wings/points
            bullets.push({ spawnTime: now + 0.01, x: this.x + 5, y: this.y, dirX: 0, dirY: -1, speed: 600, xRadius: 3, yRadius: 7 });
            bullets.push({ spawnTime: now + 0.01, x: this.x - 5, y: this.y, dirX: 0, dirY: -1, speed: 600, xRadius: 3, yRadius: 7 });
        }

        //tail
        bullets.push({ spawnTime: now + 0.025, x: this.x, y: this.y, dirX: 0, dirY: -1, speed: 600, xRadius: 2.5, yRadius: 9 });
        bullets.push({ spawnTime: now + 0.045, x: this.x, y: this.y, dirX: 0, dirY: -1, speed: 600, xRadius: 2.5, yRadius: 9 });

        bullets.forEach(b => b.colour = bulletColour);

        return bullets;
    }
    getArcherSpreadBulletPattern(now: number) {
        this.fireRate = 0.2;
        const bullets: { spawnTime: number; x: number; y: number; dirX?: number; dirY?: number, speed?: number, xRadius?: number, yRadius?: number, colour?: string }[] = [];
        const bulletColour = 'rgba(103, 174, 255, 0.50)';

        //spread firing
        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: 0, dirY: -1 });

        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: Math.sin(Math.PI / 12), dirY: -Math.cos(Math.PI / 12) });
        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: -Math.sin(Math.PI / 12), dirY: -Math.cos(Math.PI / 12) });

        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: Math.sin(Math.PI / 6), dirY: -Math.cos(Math.PI / 6) });
        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: -Math.sin(Math.PI / 6), dirY: -Math.cos(Math.PI / 6) });

        bullets.forEach(b => b.colour = bulletColour);

        return bullets;
    }

    //sentinel bullet patterns
    getSentinelFocusedBulletPattern(now: number) {
        const bullets: { spawnTime: number; x: number; y: number; dirX?: number; dirY?: number, speed?: number, xRadius?: number, yRadius?: number, colour?: string }[] = [];
        const bulletColour = 'rgba(82, 0, 189, 0.50)';
        this.fireRate = 0.25 - (0.01 * (this.hp-1)); //overscaling wont be an issue since boss fights will probably not have more than the sentinel's max hp of 6

        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: 0, dirY: -1, speed: 700, xRadius: 3, yRadius: 3 });
        bullets.push({ spawnTime: now + 0.01, x: this.x + 2, y: this.y, dirX: 0, dirY: -1, speed: 700, xRadius: 3, yRadius: 3 });
        bullets.push({ spawnTime: now + 0.02, x: this.x - 2, y: this.y, dirX: 0, dirY: -1, speed: 700, xRadius: 3, yRadius: 3 });
        bullets.push({ spawnTime: now + 0.03, x: this.x + 3, y: this.y, dirX: 0, dirY: -1, speed: 700, xRadius: 3, yRadius: 3 });
        bullets.push({ spawnTime: now + 0.04, x: this.x - 3, y: this.y, dirX: 0, dirY: -1, speed: 700, xRadius: 3, yRadius: 3 });
        bullets.push({ spawnTime: now + 0.05, x: this.x + 4, y: this.y, dirX: 0, dirY: -1, speed: 700, xRadius: 3, yRadius: 3 });
        bullets.push({ spawnTime: now + 0.06, x: this.x - 4, y: this.y, dirX: 0, dirY: -1, speed: 700, xRadius: 3, yRadius: 3 });

        bullets.forEach(b => b.colour = bulletColour);

        return bullets;
    }
    //sentinel bullet patterns
    getSentinelSpreadBulletPattern(now: number) {
        const bullets: { spawnTime: number; x: number; y: number; dirX?: number; dirY?: number, speed?: number, xRadius?: number, yRadius?: number, colour?: string }[] = [];
        const bulletColour = 'rgba(82, 0, 189, 0.50)';
        this.fireRate = 0.25 - (0.01 * (this.hp-1)); //overscaling wont be an issue since boss fights will probably not have more than the sentinel's max hp of 6

        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: 0, dirY: -1, speed: 700, xRadius: 3, yRadius: 3 });
        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: Math.sin(Math.PI / 6), dirY: -Math.cos(Math.PI / 6), speed: 700, xRadius: 3, yRadius: 3 });
        bullets.push({ spawnTime: now, x: this.x, y: this.y, dirX: -Math.sin(Math.PI / 6), dirY: -Math.cos(Math.PI / 6), speed: 700, xRadius: 3, yRadius: 3 });

        bullets.forEach(b => b.colour = bulletColour);
        return bullets;
    }

    //mage bullet pattern
    getMageFocusBulletPattern(now: number) {
        if (this.hp === 1) {this.fireRate = 0.025;}
        if (this.hp === 2) {this.fireRate = 0.03;}
        if (this.hp === 3) {this.fireRate = 0.043;}

        this.game.spawnXFollowingPlayerBullet(this, this.x, this.y, 0, -1, 0, 1500, 5, 20, 'rgb(255, 0, 255, 0.5)');

        return [];
    }

    //mage bullet pattern
    getMageSpreadBulletPattern(now: number) {
        this.fireRate = 0.136;


        //dynamic bullet pattern based on hp, more hp means more bullets
        if (this.hp === 1 || this.hp >= 3) {
            this.game.spawnXFollowingPlayerBullet(this, this.x, this.y, 0, -1, 0, 1500, 2.5, 20, 'rgb(255, 0, 255, 0.5)');
        }

        if (this.hp === 2 || this.hp >= 3) {
            this.game.spawnXFollowingPlayerBullet(this, this.x, this.y, Math.sin(Math.PI / 25), -1, -10, 1500, 2.5, 20, 'rgb(255, 0, 255, 0.5)');
            this.game.spawnXFollowingPlayerBullet(this, this.x, this.y, -Math.sin(Math.PI / 25), -1, 10, 1500, 2.5, 20, 'rgb(255, 0, 255, 0.5)');
        }
        return [];
    }





}
