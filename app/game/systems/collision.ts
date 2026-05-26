import {enemy} from "@/app/game/entities/enemy";
import {playerBullet} from "@/app/game/entities/playerBullet";
import {enemyBullet} from "@/app/game/entities/enemyBullets";
import { Player } from "@/app/game/entities/player";
import { Shockwave } from "@/app/game/entities/shockwave";
import { healItem } from "@/app/game/entities/healItem";

export function checkCollisions(
    player: Player,
    enemies: enemy[],
    playerBullets: playerBullet[],
    enemyBullets: enemyBullet[],
    shockwaves: Shockwave[],
    healItems: healItem[]

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
                shockwaves.push(new Shockwave(bullet.getX(), bullet.getY(), 6, 0.3, '#41e9ff72'));
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
}