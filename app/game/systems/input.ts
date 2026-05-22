export class Input {
    keys: Record<string, boolean> = {};
    lastShootTime = 0;
    shootCooldown = 0.2;
    
    // Add these for mouse tracking
    mouseX = 0;
    mouseY = 0;
    mouseClicked = false;

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Add mouse tracking
        window.addEventListener('mousemove', (e) => {
            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            }
        });
        
        window.addEventListener('click', () => {
            this.mouseClicked = true;
        });
    }
}
