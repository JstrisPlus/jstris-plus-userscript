import { Config } from "./config";
const clone = function (x) {
  return JSON.parse(JSON.stringify(x));
};
export class SaveState {
  /**
   * Creates a SaveState out of the given Game (all attributes are deep copies)
   */
  constructor(game) {
    this.matrix = clone(game.matrix);
    this.deadline = clone(game.deadline);
    this.activeBlock = clone(game.activeBlock);
    this.blockInHold = clone(game.blockInHold);

    this.b2b = game.b2b;
    this.combo = game.comboCounter;

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
  };

  /**
   * Rewinds to the last save state and removes it from the stack. If no states available, prints a message to the in-game chat.
   */
  Game.prototype.undoToSaveState = function () {
    if (this.pmode !== 2) return;
    if (this.saveStates.length === 0) {
      this.Live.showInChat("Jstris+", "Can't undo any further!");
      return;
    }
    if (this.fumenPages) {
      this.fumenPages.pop();
    }
    this.Replay.invalidFromUndo = true;
    let lastState = this.saveStates.pop();
    this.loadSaveState(lastState);
  };
  Game.prototype.loadSaveState = function (lastState) {
    this.matrix = lastState.matrix;
    this.deadline = lastState.deadline;
    this.isBack2Back = lastState.b2b;
    this.comboCounter = lastState.combo;

    this.loadSeedAndPieces(
      this.Replay.config.seed,
      this.conf[0].rnd,
      lastState.placedBlocks,
      lastState.activeBlock,
      lastState.blockInHold
    );

    this.placedBlocks = lastState.placedBlocks;
    this.totalFinesse = lastState.totalFinesse;
    this.totalKeyPresses = lastState.totalKeyPresses;
    this.gamedata = lastState.gamedata;
    this.incomingGarbage = lastState.incomingGarbage;
    this.redBar = lastState.redBar;

    this.holdUsedAlready = false;
    this.setCurrentPieceToDefaultPos();
    this.updateGhostPiece(true);
    this.redrawAll();

    // update all stats' text to the new values
    this.GameStats.get("RECV").set(this.gamedata.linesReceived);
    this.GameStats.get("SCORE").set(this.gamedata.score);
    this.GameStats.get("HOLD").set(this.gamedata.holds);
    this.GameStats.get("LINES").set(this.gamedata.lines);
    this.GameStats.get("ATTACK").set(this.gamedata.linesSent);
    this.GameStats.get("BLOCKS").set(this.placedBlocks);
    this.GameStats.get("KPP").set(this.getKPP());
    this.GameStats.get("WASTE").set(this.getWasted());
    this.GameStats.get("FINESSE").set(this.totalFinesse);
    this.updateTextBar(); // updates stats for clock, pps, apm, and vs, and renders the new stats
  };

  /**
   * Sets the seed, queue, active block, and held block based on the parameters
   * @param {int} seed
   * @param {int} rngType
   * @param {int} placedBlockCount
   * @param {Block} activeBlock
   * @param {Block} heldBlock
   */
  Game.prototype.loadSeedAndPieces = function (seed, rngType, placedBlockCount, activeBlock, heldBlock) {
    // recreate rng's state at game start (from seed stored in replay)
    this.Replay.config.seed = seed;
    this.blockRNG = alea(seed);
    this.RNG = alea(seed);
    this.initRandomizer(rngType);

    // to get the rng to the right state, roll for each previously generated block
    // +1 for current piece and +1 for hold, because those are saved separately
    let rollCount = placedBlockCount + 1;
    if (heldBlock != null) rollCount += 1;
    for (let i = 0; i < rollCount; i++) {
      this.getRandomizerBlock(); // result is ignored but rng is adjusted
    }

    // generate queue from new rng, and set active and held block from save state
    this.queue = [];
    this.generateQueue();
    this.activeBlock = activeBlock;
    this.blockInHold = heldBlock;
  };

  /**
   * initializes the save state stack. To be run before a practice mode is a started
   */
  Game.prototype.initSaveStates = function () {
    if (this.pmode !== 2) return;
    this.saveStates = [];
  };

  // call `addSaveState` before each hard drop
  const oldBeforeHardDrop = Game.prototype.beforeHardDrop;
  Game.prototype.beforeHardDrop = function () {
    if (this.pmode === 2) this.addSaveState();

    return oldBeforeHardDrop.apply(this, arguments);
  };

  // add `initSaveStates` to generatePracticeQueue
  let keyListenerInjected = false;
  const oldGeneratePracticeQueue = Game.prototype.generatePracticeQueue;
  Game.prototype.generatePracticeQueue = function () {
    if (this.pmode === 2) {
      this.initSaveStates();
      if (!keyListenerInjected) {
        document.addEventListener(
          "keydown",
          (keyEvent) => {
            if (this.focusState === 0) {
              if (keyEvent.code === Config().UNDO_KEY) {
                this.undoToSaveState();
              }
            }
          },
          false
        );
      }
      keyListenerInjected = true;
    }

    return oldGeneratePracticeQueue.apply(this, arguments);
  };

  // neatly tell the user that replays don't work with undos or fumen/snapshot imports
  const oldUploadError = Replay.prototype.uploadError;
  Replay.prototype.uploadError = function (LivePtr, err) {
    if (this.invalidFromSnapshot) {
      LivePtr.showInChat("Jstris+", "Can't generate replay for game with fumen or snapshot import!");
      return;
    }
    if (this.invalidFromUndo) {
      LivePtr.showInChat("Jstris+", "Can't generate replay for game with undos!");
      return;
    }
    return oldUploadError.apply(this, arguments);
  };
};
