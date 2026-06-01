import {enemy} from "@/app/game/entities/enemy";
import {playerBullet} from "@/app/game/entities/playerBullet";
import {enemyBullet} from "@/app/game/entities/enemyBullets";
import { Player } from "@/app/game/entities/player";
import { Shockwave } from "@/app/game/entities/shockwave";
import { healItem } from "@/app/game/entities/healItem";
import { DamageZone } from "@/app/game/entities/damageZone";

export function checkCollisions(
    player: Player,
    enemies: enemy[],
    playerBullets: playerBullet[],
    enemyBullets: enemyBullet[],
    shockwaves: Shockwave[],
    healItems: healItem[],
    damageZones: DamageZone[] = []
) {
    //helper function for ellipse-to-ellipse collision (thanks co-pilot)
    const isCollidingEllipse = (
    ellipse1X: number,
    ellipse1Y: number,
    ellipse1RadiusX: number,
    ellipse1RadiusY: number,
    ellipse2X: number,
    ellipse2Y: number,
    ellipse2RadiusX: number,
    ellipse2RadiusY: number
): boolean => {
    const dx = ellipse2X - ellipse1X;
    const dy = ellipse2Y - ellipse1Y;
    
    //normalize the distance by the sum of radii
    const normalizedX = dx / (ellipse1RadiusX + ellipse2RadiusX);
    const normalizedY = dy / (ellipse1RadiusY + ellipse2RadiusY);
    
    //check if normalized distance is less than 1
    return normalizedX * normalizedX + normalizedY * normalizedY < 1;
};

    /**
     * Check if an ellipse collides with a square damage zone
     * Circle (ellipse approximated) vs axis-aligned rectangle collision
     */
    const isEllipseCollidingWithSquare = (
        ellipseX: number,
        ellipseY: number,
        ellipseRadiusX: number,
        ellipseRadiusY: number,
        squareCenterX: number,
        squareCenterY: number,
        squareWidth: number,
        squareHeight: number
    ): boolean => {
        // Square bounds
        const squareLeft = squareCenterX - squareWidth / 2;
        const squareRight = squareCenterX + squareWidth / 2;
        const squareTop = squareCenterY - squareHeight / 2;
        const squareBottom = squareCenterY + squareHeight / 2;

        // Find closest point on square to ellipse center
        const closestX = Math.max(squareLeft, Math.min(ellipseX, squareRight));
        const closestY = Math.max(squareTop, Math.min(ellipseY, squareBottom));

        // Distance from ellipse center to closest point
        const dx = ellipseX - closestX;
        const dy = ellipseY - closestY;

        // Normalize by ellipse radii
        const normalizedX = dx / ellipseRadiusX;
        const normalizedY = dy / ellipseRadiusY;

        return normalizedX * normalizedX + normalizedY * normalizedY < 1;
    };

    /**
     * Check if an ellipse collides with an ellipse damage zone
     */
    const isEllipseCollidingWithEllipse = (
        ellipse1X: number,
        ellipse1Y: number,
        ellipse1RadiusX: number,
        ellipse1RadiusY: number,
        ellipse2X: number,
        ellipse2Y: number,
        ellipse2RadiusX: number,
        ellipse2RadiusY: number
    ): boolean => {
        return isCollidingEllipse(ellipse1X, ellipse1Y, ellipse1RadiusX, ellipse1RadiusY, ellipse2X, ellipse2Y, ellipse2RadiusX, ellipse2RadiusY);
    };

    /**
     * Check if entity collides with damage zone based on zone shape
     */
    const isCollidingWithDamageZone = (
        entityX: number,
        entityY: number,
        entityRadiusX: number,
        entityRadiusY: number,
        zone: DamageZone
    ): boolean => {
        if (zone.getShape() === 'square') {
            return isEllipseCollidingWithSquare(
                entityX, entityY, entityRadiusX, entityRadiusY,
                zone.getX(), zone.getY(), zone.getWidth(), zone.getHeight()
            );
        } else {
            return isEllipseCollidingWithEllipse(
                entityX, entityY, entityRadiusX, entityRadiusY,
                zone.getX(), zone.getY(), zone.getXRadius(), zone.getYRadius()
            );
        }
    };

    //player touches heal item
    healItems.forEach((item, i) => {
        if (isCollidingEllipse(player.getX(), player.getY(), player.getHitboxRadius(), player.getHitboxRadius(), item.getX(), item.getY(), item.getXRadius()+15, item.getYRadius()+15)) {
            player.heal(item.getHealAmount());
            healItems.splice(i, 1);
        }
    });
    //player bullets on enemies
    const bulletsToRemove = new Set<playerBullet>();
    
    playerBullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
            if (isCollidingEllipse(bullet.getX(), bullet.getY(), bullet.getXRadius(), bullet.getYRadius(), enemy.getX(), enemy.getY(), enemy.getXRadius(), enemy.getYRadius())) {
                enemy.takeDamage(1);
                shockwaves.push(new Shockwave(bullet.getX(), bullet.getY(), 6, 0.3, bullet.getColour()));
                bulletsToRemove.add(bullet);
            }
        });
    });
    
    //remove marked bullets after iteration
    const updatedPlayerBullets = playerBullets.filter(b => !bulletsToRemove.has(b));
    playerBullets.splice(0, playerBullets.length, ...updatedPlayerBullets);

    //enemy bullets on player
    enemyBullets.forEach((bullet, bIndex) => {
        if(player.isInvincible() && player.getHp() > 0){
            enemyBullets.length = 0; //remove bullets that are spawning from bursts until player is no longer invincible
        }; 
        const hitBoxBuffer = 0.5; //reduce size of hitbox for more forgiving collisions
        if (isCollidingEllipse(player.getX(), player.getY(), player.getHitboxRadius()-hitBoxBuffer, player.getHitboxRadius()-hitBoxBuffer, bullet.getX(), bullet.getY(), bullet.getXRadius()-hitBoxBuffer, bullet.getYRadius()-hitBoxBuffer)) {
            player.takeDamage(1);
            if (player.getHp() <=0){ return }
            enemyBullets.length = 0; //remove all bullets on hit
        }
    });

    //collision
    enemies.forEach((enemy) => {
        if (isCollidingEllipse(player.getX(), player.getY(), player.getHitboxRadius(), player.getHitboxRadius(), enemy.getX(), enemy.getY(), enemy.getXRadius(), enemy.getYRadius())) {
            player.takeDamage(1);

        }
    });

    // Damage zones on player
    damageZones.forEach((zone) => {
        // Skip if zone is from enemy and player is invincible, or if zone is not active
        if (!zone.getIsActive()) return;
        if (zone.getOwnerType() === 'enemy' && player.isInvincible() && player.getHp() > 0) return;
        
        // Check collision with player
        if (!zone.hasAlreadyDamagedEntity(player) && isCollidingWithDamageZone(player.getX(), player.getY(), player.getHitboxRadius(), player.getHitboxRadius(), zone)) {
            if (zone.getOwnerType() === 'player') return; // Player zones don't hit the player
            player.takeDamage(zone.getDamage());
            zone.markEntityAsDamaged(player);
        }
    });

    // Damage zones on enemies
    damageZones.forEach((zone) => {
        if (!zone.getIsActive()) return;
        
        enemies.forEach((enemy) => {
            // Skip if zone is from this enemy, or if enemy is invincible
            if (zone.getOwnerType() === 'enemy' && enemy.getIsInvincible()) return;
            if (zone.getOwnerType() === 'enemy') return; // Enemy zones don't hit enemies
            
            // Check collision with enemy
            if (!zone.hasAlreadyDamagedEntity(enemy) && isCollidingWithDamageZone(enemy.getX(), enemy.getY(), enemy.getXRadius(), enemy.getYRadius(), zone)) {
                enemy.takeDamage(zone.getDamage());
                shockwaves.push(new Shockwave(enemy.getX(), enemy.getY(), 6, 0.3, zone.getColour()));
                zone.markEntityAsDamaged(enemy);
            }
        });
    });
}