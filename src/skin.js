import { Config } from "./config"
let offscreenCanvas = document.createElement('canvas');
let offscreenContext = offscreenCanvas.getContext("2d");
offscreenCanvas.height = 32;
offscreenCanvas.width = 32;
let customSkinSize = 32
let customGhostSkinSize = 32
let usingConnected = false
let usingGhostConnected = false
function loadCustomSkin(url, ghost = false) {

  // if not allowing force replay skin, don't load custom skin
  if (location.href.includes('replay') && !Config().ENABLE_REPLAY_SKIN) {
    return;
  }

  let img = new Image();
  console.log(url, ghost)
  img.onload = function () {
    var height = img.height;
    var width = img.width;
    if (width / height == 9 && !ghost) {
      customSkinSize = height
      usingConnected = false
      if (window.loadSkin) loadSkin(url, customSkinSize)
    } else if (width / height == 9 / 20 && !ghost) {
      usingConnected = true
      customSkinSize = width / 9
      if (window.loadSkin) loadSkin(url, customSkinSize)
    } else if (width / height == 7 && ghost) {
      usingGhostConnected = false
      customGhostSkinSize = height
      if (window.loadGhostSkin) loadGhostSkin(url, height)
    } else if (width / height == 7 / 20 && ghost) {
      offscreenCanvas.height = width / 7;
      offscreenCanvas.width = width / 7;
      usingGhostConnected = true
      customGhostSkinSize = width / 7
      if (window.loadSkin) loadGhostSkin(url, width / 7)
    }
  }
  img.src = url;

}
window.loadCustomSkin = loadCustomSkin

export const initCustomSkin = () => {
  initConnectedSkins()
  let skinLoaded = false
  let game = null
  if (Config().CUSTOM_SKIN_URL)
    loadCustomSkin(Config().CUSTOM_SKIN_URL);

  if (Config().CUSTOM_GHOST_SKIN_URL)
    loadCustomSkin(Config().CUSTOM_GHOST_SKIN_URL, true)
  if (typeof window.Live == "function") {
    Config().onChange("CUSTOM_SKIN_URL", val => {
      if (val)
        loadCustomSkin(val);
      else {
        loadSkin("resetRegular")
      }
    });
    Config().onChange("CUSTOM_GHOST_SKIN_URL", val => {
      if (val) loadCustomSkin(val, true)
      else if (game) {
        game.ghostSkinId = 0
        usingGhostConnected = false
      }
    });
    let onload = Live.prototype.onCIDassigned

    Live.prototype.onCIDassigned = function () {
      let v = onload.apply(this, arguments)

      if (!skinLoaded) {
        game = this.p
        skinLoaded = true
        if (Config().CUSTOM_SKIN_URL)
          loadCustomSkin(Config().CUSTOM_SKIN_URL);

        if (Config().CUSTOM_GHOST_SKIN_URL)
          loadCustomSkin(Config().CUSTOM_GHOST_SKIN_URL, true)
      }

      return v
    }
  }
  if (typeof window.View == "function" && typeof window.Live != "function") { //force skin on replayers
    let onready = View.prototype.onReady
    View.prototype.onReady = function () {
      let val = onready.apply(this, arguments);
      if (Config().ENABLE_REPLAY_SKIN && Config().CUSTOM_SKIN_URL) {
        this.tex.crossOrigin = "anonymous"
        this.skinId = 1
        this.g.skins[1].data = Config().CUSTOM_SKIN_URL
        this.g.skins[1].w = customSkinSize
        this.tex.src = this.g.skins[1].data
      }
      return val
    }
  }
  if (typeof window.Game == "function") {
    let ls = Game.prototype.changeSkin
    Game.prototype.changeSkin = function () {
      let val = ls.apply(this, arguments)
      let url = this.skins[arguments[0]].data
      if (url == "resetRegular") {
        usingConnected = false
        ls.apply(this, [0])
        return val
      }
      if (this.v && this.v.NAME == "webGL") {
        this.v.ai_setBlend()
      }
      return val
    }
  }
  console.log("Custom skin loaded.");

}

export const initConnectedSkins = () => {
  const removeDimple = true
  const ghostAlpha = 0.5
  //  const blockConnections = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  const blockConnections = [-1, 1, 1, 1, 1, 1, 1, 1, 2, 3]


  let colors = blockConnections
  function solveConnected(blocks, x, y) {
    let connect_value = 0
    let checks = { N: false, S: false, E: false, W: false }
    let row = y
    let col = x
    if (row != 0 && blocks[row - 1][col] > 0) { connect_value += 1; checks.N = true }
    if (row != blocks.length - 1 && blocks[row + 1][col] > 0) { connect_value += 2; checks.S = true }
    if (blocks[row][col - 1] > 0) { connect_value += 4; checks.W = true; }
    if (blocks[row][col + 1] > 0) { connect_value += 8; checks.E = true; }
    let corners = { a: false, b: false, c: false, d: false }

    if (checks.N && checks.E && row != 0 && blocks[row - 1][col + 1] > 0) corners.a = true
    if (checks.S && checks.E && blocks[row + 1][col + 1] > 0) corners.b = true
    if (checks.S && checks.W && blocks[row + 1][col - 1] > 0) corners.c = true
    if (checks.N && checks.W && row != 0 && blocks[row - 1][col - 1] > 0) corners.d = true
    let overlay = 0
    if (corners.a) overlay = 16
    if (corners.b) overlay = 17
    if (corners.c) overlay = 18
    if (corners.d) overlay = 19
    return { connect_value: connect_value, overlay: overlay }
  }

  let drawCanvas = false

  if (window.WebGLView != undefined) {
    let onRedrawMatrix = WebGLView['prototype']['redrawMatrix']
    WebGLView['prototype']['redrawMatrix'] = function () {
      if (usingConnected) {
        this['clearMainCanvas']();
        if (this['g']['isInvisibleSkin']) {
          return
        };
        this.g.ai_drawMatrix()
        return
      }
      let val = onRedrawMatrix.apply(this, arguments)
      return val
    }
    let onWebglLoad = WebGLView.prototype.initRenderer
    WebGLView.prototype.initRenderer = function () {
      let val = onWebglLoad.apply(this, arguments)
      this.ai_setBlend()
      return val
    }
    WebGLView.prototype.ai_setBlend = function () {
      for (let ctx of this.ctxs) {
        let gl = ctx.gl
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      }
    }
    WebGLView['prototype']['ai_drawBlock'] = function (pos_x, pos_y, block_value, connect_value, main) {
      if (block_value) {
        let skin = this.g.skins[this.g.skinId]
        let scale = this['g']['drawScale'] * this['g']['block_size'];
        let cmain = this['ctxs'][main],
          texture = cmain['textureInfos'][0];

        this['drawImage'](cmain, texture['texture'], texture['width'], texture['height'], this['g']['coffset'][block_value] * skin.w, connect_value * skin.w, skin.w, skin.w, pos_x * this['g']['block_size'], pos_y * this['g']['block_size'], scale, scale)
      }
    };
    WebGLView['prototype']['ai_drawGhostBlock'] = function (pos_x, pos_y, block_value, connect_value) {
      let skinSize = this.g.skins[this.g.skinId].w
      var cmain = this['ctxs'][0];
      if (this['g']['ghostSkinId'] === 0) {
        cmain['gl']['uniform1f'](cmain['globalAlpha'], 0.5);
        this['ai_drawBlock'](pos_x, pos_y, block_value, connect_value, 0);
        cmain['gl']['uniform1f'](cmain['globalAlpha'], 1)
      } else {
        var scale = this['g']['drawScale'] * this['g']['block_size'];
        var texture = cmain['textureInfos'][1];
        this['drawImage'](cmain, texture['texture'], texture['width'], texture['height'], (this['g']['coffset'][block_value] - 2) * skinSize, connect_value * skinSize, skinSize, skinSize, pos_x * this['g']['block_size'], pos_y * this['g']['block_size'], scale, scale)
      }

    };
    WebGLView['prototype']['ai_drawBlockOnCanvas'] = function (a, b, c, d, e) {
      this['ai_drawBlock'](a, b, c, d, e)
    };
  }
  if (window.Ctx2DView != undefined) {
    let onRedrawMatrix = Ctx2DView['prototype']['redrawMatrix']
    Ctx2DView['prototype']['redrawMatrix'] = function () {
      if (usingConnected) {
        this['clearMainCanvas']();
        if (this['g']['isInvisibleSkin']) {
          return
        };
        this.g.ai_drawMatrix()
        return
      }
      let val = onRedrawMatrix.apply(this, arguments)
      return val
    }
    Ctx2DView['prototype']['ai_drawBlock'] = function (pos_x, pos_y, block_value, connect_value) {
      if (block_value && pos_x >= 0 && pos_y >= 0 && pos_x < 10 && pos_y < 20) {
        var scale = this['g']['drawScale'] * this['g']['block_size'];
        if (this['g']['skinId']) {
          this['ctx']['drawImage'](this['g']['tex'], this['g']['coffset'][block_value] * this['g']['skins'][this['g']['skinId']]['w'], connect_value * this['g']['skins'][this['g']['skinId']]['w'], this['g']['skins'][this['g']['skinId']]['w'], this['g']['skins'][this['g']['skinId']]['w'], pos_x * this['g']['block_size'], pos_y * this['g']['block_size'], scale, scale)
        } else {
          var mono = (this['g']['monochromeSkin'] && block_value <= 7) ? this['g']['monochromeSkin'] : this['g']['colors'][block_value];
          this['drawRectangle'](this['ctx'], pos_x * this['g']['block_size'], pos_y * this['g']['block_size'], scale, scale, mono)
        }
      }
    };
    Ctx2DView['prototype']['ai_drawGhostBlock'] = function (pos_x, pos_y, block_value, connect_value) {
      let scale = this['g']['drawScale'] * this['g']['block_size'];
      let skin = this.g.ghostSkins[this.g.ghostSkinId]
      let tex = this.g.ghostTex
      let coffset = this.g.coffset[block_value] - 2
      if (this.g.ghostSkinId === 0) {
        this['ctx']['globalAlpha'] = ghostAlpha;
        skin = this.g.skins[this.g.skinId]
        tex = this.g.tex
        coffset += 2
      }
      offscreenContext.drawImage(tex, coffset * skin.w, connect_value * skin.w, skin.w, skin.w, 0, 0, skin.w, skin.w)

      if (drawCanvas) {
        this.ctx.drawImage(offscreenCanvas, 0, 0, skin.w, skin.w, pos_x * this['g']['block_size'], pos_y * this['g']['block_size'], scale, scale)
      }
      this['ctx']['globalAlpha'] = 1
    }
    Ctx2DView['prototype']['ai_drawBlockOnCanvas'] = function (pos_x, pos_y, block_value, connect_value, render) {
      var renderer = (render === this['HOLD']) ? this['hctx'] : this['qctx'];
      if (this['g']['skinId'] === 0) {
        var mono = (this['g']['monochromeSkin'] && block_value <= 7) ? this['g']['monochromeSkin'] : this['g']['colors'][block_value];
        this['drawRectangle'](renderer, pos_x * this['g']['block_size'], pos_y * this['g']['block_size'], this['g']['block_size'], this['g']['block_size'], mono)
      } else {
        renderer['drawImage'](this['g']['tex'], this['g']['coffset'][block_value] * this['g']['skins'][this['g']['skinId']]['w'], connect_value * this['g']['skins'][this['g']['skinId']]['w'], this['g']['skins'][this['g']['skinId']]['w'], this['g']['skins'][this['g']['skinId']]['w'], pos_x * this['g']['block_size'], pos_y * this['g']['block_size'], this['g']['block_size'], this['g']['block_size'])
      }
    };

  };
  let template1 = function () {
    let blockset = this['blockSets'][this['activeBlock']['set']],
      blocks = (blockset['scale'] === 1) ? blockset['blocks'][this['activeBlock']['id']]['blocks'][this['activeBlock']['rot']] : blockset['previewAs']['blocks'][this['activeBlock']['id']]['blocks'][this['activeBlock']['rot']],
      blocks_length = blocks['length'];
    this['drawScale'] = blockset['scale'];
    if (this['ghostEnabled'] && !this['gameEnded']) {
      for (let y = 0; y < blocks_length; y++) {
        for (let x = 0; x < blocks_length; x++) {
          if (blocks[y][x] > 0) {
            if (!usingGhostConnected && this.ghostSkinId != 0) {
              this.v.drawGhostBlock(this.ghostPiece.pos.x + x * this.drawScale, this.ghostPiece.pos.y + y * this.drawScale, blockset.blocks[this.activeBlock.id].color)
              if (this.activeBlock.item && blocks[y][x] === this.activeBlock.item) {
                this.v.drawBrickOverlay(this.ghostPiece.pos.x + x * this.drawScale, this.ghostPiece.pos.y + y * this.drawScale, true)
              }
              continue
            }
            let solve = solveConnected(blocks, x, y)
            offscreenContext.clearRect(0, 0, this.skins[this.skinId].w, this.skins[this.skinId].w)
            if (solve.overlay > 0 && removeDimple) {
              drawCanvas = false
              this['v']['ai_drawGhostBlock'](this['ghostPiece']['pos']['x'] + x * this['drawScale'], this['ghostPiece']['pos']['y'] + y * this['drawScale'], blockset['blocks'][this['activeBlock']['id']]['color'], solve.connect_value, 0);
              if (this['activeBlock']['item'] && blocks[y][x] === this['activeBlock']['item']) {
                this['v']['drawBrickOverlay'](this['ghostPiece']['pos']['x'] + x * this['drawScale'], this['ghostPiece']['pos']['y'] + y * this['drawScale'], true)
              }
              drawCanvas = true
              this['v']['ai_drawGhostBlock'](this['ghostPiece']['pos']['x'] + x * this['drawScale'], this['ghostPiece']['pos']['y'] + y * this['drawScale'], blockset['blocks'][this['activeBlock']['id']]['color'], solve.overlay, 0)
            }
            else {
              drawCanvas = true
              this['v']['ai_drawGhostBlock'](this['ghostPiece']['pos']['x'] + x * this['drawScale'], this['ghostPiece']['pos']['y'] + y * this['drawScale'], blockset['blocks'][this['activeBlock']['id']]['color'], solve.connect_value, 0);

              if (this['activeBlock']['item'] && blocks[y][x] === this['activeBlock']['item']) {
                this['v']['drawBrickOverlay'](this['ghostPiece']['pos']['x'] + x * this['drawScale'], this['ghostPiece']['pos']['y'] + y * this['drawScale'], true)
              }
            }
          }
        }
      }
    };
    if (!this['gameEnded']) {
      for (let y = 0; y < blocks_length; y++) {
        for (let x = 0; x < blocks_length; x++) {
          if (blocks[y][x] > 0) {

            if (!usingConnected) {
              this.v.drawBlock(this.activeBlock.pos.x + x * this.drawScale, this.activeBlock.pos.y + y * this.drawScale, blockset.blocks[this.activeBlock.id].color, 0)
              if (this['activeBlock']['item'] && blocks[y][x] === this['activeBlock']['item']) {
                this['v']['drawBrickOverlay'](this['activeBlock']['pos']['x'] + x * this['drawScale'], this['activeBlock']['pos']['y'] + y * this['drawScale'], false)
              }
              continue
            }
            let solve = solveConnected(blocks, x, y)
            this['v']['ai_drawBlock'](this['activeBlock']['pos']['x'] + x * this['drawScale'], this['activeBlock']['pos']['y'] + y * this['drawScale'], blockset['blocks'][this['activeBlock']['id']]['color'], solve.connect_value, 0);
            if (this['activeBlock']['item'] && blocks[y][x] === this['activeBlock']['item']) {
              this['v']['drawBrickOverlay'](this['activeBlock']['pos']['x'] + x * this['drawScale'], this['activeBlock']['pos']['y'] + y * this['drawScale'], false)
            }
            if (solve.overlay > 0 && removeDimple) this['v']['ai_drawBlock'](this['activeBlock']['pos']['x'] + x * this['drawScale'], this['activeBlock']['pos']['y'] + y * this['drawScale'], blockset['blocks'][this['activeBlock']['id']]['color'], solve.overlay, 0);
          }
        }
      }
    };
    this['drawScale'] = 1
  };
  let template2 = function () {
    if (this['ISGAME'] && this['redrawBlocked']) {
      return
    };
    if (!this['ISGAME'] && (this['v']['redrawBlocked'] || !this['v']['QueueHoldEnabled'])) {
      return
    };
    this['v']['clearHoldCanvas']();
    if (this['blockInHold'] !== null) {
      var currSet = this['blockSets'][this['blockInHold']['set']]['previewAs'],
        blocks = currSet['blocks'][this['blockInHold']['id']]['blocks'][0],
        currColor = currSet['blocks'][this['blockInHold']['id']]['color'],
        currWeird = (!currSet['equidist']) ? currSet['blocks'][this['blockInHold']['id']]['yp'] : [0, 3],
        blocks_length = blocks['length'],
        something = (currSet['blocks'][this['blockInHold']['id']]['xp']) ? currSet['blocks'][this['blockInHold']['id']]['xp'] : [0, blocks_length - 1];
      for (var y = currWeird[0]; y <= currWeird[1]; y++) {
        for (var x = something[0]; x <= something[1]; x++) {
          if (blocks[y][x] > 0) {
            let solve = solveConnected(blocks, x, y)
            this['v']['ai_drawBlockOnCanvas'](x - something[0], y - currWeird[0], currColor, solve.connect_value, this['v'].HOLD);
            if (this['blockInHold']['item'] && blocks[y][x] === this['blockInHold']['item']) {
              this['v']['drawBrickOverlayOnCanvas'](x - something[0], y - currWeird[0], this['v'].HOLD)
            }
            if (solve.overlay > 0 && removeDimple) this['v']['ai_drawBlockOnCanvas'](x - something[0], y - currWeird[0], currColor, solve.overlay, this['v'].HOLD);
          }
        }
      }
    }
  };
  let template3 = function () {
    for (var row = 0; row < 20; row++) {
      for (var col = 0; col < 10; col++) {
        let block_value = this['matrix'][row][col]
        if (!block_value) continue
        let block_color = block_value

        block_value = colors[block_value]

        let connect_value = 0
        let checks = { N: false, S: false, E: false, W: false }

        if (row == 0) { if (colors[this.deadline[col]] == block_value) { connect_value += 1; checks.N = true } }
        else if (colors[this.matrix[row - 1][col]] == block_value) { connect_value += 1; checks.N = true }
        if (row != 19 && colors[this.matrix[row + 1][col]] == block_value) { connect_value += 2; checks.S = true }
        if (colors[this.matrix[row][col - 1]] == block_value) { connect_value += 4; checks.W = true; }
        if (colors[this.matrix[row][col + 1]] == block_value) { connect_value += 8; checks.E = true; }
        let corners = { a: false, b: false, c: false, d: false }

        if (checks.N && checks.E) { if (row == 0) { if (colors[this.deadline[col + 1]] == block_value) corners.a = true } else if (colors[this.matrix[row - 1][col + 1]] == block_value) corners.a = true }
        if (checks.S && checks.E && colors[this.matrix[row + 1][col + 1]] == block_value) corners.b = true
        if (checks.S && checks.W && colors[this.matrix[row + 1][col - 1]] == block_value) corners.c = true
        if (checks.N && checks.W) { if (row == 0) { if (colors[this.deadline[col - 1]] == block_value) corners.d = true } else if (colors[this.matrix[row - 1][col - 1]] == block_value) corners.d = true }

        this['v']['ai_drawBlock'](col, row, block_color, connect_value, this.v.MAIN)

        if (!removeDimple) continue
        if (corners.a) this['v']['ai_drawBlock'](col, row, block_color, 16, this.v.MAIN)
        if (corners.b) this['v']['ai_drawBlock'](col, row, block_color, 17, this.v.MAIN)
        if (corners.c) this['v']['ai_drawBlock'](col, row, block_color, 18, this.v.MAIN)
        if (corners.d) this['v']['ai_drawBlock'](col, row, block_color, 19, this.v.MAIN)
      }
    }
  }
  let template4 = function () {
    if (this['ISGAME'] && this['redrawBlocked']) {
      return
    } else {
      if (!this['ISGAME'] && (this['v']['redrawBlocked'] || !this['v']['QueueHoldEnabled'])) {
        return
      }
    };
    this['v']['clearQueueCanvas']();
    let plug = 0;
    for (var count = 0; count < this['R']['showPreviews']; count++) {
      if (count >= this['queue']['length']) {
        if (this['pmode'] != 9) {
          break
        };
        if (this['ModeManager']['repeatQueue']) {
          this['ModeManager']['addStaticQueueToQueue']()
        } else {
          break
        }
      };
      var currPiece = this['queue'][count];
      var currSet = this['blockSets'][currPiece['set']]['previewAs'],
        blocks = currSet['blocks'][currPiece['id']]['blocks'][0],
        currColor = currSet['blocks'][currPiece['id']]['color'],
        currWeird = (!currSet['equidist']) ? currSet['blocks'][currPiece['id']]['yp'] : [0, 3],
        blocks_length = blocks['length'],
        something = (currSet['blocks'][currPiece['id']]['xp']) ? currSet['blocks'][currPiece['id']]['xp'] : [0, blocks_length - 1];
      for (var y = currWeird[0]; y <= currWeird[1]; y++) {
        for (var x = something[0]; x <= something[1]; x++) {
          if (blocks[y][x] > 0) {
            let solve = solveConnected(blocks, x, y)
            this['v']['ai_drawBlockOnCanvas'](x - something[0], y - currWeird[0] + plug, currColor, solve.connect_value, this['v'].QUEUE);
            if (currPiece['item'] && blocks[y][x] === currPiece['item']) {
              this['v']['drawBrickOverlayOnCanvas'](x - something[0], y - currWeird[0] + plug, this['v'].QUEUE)
            }
            if (solve.overlay > 0 && removeDimple) this['v']['ai_drawBlockOnCanvas'](x - something[0], y - currWeird[0] + plug, currColor, solve.overlay, this['v'].QUEUE);
          }
        }
      };
      if (currSet['equidist']) {
        plug += 3
      } else {
        plug += currWeird[1] - currWeird[0] + 2
      }
    }
  };
  if (window.Game != undefined) {
    let onG = Game['prototype']['drawGhostAndCurrent']
    Game['prototype']['drawGhostAndCurrent'] = function () {
      if (usingConnected || usingGhostConnected) {
        return template1.call(this)
      }
      let val = onG.apply(this, arguments)
      return val
    }
    let onH = Game['prototype']['redrawHoldBox']
    Game['prototype']['redrawHoldBox'] = function () {
      if (usingConnected) {
        return template2.call(this)
      }
      let val = onH.apply(this, arguments)
      return val
    }
    let onQ = Game['prototype']['updateQueueBox']
    Game['prototype']['updateQueueBox'] = function () {
      if (usingConnected) {
        return template4.call(this)
      }
      let val = onQ.apply(this, arguments)
      return val
    }
    Game.prototype.ai_drawMatrix = template3
  }
  if (window.Replayer != undefined && location.href.includes('replay')) {
    Replayer.prototype.ai_drawMatrix = template3

    let onG = Replayer['prototype']['drawGhostAndCurrent']
    Replayer['prototype']['drawGhostAndCurrent'] = function () {
      if (usingConnected || (usingGhostConnected && this.g.ghostSkinId === 0)) {
        return template1.call(this)
      }
      let val = onG.apply(this, arguments)
      return val
    }
    let onH = Replayer['prototype']['redrawHoldBox']
    Replayer['prototype']['redrawHoldBox'] = function () {
      if (usingConnected) {
        return template2.call(this)
      }
      let val = onH.apply(this, arguments)
      return val
    }
    let onQ = Replayer['prototype']['updateQueueBox']
    Replayer['prototype']['updateQueueBox'] = function () {
      if (usingConnected) {
        return template4.call(this)
      }
      let val = onQ.apply(this, arguments)
      return val
    }
  }
  if (window.View != undefined) {
    if (!location.href.includes('export')) {
      View.prototype.ai_drawBlockOnCanvas = function (t, e, i, c, s) {
        let o = s === this.HOLD ? this.hctx : this.qctx;
        if (0 === this.skinId) {
          var n = this.g.monochromeSkin && i <= 7 ? this.g.monochromeSkin : this.g.colors[i];
          this.drawRectangle(o, t * this.block_size, e * this.block_size, this.block_size, this.block_size, n)
        } else {
          o.drawImage(this.tex, this.g.coffset[i] * this.g.skins[this.skinId].w, c * this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, t * this.block_size, e * this.block_size, this.block_size, this.block_size)
        }
      }
      let redraw = View.prototype.redraw
      View.prototype.redraw = function () {
        if (usingConnected) {
          if (!this.redrawBlocked) {
            if (this.clearMainCanvas(), !this.g.isInvisibleSkin) this.g.ai_drawMatrix()
            this.drawGhostAndCurrent(), this.g.redBar && this.drawRectangle(this.ctx, 240, (20 - this.g.redBar) * this.block_size, 8, this.g.redBar * this.block_size, "#FF270F")
          }
          return
        }

        return redraw.apply(this, arguments)
      }
      View.prototype.ai_drawBlock = function (t, e, i, c) {
        if (i && t >= 0 && e >= 0 && t < 10 && e < 20) {
          var s = this.drawScale * this.block_size;
          this.ctx.drawImage(this.tex, this.g.coffset[i] * this.g.skins[this.skinId].w, c * this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, t * this.block_size, e * this.block_size, s, s);
        }
      }
      View.prototype.ai_drawGhostBlock = function (t, e, i, c) {
        if (t >= 0 && e >= 0 && t < 10 && e < 20) {
          var s = this.drawScale * this.block_size;
          this.ctx.globalAlpha = ghostAlpha
          offscreenContext.drawImage(this.tex, this.g.coffset[i] * this.g.skins[this.skinId].w, c * this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, 0, 0, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w)
          if (drawCanvas) this.ctx.drawImage(offscreenCanvas, 0, 0, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, t * this.block_size, e * this.block_size, s, s)
          this.ctx.globalAlpha = 1;
        }
      }

      var oldDrawGhostAndCurrent = View.prototype.drawGhostAndCurrent;
      View.prototype.drawGhostAndCurrent = function () {

        if (!usingConnected)
          return oldDrawGhostAndCurrent.apply(this, arguments);

        var t = this.g.blockSets[this.g.activeBlock.set],
          e = 1 === t.scale ? t.blocks[this.g.activeBlock.id].blocks[this.g.activeBlock.rot] : t.previewAs.blocks[this.g.activeBlock.id].blocks[this.g.activeBlock.rot],
          i = e.length;
        if (this.drawScale = t.scale, this.ghostEnabled) {
          for (var s = 0; s < i; s++) {
            for (var o = 0; o < i; o++) {
              if (e[s][o] > 0) {
                let solve = solveConnected(e, o, s)
                offscreenContext.clearRect(0, 0, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w)
                drawCanvas = false
                if (solve.overlay > 0 && removeDimple) {
                  this.ai_drawGhostBlock(this.g.ghostPiece.pos.x + o * this.drawScale, this.g.ghostPiece.pos.y + s * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.connect_value);
                  drawCanvas = true
                  this.ai_drawGhostBlock(this.g.ghostPiece.pos.x + o * this.drawScale, this.g.ghostPiece.pos.y + s * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.overlay);
                }
                else {
                  drawCanvas = true
                  this.ai_drawGhostBlock(this.g.ghostPiece.pos.x + o * this.drawScale, this.g.ghostPiece.pos.y + s * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.connect_value);
                }
              }
            }
          }
        }
        for (s = 0; s < i; s++) {
          for (o = 0; o < i; o++) {
            if (e[s][o] > 0) {
              let solve = solveConnected(e, o, s)
              this.ai_drawBlock(this.g.activeBlock.pos.x + o * this.drawScale, this.g.activeBlock.pos.y + s * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.connect_value);
              if (solve.overlay > 0 && removeDimple) this.ai_drawBlock(this.g.activeBlock.pos.x + o * this.drawScale, this.g.activeBlock.pos.y + s * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.overlay);
            }
          }
        }
        this.drawScale = 1
      }
    }
    else {
      View.prototype.ai_drawBlockOnCanvas = function (t, i, s, c, e) {
        let h = this.block_size,
          o = this.ctx;
        if (e === this.HOLD ? (this.drawOffsetTop = this.AP.HLD.T, this.drawOffsetLeft = this.AP.HLD.L, this.block_size = this.AP.HLD.BS) : (this.drawOffsetTop = this.AP.QUE.T, this.drawOffsetLeft = this.AP.QUE.L, this.block_size = this.AP.QUE.BS), 0 === this.skinId) {
          var r = this.g.monochromeSkin && s <= 7 ? this.g.monochromeSkin : this.g.colors[s];
          this.drawRectangle(o, t * this.block_size, i * this.block_size, this.block_size, this.block_size, r)
        } else this.drawImage(o, this.tex, this.g.coffset[s] * this.g.skins[this.skinId].w, c * this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, t * this.block_size, i * this.block_size, this.block_size, this.block_size);
        this.block_size = h
      }
      let redraw = View.prototype.drawMainStage
      View.prototype.drawMainStage = function () {
        if (!usingConnected) {
          return redraw.apply(this, arguments)
        }
        if (this.drawOffsetTop = this.AP.STG.T, this.drawOffsetLeft = this.AP.STG.L, !this.g.isInvisibleSkin) this.g.ai_drawMatrix()
        this.drawGhostAndCurrent()
        if (this.g.redBar) this.drawRectangle(this.ctx, this.AP.STG.W, (20 - this.g.redBar) * this.BS, 8, this.g.redBar * this.BS, "#FF270F")
      }
      View.prototype.ai_drawBlock = function (t, i, s, c) {
        if (s && t >= 0 && i >= 0 && t < 10 && i < 20) {
          var e = this.drawScale * this.BS;
          this.drawImage(this.ctx, this.tex, this.g.coffset[s] * this.g.skins[this.skinId].w, c * this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, t * this.BS, i * this.BS, e, e);
        }
      }
      View.prototype.ai_drawGhostBlock = function (t, i, s, c) {
        if (t >= 0 && i >= 0 && t < 10 && i < 20) {
          var e = this.drawScale * this.BS;
          this.ctx.globalAlpha = ghostAlpha
          offscreenContext.drawImage(this.tex, this.g.coffset[s] * this.g.skins[this.skinId].w, c * this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, 0, 0, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w)
          if (drawCanvas) this.drawImage(this.ctx, offscreenCanvas, 0, 0, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w, t * this.BS, i * this.BS, e, e)
          this.ctx.globalAlpha = 1;
        }
      }
      var oldDrawGhostAndCurrent = View.prototype.drawGhostAndCurrent;
      View.prototype.drawGhostAndCurrent = function () {
        if (!usingConnected)
          return oldDrawGhostAndCurrent.apply(this, arguments);
        var t = this.g.blockSets[this.g.activeBlock.set],
          i = 1 === t.scale ? t.blocks[this.g.activeBlock.id].blocks[this.g.activeBlock.rot] : t.previewAs.blocks[this.g.activeBlock.id].blocks[this.g.activeBlock.rot],
          s = i.length;
        if (this.drawScale = t.scale, this.ghostEnabled) {
          for (var e = 0; e < s; e++) {
            for (var h = 0; h < s; h++) {
              if (i[e][h] > 0) {
                let solve = solveConnected(i, h, e)
                offscreenContext.clearRect(0, 0, this.g.skins[this.skinId].w, this.g.skins[this.skinId].w)
                drawCanvas = false
                if (solve.overlay > 0 && removeDimple) {
                  this.ai_drawGhostBlock(this.g.ghostPiece.pos.x + h * this.drawScale, this.g.ghostPiece.pos.y + e * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.connect_value);
                  drawCanvas = true
                  this.ai_drawGhostBlock(this.g.ghostPiece.pos.x + h * this.drawScale, this.g.ghostPiece.pos.y + e * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.overlay);
                }
                else {
                  drawCanvas = true
                  this.ai_drawGhostBlock(this.g.ghostPiece.pos.x + h * this.drawScale, this.g.ghostPiece.pos.y + e * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.connect_value);
                }
              }
            }
          }
        }
        for (e = 0; e < s; e++) {
          for (h = 0; h < s; h++) {
            if (i[e][h] > 0) {
              let solve = solveConnected(i, h, e)
              this.ai_drawBlock(this.g.activeBlock.pos.x + h * this.drawScale, this.g.activeBlock.pos.y + e * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.connect_value);
              if (solve.overlay > 0 && removeDimple) this.ai_drawBlock(this.g.activeBlock.pos.x + h * this.drawScale, this.g.activeBlock.pos.y + e * this.drawScale, t.blocks[this.g.activeBlock.id].color, solve.overlay);

            }
          }
        }
        this.drawScale = 1
      }
    }

  }
}