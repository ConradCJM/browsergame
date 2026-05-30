import { Screen } from '@/app/game/screens/screenInterface';
import { Input } from '@/app/game/systems/input';
import { Game } from '@/app/game/game';
import { Player } from '@/app/game/entities/player';
import { PlayerCharacter } from '@/app/game/constants';
import { Button } from '@/app/game/ui/button';

export class CharacterSelectScreen implements Screen {
    private game: Game;
    private onCharacterSelect?: () => void;
    private onMainMenu?: () => void;

    private currentCharacterIndex: number = 0;
    private characters: PlayerCharacter[] = [PlayerCharacter.Archer, PlayerCharacter.Sentinel, PlayerCharacter.Mage];

    //character stats (hard-coded)
    private characterStats: {
        [key in PlayerCharacter]: {
            name: string;
            description: string;
            focusedDps: number;
            unfocusedDps: number;
            baseSpeed: number;
            focusedSpeed: number;
            maxHp: number;
            startingHp: number;
            abilities: string;
        }
    } = {
            [PlayerCharacter.Archer]: {
                name: 'Archer',
                description: 'An all rounded character with moderate speed and firepower.',
                focusedDps: 25,
                unfocusedDps: 25,
                baseSpeed: 160,
                focusedSpeed: 75,
                maxHp: 5,
                startingHp: 2,
                abilities: 'Last Stand: Increase focus dps when on 1 hp'
            },
            [PlayerCharacter.Sentinel]: {
                name: 'Sentinel',
                description: 'A tanky character with high HP but slower movement and attack speed. Strong focus shot',
                focusedDps: 28,
                unfocusedDps: 12,
                baseSpeed: 100,
                focusedSpeed: 45,
                maxHp: 6,
                startingHp: 3,
                abilities: 'Living Fortress: Attack speed increases as HP increases'
            },
            [PlayerCharacter.Mage]: {
                name: 'Mage',
                description: 'A fast character with a rapid firerate but low HP.',
                focusedDps: 40,
                unfocusedDps: 7,
                baseSpeed: 275,
                focusedSpeed: 125,
                maxHp: 3,
                startingHp: 1,
                abilities: 'Focus Warp: Unfocus to telport a short distance (1s CD)\nMagic Shots: bullets follow horizontal movement\nPower Reserve: Focus shot weakens with Hp\n     Unfocused shot strengthens with Hp'
            }
        };

    constructor(game: Game, onCharacterSelect?: () => void, onMainMenu?: () => void) {
        this.game = game;
        this.onCharacterSelect = onCharacterSelect;
        this.onMainMenu = onMainMenu;
    }

    private prevCharacter() {
        this.currentCharacterIndex = (this.currentCharacterIndex - 1 + this.characters.length) % this.characters.length;
    }

    private nextCharacter() {
        this.currentCharacterIndex = (this.currentCharacterIndex + 1) % this.characters.length;
    }

    private confirmSelection() {
        const selectedCharacter = this.characters[this.currentCharacterIndex];
        this.game.setSelectedCharacter(selectedCharacter);
        this.onCharacterSelect?.();
    }

    update(dt: number): void {
        //
    }

    handleInput(input: Input): void {
        //M key to return to main menu
        if (input.keys['m']) {
            input.keys['m'] = false;
            this.onMainMenu?.();
            return;
        }

        //arrow keys to cycle characters
        if (input.keys['arrowleft']) {
            input.keys['arrowleft'] = false;
            this.prevCharacter();
        }
        if (input.keys['arrowright']) {
            input.keys['arrowright'] = false;
            this.nextCharacter();
        }

        //enter key to confirm
        if (input.keys['enter']) {
            input.keys['enter'] = false;
            this.confirmSelection();
        }

        
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        //draw title
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px fantasy';
        ctx.textAlign = 'center';
        ctx.fillText('Select Character', ctx.canvas.width / 2, 29);

        //draw character name at top
        const currentCharacter = this.characters[this.currentCharacterIndex];
        const stats = this.characterStats[currentCharacter];

        ctx.fillStyle = '#ffffff';
        ctx.font = '28px fantasy';
        ctx.textAlign = 'center';
        ctx.fillText(stats.name, ctx.canvas.width / 2, 60);

        //draw stats panel
        const statsX = 35;
        const lineHeight = 20;
        let currentY = 90;

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px fantasy';
        ctx.textAlign = 'left';

        ctx.fillText('DESCRIPTION:', statsX, currentY);
        currentY += lineHeight;

        //word wrap description
        const descWords = stats.description.split(' ');
        let descLine = '';
        ctx.font = '12px fantasy';
        while (descWords.length > 0) {
            const word = descWords.shift()!;
            const testLine = descLine + word + ' ';
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > 280) {
                ctx.fillText(descLine, statsX, currentY);
                currentY += lineHeight - 2;
                descLine = word + ' ';
            } else {
                descLine = testLine;
            }
        }
        if (descLine) {
            ctx.fillText(descLine, statsX, currentY);
        }
        currentY += lineHeight + 5;

        ctx.font = '16px fantasy';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('STATS:', statsX, currentY);
        currentY += lineHeight;

        ctx.font = '14px fantasy';
        ctx.fillText(`Focused DPS: ${stats.focusedDps}`, statsX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Unfocused DPS: ${stats.unfocusedDps}`, statsX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Base Speed: ${stats.baseSpeed}`, statsX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Focused Speed: ${stats.focusedSpeed}`, statsX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Max HP: ${stats.maxHp}`, statsX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Starting HP: ${stats.startingHp}`, statsX, currentY);
        currentY += lineHeight + 5;

        ctx.font = '16px fantasy';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('ABILITIES:', statsX, currentY);
        currentY += lineHeight;

        ctx.font = '14px fantasy';
        // Split abilities by \n and render each line
        const abilityLines = stats.abilities.split('\n');
        abilityLines.forEach(line => {
            ctx.fillText(line, statsX, currentY);
            currentY += lineHeight;
        });




        // Draw key bindings
        ctx.fillStyle = '#ffffff';
        ctx.font = '26px fantasy';
        ctx.textAlign = 'center';
        ctx.fillText('Arrow Keys: Change Character', ctx.canvas.width / 2, 535);
        ctx.fillText('ENTER: Confirm | M: Main Menu', ctx.canvas.width / 2, 565);
    }
}