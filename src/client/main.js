// in the future the whole app flow will go here, but for now just a demo battle scene

// Import battle system classes
import { loadScene } from './sceneLoader.js';
import { BattleSequence } from '../gameplay/engine/BattleSequence.js';
import { Knight, Archer } from '../gameplay/definitions/characters/heroes.js';
import { BattleSceneController } from './scenes/battleSceneController.js';


async function initDemo() {
    
    const player = new Knight(true);

    const enemy = new Archer(false);

    // Create battle sequence
    const battleSequence = new BattleSequence(player, enemy);

    // Load the battle scene
    await loadScene('battleScene');
    // Initialize the battle scene controller with inventory
    const battleController = new BattleSceneController(battleSequence, player.items);
    // Set a global variable to access from elsewhere
    // in general we should try to stay away from global vars (like prof said it could have naming conflicts and is bad practice)
    window.battleController = battleController;

}

// debug -- reset if you press r
document.addEventListener('keydown', e => {
    if (e.key === 'r' || e.key === 'R') {
        // nuclear option
        localStorage.clear();
        sessionStorage.clear();

        initDemo().catch(console.error);
    }
});

async function init() {

    // Start the demo when page loads
    await initDemo().catch(console.error);
}

init();