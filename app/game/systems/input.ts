export class Input {
    keys: Record<string, boolean> = {};
    lastShootTime = 0;
    shootCooldown = 0.2;

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
}
