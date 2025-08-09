import { Rendering, updateRendering } from "./rendering.js";
import { Gamestate, updateGamestate } from "./simulation.js";

function gameLoop() {
    updateGamestate();
    updateRendering();
}

export var GAMESTATE = new Gamestate();
export var RENDERING = new Rendering();

setInterval(gameLoop, GAMESTATE.tick_interval_ms);
GAMESTATE.start();
RENDERING.start();

(window as any).getGamestate = GAMESTATE;
