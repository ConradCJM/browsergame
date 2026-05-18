import {enemy} from "@/app/game/entities/enemy";
import {playerBullet} from "@/app/game/entities/playerBullet";
import {enemyBullet} from "@/app/game/entities/enemyBullets";
import { Player } from "@/app/game/entities/player";
import { Shockwave } from "../entities/shockwave";

export function checkCollisions(
    player: Player,
    enemies: enemy[],
    playerBullets: playerBullet[],
    enemyBullets: enemyBullet[],
    shockwaves: Shockwave[]
) {
    // Helper function for circle-to-ellipse collision (thanks co pilot for the algorithm cause i couldnt figure this out after many attempts)
    const isColliding = (
    circleX: number,
    circleY: number,
    circleRadius: number,
    ellipseX: number,
    ellipseY: number,
    ellipseRadiusX: number,
    ellipseRadiusY: number
): boolean => {
    const dx = circleX - ellipseX;
    const dy = circleY - ellipseY;
    
    // Scale coordinates to ellipse space
    const scaledDx = dx / ellipseRadiusX;
    const scaledDy = dy / ellipseRadiusY;
    const scaledDistance = Math.sqrt(scaledDx * scaledDx + scaledDy * scaledDy);
    
    // Check collision in normalized space
    const radiusRatio = circleRadius / Math.max(ellipseRadiusX, ellipseRadiusY);
    return scaledDistance < 1 + radiusRatio;
};

    //player bullets on enemies
    playerBullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy) => {
            if (isColliding(bullet.getX(), bullet.getY(), bullet.getXRadius(), enemy.getX(), enemy.getY(), enemy.getXRadius(), enemy.getYRadius())) {
                enemy.takeDamage(1);
                shockwaves.push(new Shockwave(bullet.getX(), bullet.getY(),6, 0.3, '#41e9ff72'));
                playerBullets.splice(bIndex, 1);
            }
        });
    });

    //enemy bullets on player
    enemyBullets.forEach((bullet, bIndex) => {
        if(player.isInvincible()){
            enemyBullets.length = 0; //remove bullets that are spawning from bursts until player is no longer invincible
        }; //skip collision if player is in hit invulnerability period
        const hitBoxBuffer = 0.5; //reduce size of hitbox for more forgiving collisions
        if (isColliding(player.getX(), player.getY(), player.getHitboxRadius()-hitBoxBuffer, bullet.getX(), bullet.getY(), bullet.getXRadius()-hitBoxBuffer, bullet.getYRadius()-hitBoxBuffer)) {
            player.takeDamage(1);
            enemyBullets.length = 0; // Remove all bullets on hit
        }
    });

    //collision
    enemies.forEach((enemy) => {
        if (isColliding(player.getX(), player.getY(), player.getHitboxRadius(), enemy.getX(), enemy.getY(), enemy.getXRadius(), enemy.getYRadius())) {
            player.takeDamage(1);

        }
    });
}