import { lerp, shake, shouldRenderEffectsOnView } from './util.js'
import { Config } from './config.js';
import { isReplayerReversing } from './replayManager.js'
// helper function
const initGFXCanvas = (obj, refCanvas) => {
  obj.GFXCanvas = refCanvas.cloneNode(true);
  /*
  obj.GFXCanvas = document.createElement("canvas");
  obj.GFXCanvas.className = "layer mainLayer gfxLayer";
  obj.GFXCanvas.height = refCanvas.height;
  obj.GFXCanvas.width = refCanvas.width;
  obj.GFXCanvas.style = refCanvas.style;
  */
  obj.GFXCanvas.id = "";
  obj.GFXCanvas.className = "layer mainLayer gfxLayer";
  obj.GFXctx = obj.GFXCanvas.getContext("2d")
  obj.GFXctx.clearRect(0, 0, obj.GFXCanvas.width, obj.GFXCanvas.height);
  refCanvas.parentNode.appendChild(obj.GFXCanvas);
}

export const initFX = () => {
  'use strict';
  // where you actually inject things into the settings

  // -- injection below --
  if (window.Game) {
    const oldReadyGo = Game.prototype.readyGo
    Game.prototype.readyGo = function () {
      let val = oldReadyGo.apply(this, arguments)

      if (!this.GFXCanvas || !this.GFXCanvas.parentNode) {
        initGFXCanvas(this, this.canvas);
      }

      this.GFXQueue = [];

      this.GFXLoop = () => {
        if (!this.GFXQueue) this.GFXQueue = [];

        this.GFXctx.clearRect(0, 0, this.GFXCanvas.width, this.GFXCanvas.height);

        this.GFXQueue = this.GFXQueue.filter(e => e.process.call(e, this.GFXctx));

        if (this.GFXQueue.length)
          requestAnimationFrame(this.GFXLoop);
      }
      //  window.game = this;

      return val;
    }
  }

  if (window.SlotView) {
    const oldOnResized = SlotView.prototype.onResized;
    SlotView.prototype.onResized = function () {

      oldOnResized.apply(this, arguments);

      if (this.g && this.g.GFXCanvas && Replayer.prototype.isPrototypeOf(this.g)) {
        this.g.GFXCanvas.width = this.canvas.width;
        this.g.GFXCanvas.height = this.canvas.height;
        this.g.GFXCanvas.style.top = this.canvas.style.top;
        this.g.GFXCanvas.style.left = this.canvas.style.left;
        this.g.block_size = this.g.v.block_size;
      }


    }
  }

  // -- injection below --
  const oldInitReplay = Replayer.prototype.initReplay
  Replayer.prototype.initReplay = function () {
    let val = oldInitReplay.apply(this, arguments)

    // SlotViews have replayers attached to them, don't want to double up on the canvases
    //if (SlotView.prototype.isPrototypeOf(this.v))
    //    return;
    window.replayer = this;


    // always clear and re-init for slotviews
    if (window.SlotView && SlotView.prototype.isPrototypeOf(this.v)) {

      // do not do gfx if the board is too small
      if (!shouldRenderEffectsOnView(this.v)) {
        return val;
      }

      let foundGFXCanvases = this.v.slot.slotDiv.getElementsByClassName("gfxLayer");

      for (var e of foundGFXCanvases) {
        if (e.parentNode) {
          e.parentNode.removeChild(e);
        }
      }
      this.GFXCanvas = null;
    }

    if (!this.GFXCanvas || !this.GFXCanvas.parentNode || !this.GFXCanvas.parentNode == this.v.canvas.parentNode) {
      initGFXCanvas(this, this.v.canvas);
      console.log("replayer initializing gfx canvas");
    }

    this.GFXQueue = [];

    this.block_size = this.v.block_size;

    this.GFXLoop = () => {
      if (!this.GFXQueue) this.GFXQueue = [];

      this.GFXctx.clearRect(0, 0, this.GFXCanvas.width, this.GFXCanvas.height);

      this.GFXQueue = this.GFXQueue.filter(e => e.process.call(e, this.GFXctx));

      if (this.GFXQueue.length)
        requestAnimationFrame(this.GFXLoop);
    }

    this.v.canvas.parentNode.appendChild(this.GFXCanvas);

    return val;
  }

  const oldLineClears = GameCore.prototype.checkLineClears;
  GameCore.prototype.checkLineClears = function () {

    //console.log(this.GFXCanvas);

    if (!this.GFXCanvas || isReplayerReversing)
      return oldLineClears.apply(this, arguments);

    let oldAttack = this.gamedata.attack;

    let cleared = 0;
    for (var row = 0; row < 20; row++) {
      let blocks = 0;
      for (var col = 0; col < 10; col++) {
        let block = this.matrix[row][col];
        if (9 === block) { // solid garbage
          break;
        };
        if (0 !== block) {
          blocks++
        }
      };
      if (10 === blocks) { // if line is full
        cleared++; // add to cleared

        // send a line clear animation on this line
        if (Config().ENABLE_LINECLEAR_ANIMATION && Config().LINE_CLEAR_LENGTH > 0) {
          this.GFXQueue.push({
            opacity: 1,
            delta: 1 / (Config().LINE_CLEAR_LENGTH * 1000 / 60),
            row,
            blockSize: this.block_size,
            amountParted: 0,
            process: function (ctx) {
              if (this.opacity <= 0)
                return false;

              var x1 = 1;
              var x2 = this.blockSize * 5 + this.amountParted;
              var y = 1 + this.row * this.blockSize;

              // Create gradient
              var leftGradient = ctx.createLinearGradient(0, 0, this.blockSize * 5 - this.amountParted, 0);
              leftGradient.addColorStop(0, `rgba(255,255,255,${this.opacity})`);
              leftGradient.addColorStop(1, `rgba(255,170,0,0)`);
              // Fill with gradient
              ctx.fillStyle = leftGradient;

              ctx.fillRect(x1, y, this.blockSize * 5 - this.amountParted, this.blockSize);

              // Create gradient
              var rightGradient = ctx.createLinearGradient(0, 0, this.blockSize * 5 - this.amountParted, 0);
              rightGradient.addColorStop(0, `rgba(255,170,0,0)`);
              rightGradient.addColorStop(1, `rgba(255,255,255,${this.opacity})`);
              // Fill with gradient
              ctx.fillStyle = rightGradient;
              ctx.fillRect(x2, y, this.blockSize * 5 - this.amountParted, this.blockSize);

              this.amountParted = lerp(this.amountParted, this.blockSize * 5, 0.1);
              this.opacity -= this.delta;
              return true;
            }

          })
        }
      }
    }
    if (cleared > 0) { // if any line was cleared, send a shake
      let attack = this.gamedata.attack - oldAttack;
      if (Config().ENABLE_LINECLEAR_SHAKE)
        shake(
          this.GFXCanvas.parentNode.parentNode,
          Math.min(1 + attack * 5, 50) * Config().LINE_CLEAR_SHAKE_STRENGTH,
          Config().LINE_CLEAR_SHAKE_LENGTH * (1000 / 60)
        );
      if (this.GFXQueue.length)
        requestAnimationFrame(this.GFXLoop);
    }
    return oldLineClears.apply(this, arguments);

  }
  // have to do this so we can properly override ReplayerCore
  Replayer.prototype.checkLineClears = GameCore.prototype.checkLineClears;

  // placement animation
  const oldPlaceBlock = GameCore.prototype.placeBlock
  GameCore.prototype.placeBlock = function (col, row, time) {

    if (!this.GFXCanvas || !Config().ENABLE_PLACE_BLOCK_ANIMATION || isReplayerReversing)
      return oldPlaceBlock.apply(this, arguments);

    const block = this.blockSets[this.activeBlock.set]
      .blocks[this.activeBlock.id]
      .blocks[this.activeBlock.rot];

    let val = oldPlaceBlock.apply(this, arguments);

    // flashes the piece once you place it
    if (Config().PIECE_FLASH_LENGTH > 0) {
      this.GFXQueue.push({
        opacity: Config().PIECE_FLASH_OPACITY,
        delta: Config().PIECE_FLASH_OPACITY / (Config().PIECE_FLASH_LENGTH * 1000 / 60),
        col,
        row,
        blockSize: this.block_size,
        block,
        process: function (ctx) {
          if (this.opacity <= 0)
            return false;


          ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
          this.opacity -= this.delta;

          for (var i = 0; i < this.block.length; i++) {
            for (var j = 0; j < this.block[i].length; j++) {

              if (!this.block[i][j])
                continue;

              var x = 1 + (this.col + j) * this.blockSize
              var y = 1 + (this.row + i) * this.blockSize

              ctx.fillRect(x, y, this.blockSize, this.blockSize);
            }
          }
          return true;
        }
      })
    }

    var trailLeftBorder = 10;
    var trailRightBorder = 0;
    var trailBottom = 0;
    for (var i = 0; i < block.length; i++) {
      for (var j = 0; j < block[i].length; j++) {
        if (!block[i][j])
          continue;
        trailLeftBorder = Math.max(Math.min(trailLeftBorder, j), 0);
        trailRightBorder = Math.min(Math.max(trailRightBorder, j), 10);
        trailBottom = Math.max(trailBottom, i);
      }
    }

    // flashes the piece once you place it
    this.GFXQueue.push({
      opacity: 0.3,
      col,
      row,
      blockSize: this.block_size,
      trailTop: 1,
      block,
      trailLeftBorder,
      trailRightBorder,
      trailBottom,
      process: function (ctx) {
        if (this.opacity <= 0)
          return false;

        var {
          trailLeftBorder,
          trailRightBorder,
          trailBottom
        } = this;

        var row = this.row + trailBottom

        var gradient = ctx.createLinearGradient(0, 0, 0, row * this.blockSize - this.trailTop);
        gradient.addColorStop(0, `rgba(255,255,255,0)`);
        gradient.addColorStop(1, `rgba(255,255,255,${this.opacity})`);

        // Fill with gradient
        ctx.fillStyle = gradient;
        ctx.fillRect((this.col + trailLeftBorder) * this.blockSize, this.trailTop, (trailRightBorder - trailLeftBorder + 1) * this.blockSize, row * this.blockSize - this.trailTop);

        const middle = (trailLeftBorder + trailRightBorder) / 2

        this.trailLeftBorder = lerp(trailLeftBorder, middle, 0.1);
        this.trailRightBorder = lerp(trailRightBorder, middle, 0.1);

        this.opacity -= 0.0125;

        return true;
      }
    })



    requestAnimationFrame(this.GFXLoop);

  }
  // have to do this so we can properly override ReplayerCore
  Replayer.prototype.placeBlock = GameCore.prototype.placeBlock;
};
