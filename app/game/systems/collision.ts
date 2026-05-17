import {enemy} from "@/app/game/entities/enemy";
import {playerBullet} from "@/app/game/entities/playerBullet";
import {enemyBullet} from "@/app/game/entities/enemyBullets";
import { Player } from "../entities/player";

export function checkCollisions(
    player: Player,
    enemies: enemy[],
    playerBullets: playerBullet[],
    enemyBullets: enemyBullet[]
) {
    // Helper function for circle-to-ellipse collision
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
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circleRadius + Math.max(ellipseRadiusX, ellipseRadiusY);
    };

    //player bullets on enemies
    playerBullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy) => {
            if (isColliding(bullet.x, bullet.y, bullet.Xradius, enemy.getX(), enemy.getY(), enemy.getXRadius(), enemy.getYRadius())) {
                enemy.takeDamage(1);
                playerBullets.splice(bIndex, 1); // Remove bullet
            }
        });
    });

    //enemy bullets on player
    enemyBullets.forEach((bullet, bIndex) => {
        const hitBoxBuffer = 0.3; //reduce enemy bullet hitbox for more forgiving collisions
        if (isColliding(player.getX(), player.getY(), player.getHitboxRadius(), bullet.getX(), bullet.getY(), bullet.getXRadius()-hitBoxBuffer, bullet.getYRadius()-hitBoxBuffer)) {
            player.takeDamage(1);
            enemyBullets.length = 0; // Remove all bullets on hit
            enemies.forEach((enemy)=>{
                enemy.subFromAttackTimer(3); //reset enemy attack timers to prevent instant follow-up shots
            });
        }
    });

    //collision
    enemies.forEach((enemy) => {
        if (isColliding(player.getX(), player.getY(), player.getHitboxRadius(), enemy.getX(), enemy.getY(), enemy.getXRadius(), enemy.getYRadius())) {
            player.takeDamage(1);

        }
    });
}