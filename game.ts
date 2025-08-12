import { Rendering, updateRendering } from "./rendering.js";
import { Gamestate, updateGamestate } from "./simulation.js";

function gameLoop() {
    updateGamestate();
    updateRendering();
}

export var GAMESTATE = new Gamestate();
export var RENDERING = new Rendering();

document.addEventListener("DOMContentLoaded", () => {
    GAMESTATE.start();
    RENDERING.start();

    setInterval(gameLoop, GAMESTATE.tick_interval_ms);
});

(window as any).getGamestate = GAMESTATE;
