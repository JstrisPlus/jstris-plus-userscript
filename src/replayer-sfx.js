import { Config } from "./config";
import { loadCustomSFX } from "./sfxLoader";
import { shouldRenderEffectsOnView } from "./util";

export const initReplayerSFX = () => {
  if (typeof View == "function" && typeof window.Live != "function" && !location.href.includes("export"))
    initCustomReplaySFX();
  if (typeof SlotView == "function") initOpponentSFX();
};

export const initCustomReplaySFX = () => {
  console.log("init replayer sfx");
  var json = Config().CUSTOM_SFX_JSON;
  let sfx = null;
  if (json) {
    try {
      sfx = JSON.parse(json);
      document.getElementById("custom_sfx_json_err").textContent = "Loaded " + (sfx.name || "custom sounds");
    } catch (e) {
      console.log("SFX json was invalid.");
      document.getElementById("custom_sfx_json_err").textContent = "SFX json is invalid.";
    }
  } else {
    document.getElementById("custom_sfx_json_err").textContent = "";
  }

  if (!Config().ENABLE_CUSTOM_SFX || !Config().CUSTOM_SFX_JSON) {
    return;
  }

  let customSFXSet = loadCustomSFX(sfx);
  console.log(customSFXSet);
  const oldOnReady = View.prototype.onReady;
  View.prototype.onReady = function () {
    this.changeSFX(customSFXSet);
    return oldOnReady.apply(this, arguments);
  };

  // spectator replayer sfx

  View.prototype.onLinesCleared = function (attack, comboAttack, { type, b2b, cmb }) {
    let suhrit = [type, type, b2b && this.g.isBack2Back, cmb];
    var sounds = this.SFXset.getClearSFX(...suhrit);

    if (Array.isArray(sounds)) sounds.forEach((sound) => this.SEenabled && createjs.Sound.play(sound));
    else this.playReplayerSound(sounds);

    // --- old onLinesCleared code ---

    // don't need this line anymore
    // this.SEenabled && createjs.Sound.play(this.SFXset.getComboSFX(this.g.comboCounter));
    this.g.pmode &&
      (7 === this.g.pmode
        ? (this.lrem.textContent = this.g.gamedata.TSD)
        : 8 === this.g.pmode
        ? (this.lrem.textContent = this.g.gamedata.PCs)
        : 5 !== this.g.pmode && (this.lrem.textContent = this.g.linesRemaining));
  };
};
const initOpponentSFX = () => {
  // spectator replayer sfx

  console.log("init opponent sfx");
  SlotView.prototype.playReplayerSound = function (sound) {
    let volume = Config().OPPONENT_SFX_VOLUME_MULTPLIER || 0;

    if (!shouldRenderEffectsOnView(this)) {
      volume /= 4;
    }
    let enabled = !!localStorage.getItem("SE") && Config().ENABLE_OPPONENT_SFX;
    if (enabled) {
      if (Array.isArray(sound)) {
        sound.forEach((e) => {
          let instance = createjs.Sound.play(e);
          instance.volume = volume;
        });
      } else {
        var instance = createjs.Sound.play(sound);
        instance.volume = volume;
      }
    }
  };
  const onBlockHold = SlotView.prototype.onBlockHold;
  SlotView.prototype.onBlockHold = function () {
    this.playReplayerSound("hold");
    onBlockHold.apply(this, arguments);
  };

  const onBlockMove = SlotView.prototype.onBlockMove;
  SlotView.prototype.onBlockMove = function () {
    this.playReplayerSound("move");
    onBlockMove.apply(this, arguments);
  };
  const onGameOver = SlotView.prototype.onGameOver;
  SlotView.prototype.onGameOver = function () {
    if (this.g.queue.length !== 0)
      // ignore bugged top outs from static queues ending in map vs. change this when jez fixes that
      this.playReplayerSound("died");
    onGameOver.apply(this, arguments);
  };
  const onBlockLocked = SlotView.prototype.onBlockLocked;
  SlotView.prototype.onBlockLocked = function () {
    this.playReplayerSound("lock");
    onBlockLocked.apply(this, arguments);
  };
  const onLinesCleared = SlotView.prototype.onLinesCleared;
  SlotView.prototype.onLinesCleared = function (attack, comboAttack, { type, b2b, cmb }) {
    let game = this.slot.gs.p;
    let suhrit = [type, type, b2b && this.g.isBack2Back, cmb];
    var sounds = game.SFXset.getClearSFX(...suhrit);

    if (Array.isArray(sounds)) sounds.forEach((sound) => this.playReplayerSound(sound));
    else this.playReplayerSound(sounds);

    onLinesCleared.apply(this, arguments);
  };
  if (typeof Game == "function") {
    const oldReadyGo = Game.prototype.readyGo;

    // bot sfx
    Game.prototype.readyGo = function () {
      let val = oldReadyGo.apply(this, arguments);
      console.log("injected bot sfx");
      if (this.Bots && this.Bots.bots) {
        this.Bots.bots.forEach((e) => {
          if (e.g) {
            e.g.SFXset = this.SFXset;
            e.g.playSound = (a) => {
              if (a) {
                SlotView.prototype.playReplayerSound(a);
              }
            };
            let oldOnBotMove = e.__proto__.onBotMove;
            e.__proto__.onBotMove = function () {
              let val = oldOnBotMove.apply(this, arguments);
              SlotView.prototype.playReplayerSound("harddrop");
              return val;
            };
            let oldOnBotGameOver = e.__proto__.onGameOver;
            e.__proto__.onGameOver = function () {
              let val = oldOnBotGameOver.apply(this, arguments);
              // when you restart the game, all the bots get gameovered
              if (!e.p.p.gameEnded) SlotView.prototype.playReplayerSound("died");
              return val;
            };
          }
        });
      }

      return val;
    };
  }

  // replay replayer sfx
};
