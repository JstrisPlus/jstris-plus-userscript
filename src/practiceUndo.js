import { Config } from "./config";
const clone = function (x) { return JSON.parse(JSON.stringify(x)); }
export class SaveState {
    /**
     * Creates a SaveState out of the given Game (all attributes are deep copies)
     */
    constructor(game) {
        // creates a deep copy. might be worth optimizing?

        this.matrix = clone(game.matrix);
        this.deadline = clone(game.deadline);
        this.activeBlock = clone(game.activeBlock);
        this.blockInHold = clone(game.blockInHold);
        if (game.invalidFromSnapshot) {
            this.queue = null

        } else {
            this.queue = clone(game.queue);
        }

        this.b2b = game.b2b;
        this.combo = game.combo;

        // save stat-related fields. might need to add a few more?
        this.placedBlocks = game.placedBlocks;
        this.totalFinesse = game.totalFinesse;
        this.totalKeyPresses = game.totalKeyPresses;
        this.incomingGarbage = clone(game.incomingGarbage);
        this.redBar = game.redBar;

        this.gamedata = {};
        for (const [key, value] of Object.entries(game.gamedata)) {
            this.gamedata[key] = value;
        }
    }
}
export const initPracticeUndo = () => {
    const MaxSaveStates = 100;
    /**
     * Creates a save state from the current game state and adds it to the stack.
     * If this pushes the stack above MaxSaveStates, delete the least recent save.
     * To be run before each hard drop.
     */
    Game.prototype.addSaveState = function () {
        if (this.pmode !== 2) return;

        this.saveStates.push(new SaveState(this));
        if (this.saveStates.length > MaxSaveStates) this.saveStates.shift();
    }

    /**
     * Rewinds to the last save state and removes it from the stack. If no states available, prints a message to the in-game chat.
     */
    Game.prototype.undoToSaveState = function () {
        if (this.pmode !== 2) return;
        if (this.saveStates.length === 0) {
            this.Live.showInChat("Jstris+", "Can't undo any further!")
            return;
        }
        if (this.fumenPages) {
            this.fumenPages.pop()
        }
        this.Replay.invalidFromUndo = true;
        let lastState = this.saveStates.pop();
        this.loadSaveState(lastState)
    }
    Game.prototype.loadSaveState = function (lastState) {
        this.matrix = lastState.matrix;
        this.deadline = lastState.deadline;
        this.isBack2Back = lastState.b2b;
        this.comboCounter = lastState.combo;

        if (!this.invalidFromSnapshot) {
            this.blockRNG = alea(this.Replay.config.seed)
            this.RNG = alea(this.Replay.config.seed)
            this.initRandomizer(this.conf[0].rnd)
            this.queue = []
            this.generateQueue();
            //  console.log(lastState.placedBlocks)
            for (let i = 0; i <= lastState.placedBlocks; i++) {
                this.activeBlock = this.getBlockFromQueue()
            }
            if (lastState.blockInHold != null) {
                this.blockInHold = lastState.blockInHold
                this.activeBlock = this.getBlockFromQueue()
            } else {
                this.blockInHold = null
            }
            //   console.log("foggy")
        } else {
            this.queue = lastState.queue
        }

        this.activeBlock = lastState.activeBlock;
        this.blockInHold = lastState.blockInHold;

        this.placedBlocks = lastState.placedBlocks;
        this.totalFinesse = lastState.totalFinesse;
        this.totalKeyPresses = lastState.totalKeyPresses;
        this.gamedata = lastState.gamedata;
        this.incomingGarbage = lastState.incomingGarbage;
        this.redBar = lastState.redBar;

        this.setCurrentPieceToDefaultPos();
        this.updateGhostPiece(true);
        this.redrawAll();

        // update all stats' text to the new values
        this.GameStats.get("RECV").set(this.gamedata.linesReceived);
        this.GameStats.get("SCORE").set(this.gamedata.score);
        this.GameStats.get("HOLD").set(this.gamedata.holds);
        this.GameStats.get("LINES").set(this.gamedata.lines);
        this.GameStats.get("ATTACK").set(this.gamedata.linesSent)
        this.GameStats.get("BLOCKS").set(this.placedBlocks);
        this.GameStats.get("KPP").set(this.getKPP());
        this.GameStats.get("WASTE").set(this.getWasted());
        this.GameStats.get("FINESSE").set(this.totalFinesse);
        this.updateTextBar(); // updates stats for clock, pps, apm, and vs, and renders the new stats
    }

    /**
     * initializes the save state stack. To be run before a practice mode is a started
     */
    Game.prototype.initSaveStates = function () {
        if (this.pmode !== 2) return;
        this.saveStates = [];
    }

    // add `addSaveStat` to hard drop
    const oldBeforeHardDrop = Game.prototype.beforeHardDrop;
    Game.prototype.beforeHardDrop = function () {
        if (this.pmode === 2) this.addSaveState();

        return oldBeforeHardDrop.apply(this, arguments);
    }

    // add `initSaveStates` to generatePracticeQueue
    let keyListenerInjected = false
    const oldGeneratePracticeQueue = Game.prototype.generatePracticeQueue;
    Game.prototype.generatePracticeQueue = function () {
        if (this.pmode === 2) {
            this.initSaveStates();
            if (!keyListenerInjected) {
                document.addEventListener("keyup", (evtobj) => {
                    if (0 == this.focusState) {
                        if (evtobj.keyCode == Config().UNDO_KEYCODE) {
                            this.undoToSaveState()
                        };
                    }

                }, false)
            }
            keyListenerInjected = true


        }


        return oldGeneratePracticeQueue.apply(this, arguments);
    }

    // neatly tell the user that replays don't work with undos
    const oldUploadError = Replay.prototype.uploadError;
    Replay.prototype.uploadError = function (LivePtr, err) {
        if (this.invalidFromUndo) {
            LivePtr.showInChat("Jstris+", "Can't generate replay for game with undos!");
            return;
        }
        if (this.invalidFromSnapshot) {
            LivePtr.showInChat("Jstris+", "Can't generate replay for game with fumen or snapshot import!");
        }
        return oldUploadError.apply(this, arguments);
    }
}