/**
 * Represents a damage dealing area (zone) that can be either square or ellipse shaped.
 * Damage zones persist for a fixed duration and can hit multiple entities.
 * They track which entities they've already damaged to prevent duplicate hits per zone lifetime.
 */
import { Player } from "./player";
export class DamageZone {
    private x: number;
    private y: number;
    private width: number; // for squares, or width for bounding box
    private height: number; // for squares, or height for bounding box
    private xRadius: number; // for ellipses
    private yRadius: number; // for ellipses
    private duration: number; // total lifetime in seconds
    private elapsed: number = 0; // time elapsed in seconds
    private shape: 'square' | 'ellipse';
    private ownerType: 'player' | 'enemy'; // who created this zone
    private damage: number;
    private isActive: boolean = true;
    private damagedEntities: WeakSet<any> = new WeakSet(); // track which entities have been hit using WeakSet for memory safety
    private colour: string = 'rgba(255, 0, 0, 0.5)'; // default color for drawing;
    private followPlayer: boolean = false; // whether the zone should follow the player's position (for melee attacks)
    private xOffset: number = 0; // offset from player position 
    private yOffset: number = 0; // offset from player position 
    private player: Player; // reference to player for tracking

    constructor(
        startX: number,
        startY: number,
        xOffset: number,
        yOffset: number,
        width: number,
        height: number,
        duration: number,
        shape: 'square' | 'ellipse',
        ownerType: 'player' | 'enemy',
        damage: number = 1,
        colour: string,
        followPlayer: boolean = false,
        player?: any
    ) {
        this.x = startX;
        this.y = startY;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.width = width;
        this.height = height;
        this.xRadius = width / 2;
        this.yRadius = height / 2;
        this.duration = duration;
        this.shape = shape;
        this.ownerType = ownerType;
        this.damage = damage;
        this.colour = colour;
        this.followPlayer = followPlayer;
        this.player = player;
    }


    //factory method to create a square damage zone 
    static createSquare(
        x: number,
        y: number,
        xOffset: number,
        yOffset: number,
        width: number,
        height: number,
        duration: number,
        ownerType: 'player' | 'enemy',
        damage?: number,
        colour: string = 'rgba(255, 0, 0, 0.5)',
        followPlayer: boolean = false,
        player?: any
    ): DamageZone {
        return new DamageZone(x, y, xOffset, yOffset, width, height, duration, 'square', ownerType, damage, colour, followPlayer, player);
    }


    //factory method to create an ellipse damage zone
    static createEllipse(
        x: number,
        y: number,
        xOffset: number,
        yOffset: number,
        xRadius: number,
        yRadius: number,
        duration: number,
        ownerType: 'player' | 'enemy',
        damage?: number,
        colour: string = 'rgba(255, 0, 0, 0.5)',
        followPlayer: boolean = false,
        player?: any
    ): DamageZone {
        const zone = new DamageZone(x, y, xOffset, yOffset, xRadius * 2, yRadius * 2, duration, 'ellipse', ownerType, damage, colour, followPlayer, player);
        zone.xRadius = xRadius;
        zone.yRadius = yRadius;
        return zone;
    }


    //update the zone's elapsed time. Set isActive to false when duration expires.

    update(dt: number): void {
        this.elapsed += dt;
        if (this.elapsed >= this.duration) {
            this.isActive = false;
        }
        // Update position if tracking player
        if (this.followPlayer && this.player) {
            this.x = this.player.getX();
            this.y = this.player.getY();
        }
    }


    //check if an entity has already been damaged by this zone

    hasAlreadyDamagedEntity(entity: any): boolean {
        return this.damagedEntities.has(entity);
    }


    //mark an entity as damaged by this zone to prevent duplicate hits

    markEntityAsDamaged(entity: any): void {
        this.damagedEntities.add(entity);
    }

    isTrackingPlayer(): boolean {
        return this.followPlayer;
    }

    //getters
    getX(): number {
        return this.x + this.xOffset;
    }

    getXoffset(): number {
        return this.xOffset;
    }
    getYoffset(): number {
        return this.yOffset;
    }


    getY(): number {
        return this.y + this.yOffset;
    }

    getColour(): string {
        return this.colour;
    }
    setX(x: number): void {
        this.x = x;
    }

    setY(y: number): void {
        this.y = y;
    }

    getWidth(): number {
        return this.width;
    }

    getHeight(): number {
        return this.height;
    }

    getXRadius(): number {
        return this.xRadius;
    }

    getYRadius(): number {
        return this.yRadius;
    }

    getDuration(): number {
        return this.duration;
    }

    getElapsed(): number {
        return this.elapsed;
    }

    getShape(): 'square' | 'ellipse' {
        return this.shape;
    }

    getOwnerType(): 'player' | 'enemy' {
        return this.ownerType;
    }

    getDamage(): number {
        return this.damage;
    }

    getIsActive(): boolean {
        return this.isActive;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.getIsActive()) return;

        const colour = this.getColour();
        ctx.globalAlpha = 1;
        ctx.fillStyle = colour;
        ctx.strokeStyle = colour;
        ctx.lineWidth = 2;

        if (this.getShape() === 'square') {
            ctx.fillRect(
                this.getX() - this.getWidth() / 2,
                this.getY() - this.getHeight() / 2,
                this.getWidth(),
                this.getHeight()
            );
            ctx.strokeRect(
                this.getX() - this.getWidth() / 2,
                this.getY() - this.getHeight() / 2,
                this.getWidth(),
                this.getHeight()
            );
        } else {
            // Ellipse
            ctx.beginPath();
            ctx.ellipse(
                this.getX(),
                this.getY(),
                this.getXRadius(),
                this.getYRadius(),
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    drawWarning(ctx: CanvasRenderingContext2D): void {
        const colour = this.getColour();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = colour;
        ctx.strokeStyle = colour;
        ctx.lineWidth = 2;

        if (this.getShape() === 'square') {
            ctx.fillRect(
                this.getX() - this.getWidth() / 2,
                this.getY() - this.getHeight() / 2,
                this.getWidth(),
                this.getHeight()
            );
            ctx.strokeRect(
                this.getX() - this.getWidth() / 2,
                this.getY() - this.getHeight() / 2,
                this.getWidth(),
                this.getHeight()
            );
        } else {
            // Ellipse
            ctx.beginPath();
            ctx.ellipse(
                this.getX(),
                this.getY(),
                this.getXRadius(),
                this.getYRadius(),
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}
