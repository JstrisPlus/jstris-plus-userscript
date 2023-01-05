/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/config.js
// these are default values
var config = {
  ENABLE_LINECLEAR_ANIMATION: true,
  ENABLE_LINECLEAR_SHAKE: true,
  ENABLE_PLACE_BLOCK_ANIMATION: true,
  ENABLE_ACTION_TEXT: true,

  PIECE_FLASH_OPACITY: 0.5,
  PIECE_FLASH_LENGTH: 0.5,
  LINE_CLEAR_LENGTH: 0.5,
  LINE_CLEAR_SHAKE_STRENGTH: 1,
  LINE_CLEAR_SHAKE_LENGTH: 1,

  BACKGROUND_IMAGE_URL: "",
  CUSTOM_SKIN_URL: "",
  CUSTOM_GHOST_SKIN_URL: "",
  ENABLE_REPLAY_SKIN: true,
  ENABLE_KEYBOARD_DISPLAY: false,

  ENABLE_OPPONENT_SFX: true,
  OPPONENT_SFX_VOLUME_MULTPLIER: 0.5,
  ENABLE_CUSTOM_VFX: false,
  ENABLE_CUSTOM_SFX: false,
  CUSTOM_SFX_JSON: "",

  ENABLE_STAT_APP: false,
  ENABLE_STAT_PPD: false,
  ENABLE_STAT_CHEESE_BLOCK_PACE: false,
  ENABLE_STAT_CHEESE_TIME_PACE: false,
  ENABLE_STAT_PPB: false,
  ENABLE_STAT_SCORE_PACE: false,
  ENABLE_STAT_PC_NUMBER: false,

  ENABLE_CHAT_TIMESTAMPS: true,
  SHOW_QUEUE_INFO: true,
  SHOW_MM_BUTTON: true,
  TOGGLE_CHAT_KEYCODE: null,
};

const defaultConfig = { ...config };

var listeners = [];

const initConfig = () => {
  for (var i in config) {
    var val = JSON.parse(localStorage.getItem(i));
    if (val != undefined && val != null) {
      config[i] = val;
    }
  }
}

const set = function (name, val) {
  config[name] = val;
  localStorage.setItem(name, JSON.stringify(val));
  for (var { event, listener } of listeners) {
    if (event == name)
      listener(val);
  }
}

const config_reset = function (name) {
  set(name, defaultConfig[name]);
}

const onChange = (event, listener) => {
  listeners.push({ event, listener });
}

const Config = () => ({ ...config, set, onChange, reset: config_reset });
;// CONCATENATED MODULE: ./src/util.js
const shouldRenderEffectsOnView = (view) => {
  return view.holdCanvas && view.holdCanvas.width >= 70;
}


const lerp = (start, end, amt) => {
  return (1 - amt) * start + amt * end;
}

// https://jsfiddle.net/12aueufy/1/
var shakingElements = [];

const shake = function (element, magnitude = 16, numberOfShakes = 15, angular = false) {
  if (!element) return;

  //First set the initial tilt angle to the right (+1)
  var tiltAngle = 1;

  //A counter to count the number of shakes
  var counter = 1;

  //The total number of shakes (there will be 1 shake per frame)

  //Capture the element's position and angle so you can
  //restore them after the shaking has finished
  var startX = 0,
    startY = 0,
    startAngle = 0;

  // Divide the magnitude into 10 units so that you can
  // reduce the amount of shake by 10 percent each frame
  var magnitudeUnit = magnitude / numberOfShakes;

  //The `randomInt` helper function
  var randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  //Add the element to the `shakingElements` array if it
  //isn't already there


  if (shakingElements.indexOf(element) === -1) {
    //console.log("added")
    shakingElements.push(element);

    //Add an `updateShake` method to the element.
    //The `updateShake` method will be called each frame
    //in the game loop. The shake effect type can be either
    //up and down (x/y shaking) or angular (rotational shaking).
    if (angular) {
      angularShake();
    } else {
      upAndDownShake();
    }
  }

  //The `upAndDownShake` function
  function upAndDownShake() {

    //Shake the element while the `counter` is less than
    //the `numberOfShakes`
    if (counter < numberOfShakes) {

      //Reset the element's position at the start of each shake
      element.style.transform = 'translate(' + startX + 'px, ' + startY + 'px)';

      //Reduce the magnitude
      magnitude -= magnitudeUnit;

      //Randomly change the element's position
      var randomX = randomInt(-magnitude, magnitude);
      var randomY = randomInt(-magnitude, magnitude);

      element.style.transform = 'translate(' + randomX + 'px, ' + randomY + 'px)';

      //Add 1 to the counter
      counter += 1;

      requestAnimationFrame(upAndDownShake);
    }

    //When the shaking is finished, restore the element to its original
    //position and remove it from the `shakingElements` array
    if (counter >= numberOfShakes) {
      element.style.transform = 'translate(' + startX + ', ' + startY + ')';
      shakingElements.splice(shakingElements.indexOf(element), 1);
    }
  }

  //The `angularShake` function
  function angularShake() {
    if (counter < numberOfShakes) {

      //Reset the element's rotation
      element.style.transform = 'rotate(' + startAngle + 'deg)';

      //Reduce the magnitude
      magnitude -= magnitudeUnit;

      //Rotate the element left or right, depending on the direction,
      //by an amount in radians that matches the magnitude
      var angle = Number(magnitude * tiltAngle).toFixed(2);

      element.style.transform = 'rotate(' + angle + 'deg)';
      counter += 1;

      //Reverse the tilt angle so that the element is tilted
      //in the opposite direction for the next shake
      tiltAngle *= -1;

      requestAnimationFrame(angularShake);
    }

    //When the shaking is finished, reset the element's angle and
    //remove it from the `shakingElements` array
    if (counter >= numberOfShakes) {
      element.style.transform = 'rotate(' + startAngle + 'deg)';
      shakingElements.splice(shakingElements.indexOf(element), 1);
    }
  }

};


// @params callback: (name: string , loggedIn: boolean) => {}
const getPlayerName = (callback) => {
  fetch("https://jstris.jezevec10.com/profile").then(res => {
    if (res.url.includes("/u/")) {
      let username = res.url.substring(res.url.indexOf("/u/")+3);
      callback(username, true);
    } else {
      callback("", false)
    }
  }).catch(e => {
    console.log(e);
    callback("", false)
  })
}
;// CONCATENATED MODULE: ./src/actiontext.js



const DELAY = 1500; // ms
const FADEOUT = 0.15; // s
const SPIKE_TIMER = 1000;
const MAX_HEIGHT = 250;

class Displayer {

    constructor(index) {
        this.index = index;
        this.id = 0;
        this.displayedActions = [];
        this.spike = 0;
        this.lastAttack = 0;
        this.lastSpikeAttack = 0;
    }

    displayNewAction(value, atk) {

        if (!Config().ENABLE_ACTION_TEXT)
            return;

        let ctime = (new Date()).getTime();
        let spike_tracker = document.getElementById(`atk_spike_${this.index+1}`);
        if (ctime - this.lastAttack < SPIKE_TIMER) {
            this.spike += value;
        } else {
            this.spike = value
        }
        if (this.spike >= 10) {
            spike_tracker.classList.remove("fade");
            spike_tracker.classList.add("fade", "in");
            spike_tracker.innerHTML = `${this.spike} SPIKE`;
            this.lastSpikeAttack = ctime;
            setTimeout((time) => {
                if (this.lastSpikeAttack == time) {
                    spike_tracker.classList.remove("in");
                    setTimeout((remove_from) => {
                       remove_from.innerHTML = "";
                    }, FADEOUT * 1000, spike_tracker);
                    this.spike = 0;
                }
            }, SPIKE_TIMER, ctime);
        }
        this.lastAttack = ctime;
        let action = document.createElement("p");
        action.innerHTML = `+${value}<br> ${atk}`;
        action.setAttribute("id", `atk_text_${this.index+1}_${this.id++}`);
        action.setAttribute("class", "action-text fade in");
        action.style.textAlign = "center";
        if (value >= 5) {
            action.style.fontSize = "large";
            action.style.fontWeight = "bold";
        }
        if (value >= 10) {
            action.style.color = "red";
        }
        document.getElementById(`atk_div_${this.index+1}`).prepend(action);
        this.displayedActions.splice(0, 0, action.id);
        setTimeout((ind, id) => {
            try {
                let target = document.getElementById(`atk_text_${ind+1}_${id-1}`);
                target.classList.remove("in");
                setTimeout((target) => {
                    try {
                        this.displayedActions = this.displayedActions.filter((i) => i != target.id);
                        target.parentNode.removeChild(target);
                    } catch (e) {} // idc
                }, FADEOUT * 1000, target);
            } catch (e) {} // idc
        }, DELAY, this.index, this.id);
    }

    reset() {
        for (let action of this.displayedActions) {
            try{
                action.parentNode.removeChild(action);
            }catch(e){}
        }
        this.displayedActions = [];
        this.id = 0;
    }

}

class DisplayerManager {
    constructor() {
        this.displayers = [];
    }

    createDisplayer() {
        let a = new Displayer();
        a.index = this.addDisplayer(a);
        return a;
    }

    addDisplayer(displayer) {
        for (let i = 0; i < this.displayers.length; i++) {
            if (this.displayers[i] == null) {
                this.displayers[i] = displayer;
                return i;
            }
        }
        this.displayers.push(displayer);
        return this.displayers.length - 1;
    }

    destroyDisplayer(displayer) {
        for (let i = 0; i < this.displayers.length; i++) {
            if (this.displayers[i] == displayer) {
                this.displayers[i] = null;
                return i;
            }
        }
    }
}

const initActionText = () => {
    'use strict';
    window.displayerManager = new DisplayerManager();
    let lstages = document.getElementsByClassName("lstage");
    if (lstages.length == 0) {
        let canvases = document.querySelectorAll("div#main > canvas"); // who tf uses the same ID for multiple thing smh
        for (let canvas of canvases) {
            let div = document.createElement("div");
            div.setAttribute("class", "lstage");
            canvas.parentNode.insertBefore(div, canvas);
            div.appendChild(canvas);
        }
    }
    lstages = document.getElementsByClassName("lstage");
    for (let i = 1; i <= lstages.length; i++) {
        let lstage = lstages[i-1];
        let num = window.displayerManager.createDisplayer();
        let spike_tracker = document.createElement("p");
        spike_tracker.setAttribute("id", `atk_spike_${num.index+1}`);
        spike_tracker.setAttribute("style", `max-width: 96px; color: yellow; font-weight: bold;`);
        spike_tracker.setAttribute("class", "spike-tracker fade in");
        lstage.appendChild(spike_tracker);
        let atkdiv = document.createElement("div");
        atkdiv.setAttribute("style", `max-width: 96px; max-height: ${MAX_HEIGHT}px; overflow: hidden; padding: 5px;`);
        atkdiv.setAttribute("id", `atk_div_${num.index+1}`);
        lstage.appendChild(atkdiv);
    }
    if(typeof trim != "function"){var trim=a=>{a=a.slice(0,-1);a=a.substr(a.indexOf("{")+1);return a}}
    if(typeof getArgs != "function"){
        var getArgs=a=>{
            let args = a.toString().match(/function\s*(?:[_a-zA-Z]\w*\s*)?\(((?:(?:[_a-zA-Z]\w*)\s*,\s*?)*(?:[_a-zA-Z]\w*)?)\)/);
            if (args.length > 1) return args[1].split(/\s*,\s*/g);
            return [];
        }
    }
    let displayActionText = function() {
        try{
        let names = ["", "", "Single", "Double", "Triple", "Quad", "T&#x2011;Spin Mini", "T&#x2011;Spin", "T&#x2011;Spin Mini&nbsp;Single", "T&#x2011;Spin Single", "T&#x2011;Spin Double", "T&#x2011;Spin Triple", "Perfect Clear!", "Combo/Ren", "Multi"];
        let playerNum;
        let parseCanvasName = function(name) {
            let number = name.match(/(\d+)$/);
            if (number === null) return 1; // no number, assume is first player
            return parseInt(number[0]);
        }

        let IS_BOT = false;

        switch(this.v.constructor.name) {
            case "Ctx2DView":
            case "View":
                playerNum = parseCanvasName(this.v.ctx.canvas.id) - 1;
                break;
            case "WebGLView":
                playerNum = parseCanvasName(this.v.ctxs[0].elem.id) - 1;
                break;
            case "SlotView":
                IS_BOT = !!(this.p && this.p.bot && this.p.bot.IS_BOT);
                playerNum = (this.v.displayer) ? this.v.displayer.index : -1;
                break;
            default:
                console.log("Uhoh looks like something unknown happened >.<");
                break;
        }

        if (IS_BOT || (this.GameStats.ordered[0].initialVal != this.GameStats.ordered[0].value && playerNum != -1)) {
            if (!this.displayer) {
                this.displayer = window.displayerManager.displayers[playerNum];
            }
            this.displayer.displayNewAction(atk + cba, ((b2b && this.isBack2Back) ? "B2B " : "") + names[type] + ((cmb > 0) ? ` combo${cmb}` : ""));
        }
        } catch(e) {console.log(e);}
    }
    let replacer = function(match, p1, p2, p3) {return match + `let atk = ${p1}; let cba = ${p2}; let type = ${p3}.type; let b2b = ${p3}.b2b; let cmb = ${p3}.cmb;` + trim(displayActionText.toString());}
    try {
    GameCore.prototype.checkLineClears = new Function(...getArgs(GameCore.prototype.checkLineClears), trim(GameCore.prototype.checkLineClears.toString()).replace(/(_0x[a-f0-9]+x[a-f0-9]+)\+ (_0x[a-f0-9]+x[a-f0-9]+);let (_0x[a-f0-9]+x[a-f0-9]+)=\{type:_0x[a-f0-9]+x[a-f0-9]+,b2b:this\[_0x[a-f0-9]+\[\d+]],cmb:this\[_0x[a-f0-9]+\[\d+]]};/, replacer));
    } catch(e) {
        console.log(e);
        console.log("Could not inject into line clears!");
    }
    try{
        Replayer.prototype.checkLineClears = function(a) {
            GameCore.prototype.checkLineClears.call(this, a);
        }
        const oldInitReplay = Replayer.prototype.initReplay
        Replayer.prototype.initReplay = function() {
            try{
                if (this.v.displayer && this.v.displayer.reset)
                    this.v.displayer.reset()
            } catch(e) {
                console.log(e);
            }
            return oldInitReplay.apply(this, arguments);
        }
    } catch(e) {
        console.log(e);
        console.log("Could not inject into line clears!");
    }
    try {
    SlotView.prototype.onResized = function() {
        this.block_size = this.slot.gs.liveBlockSize;
        this.holdQueueBlockSize = this.slot.gs.holdQueueBlockSize;
        this.drawBgGrid();
        this.clearMainCanvas();
        if (this.slot.gs.isExtended) {
            this.QueueHoldEnabled = true;
            this.holdCanvas.style.display = 'block';
            this.queueCanvas.style.display = 'block';
            if (shouldRenderEffectsOnView(this)) {
                if (this.displayer === undefined) {
                    this.displayer = window.displayerManager.createDisplayer();
                }
                try {
                    let top = this.holdCanvas.height + parseInt(this.holdCanvas.style.top);
                    let left = parseInt(this.holdCanvas.style.left);
                    if (!document.getElementById(`atk_spike_${this.displayer.index+1}`)) {
                        let spike_tracker = document.createElement("p");
                        spike_tracker.setAttribute("class", "layer fade in");
                        spike_tracker.setAttribute("style", `top: ${top}px; left: ${left}px; width: ${this.holdCanvas.width}px; height: 20px; color: yellow; font-weight: bold;`);
                        spike_tracker.setAttribute("id", `atk_spike_${this.displayer.index+1}`);
                        this.holdCanvas.parentNode.appendChild(spike_tracker);

                    }
                    if (!document.getElementById(`atk_div_${this.displayer.index+1}`)) {
                        let atkdiv = document.createElement("div");
                        atkdiv.setAttribute("class", "layer");
                        atkdiv.setAttribute("style", `top: ${top+40}px; left: ${left}px; width: ${this.holdCanvas.width}px; max-height: ${MAX_HEIGHT}px; overflow: hidden;`);
                        atkdiv.setAttribute("id", `atk_div_${this.displayer.index+1}`);
                        this.holdCanvas.parentNode.appendChild(atkdiv);
                    }
                } catch (e) {console.log(e);}
            }
        } else {
            this.QueueHoldEnabled = false;
            this.holdCanvas.style.display = 'none';
            this.queueCanvas.style.display = 'none';
            console.log("You are using the Display Attack plugin, which will only function IF H&Q is on.");
        }
    };
    } catch (e) {
        console.log(e);
        console.log("Could not inject into SlotView!");
    }
};

;// CONCATENATED MODULE: ./src/replayManager.js
let isReplayerReversing = false

const initReplayManager = () => {
    let skipping = false


    let repControls = document.getElementById("repControls")
    let skipButton = document.createElement("button")
    skipButton.textContent = "skip"
    skipButton.onclick = function () {
        if (skipping) {
            skipButton.textContent = "skip"
        } else {
            skipButton.textContent = "step"
        }
        skipping = !skipping
    }
    if (repControls) repControls.appendChild(skipButton)
    let nextFrame = ReplayController.prototype.nextFrame
    ReplayController.prototype.nextFrame = function () {
        if (!skipping) {
            return nextFrame.apply(this, arguments)
        }

        // find the next upcoming hard drop
        let nextHdTime = -1;
        this.g.forEach((r, _) => {
            for (let i = r.ptr; i < r.actions.length; i++) {
                let action = r.actions[i].a;
                let time = r.actions[i].t;

                if (action == Action.HARD_DROP) {
                    if (nextHdTime == -1 || time < nextHdTime)
                        nextHdTime = time;
                    break;
                }
            }
        });

        // play all replayers until that time
        if (nextHdTime < 0) return;
        this.g.forEach((r, _) => r.playUntilTime(nextHdTime));
    }
    let prevFrame = ReplayController.prototype.prevFrame
    ReplayController.prototype.prevFrame = function () {
        isReplayerReversing = true
        if (!skipping) {
            let v = prevFrame.apply(this, arguments)
            isReplayerReversing = false
            return v
        }
        let skipBack = 0
        let passed = false
        this.g.forEach((r, _) => {
            for (let i = r.ptr - 1; i >= 0; i--) {
                let action = r.actions[i].a;
                skipBack += 1

                if (action == Action.HARD_DROP) {
                    if (passed) {
                        skipBack -= 1
                        break
                    }
                    passed = true
                }
            }
        });
        for (let i = 0; i < skipBack; i++) {
            isReplayerReversing = true
            prevFrame.apply(this, arguments)
            isReplayerReversing = false
        }
        isReplayerReversing = false
    }
    let lR = ReplayController.prototype.loadReplay
    ReplayController.prototype.loadReplay = function () {
        let v = lR.apply(this, arguments)
        document.getElementById("next").onclick = this.nextFrame.bind(this)
        document.getElementById("prev").onclick = this.prevFrame.bind(this)
        return v
    }
}
;// CONCATENATED MODULE: ./src/jstris-fx.js



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

const initFX = () => {
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

;// CONCATENATED MODULE: ./src/matchmaking.js



let ROOMBA = "JstrisPlus"


function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}
function addMatchesBtn(name) {
  for (let dropDown of document.getElementsByClassName("dropdown-menu")) {
    let found = false
    let children = dropDown.children
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      if (!child.children.length > 0) continue
      if (child.children[0].href == "https://jstris.jezevec10.com/profile") {
        found = true
        let li = document.createElement("li")
        let a = document.createElement("a")
        a.style.color = "#ffb700"
        a.href = "https://jstris.jezevec10.com/matches/" + name
        a.textContent = "Matchmaking History"
        li.appendChild(a)
        dropDown.insertBefore(li, child.nextSibling)
        break
      }
    }
    if (found) {
      break
    }
  }
}

const insertChatButtons = (sendMessage) => {
  let chatBox = document.getElementById("chatContent");
  let chatButtons = document.createElement("div");
  chatButtons.className = "mm-chat-buttons-container"
  let readyButton = document.createElement("button")
  readyButton.className = "mm-ready-button"
  readyButton.textContent = "Ready"
  chatButtons.prepend(readyButton)
  chatBox.appendChild(chatButtons);
  readyButton.addEventListener("click", () => {
    readyButton.disabled = true
    setTimeout(() => {
      readyButton.disabled = false
    }, 1000)
    sendMessage("!ready");
  })
  return (function (boundButtonsDiv) {
    return () => {
      try {
        document.getElementById("chatContent").removeChild(boundButtonsDiv);
      } catch (e) {
        //console.log(e);
        console.log("Ready button was already removed.");
      }
    }
  })(chatButtons) // do this to make sure that the returned kill callback is removing the correct div
}

const initMM = () => {
  let HOST = "wss://jeague.tali.software/";
  let readyKiller = null
  // development server
  if (false) {}

  // local server
  if (false) {}

  console.log(`Attempting to connect to matchmaking host: ${HOST}`);

  let p = document.createElement("button");
  p.className = "mmButton";
  p.id = "queueButton";
  p.textContent = "Enter Matchmaking";
  const JEAGUE_VERSION = "sumos";
  let urlParts = window.location.href.split("/");
  if (typeof Live == "function") {
    let chatListener = Live.prototype.showInChat
    let suppressChat = false
    let nameListener = Live.prototype.getName
    Live.prototype.getName = function () {
      if (arguments[0] && this.clients[arguments[0]] && this.clients[arguments[0]].name == ROOMBA) {
        return "[Matchmaking]"
      }
      let v = nameListener.apply(this, arguments)
      return v
    }
    Live.prototype.showInChat = function () {
      if (suppressChat) return
      let val = chatListener.apply(this, arguments)
      return val
    }
    let responseListener = Live.prototype.handleResponse
    Live.prototype.handleResponse = function () {
      let res = arguments[0]
      suppressChat = false
      if (res.t == 6) {
        if (res.m == "<em>Room wins counter set to zero.</em>") {
          for (let client of Object.values(this.clients)) {
            if (client.name == ROOMBA) {
              suppressChat = true
            }
          }
        }
      } else if (res.t == 2) {
        if (res.n == ROOMBA) {
          suppressChat = true
          cc.style.display = "none"
        }
      } else if (res.t == 3) {
        if (this.clients[res.cid] && this.clients[res.cid].name == ROOMBA) {
          suppressChat = true
          cc.style.display = "flex"
          if (readyKiller) {
            readyKiller()
          }
        }
      } else if (res.t == 4) {
        let found = false
        if (res.players) {

          for (let key in res.players) {
            if (res.players[key].n == ROOMBA) {
              found = true
              break
            }
          }
        }
        if (res.spec) {
          for (let key in res.spec) {
            if (res.spec[key].n == ROOMBA) {
              found = true
              break
            }
          }
        }
        if (found) {
          cc.style.display = "none"
        } else {
          cc.style.display = "flex"
        }
      }
      let val = responseListener.apply(this, arguments)
      suppressChat = false
      return val
    }


    if (Config().SHOW_QUEUE_INFO) {
      document.body.classList.add("show-queue-info");
    }
    Config().onChange("SHOW_QUEUE_INFO", val => {
      if (val) {
        document.body.classList.add("show-queue-info");
      } else {
        document.body.classList.remove("show-queue-info");
      }
    })
    if (Config().SHOW_MM_BUTTON) {
      document.body.classList.add("show-mm-button");
    }
    Config().onChange("SHOW_MM_BUTTON", val => {
      if (val) {
        document.body.classList.add("show-mm-button");
      } else {
        document.body.classList.remove("show-mm-button");
      }
    })
    let queueinfo = document.createElement("div");
    queueinfo.className = "mmInfoContainer";
    queueinfo.textContent = "not connected to matchmaking";
    let cc = document.createElement("div")
    cc.className = 'mmContainer'
    document.body.appendChild(cc)
    cc.prepend(queueinfo);
    let liveObj = null
    let liveListener = Live.prototype.authorize;
    Live.prototype.authorize = function () {
      liveObj = this
      let val = liveListener.apply(this, arguments);
      if (arguments[0] && arguments[0].token) {
        //loadMM(arguments[0].token);
        loadMM();
      }
      return val;
    };

    //function loadMM(token) {
    function loadMM() {
      let name = liveObj.chatName;

      addMatchesBtn(liveObj.chatName)
      let CONNECTED = false;
      let ws = new WebSocket(HOST);
      /*     let connectionListener = Live.prototype.onClose
           Live.prototype.onClose = function () {
             let val = connectionListener.apply(this, arguments)
             ws.close()
             status = UI_STATUS.offline
             updateUI()
             return val
           }*/
      let UI_STATUS = {
        idle: 0,
        queueing: 1,
        loading: 2,
        declined: 3,
        banned: 4,
        offline: 5,
      };
      let status = UI_STATUS.idle;
      let numQueue = 0;
      let numPlaying = 0;
      let numActive = 0
      let HOVERING = false;

      let timeInQueue = 0;
      let timeInc = null;
      let toMMSS = function (sec_num) {
        let minutes = Math.floor(sec_num / 60);
        let seconds = sec_num - minutes * 60;
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        return "" + minutes + ":" + seconds;
      };
      let OFFLINED = false
      function updateUI(msg) {
        if (OFFLINED) return
        switch (status) {
          case UI_STATUS.queueing:
            if (HOVERING) {
              p.textContent = "Exit Matchmaking";
            } else {
              p.textContent = toMMSS(timeInQueue);
            }
            queueinfo.textContent = `[${numPlaying}]${numQueue} in queue\n${numActive} online`;
            break;
          case UI_STATUS.idle:
            p.textContent = "Enter Matchmaking";
            queueinfo.textContent = `[${numPlaying}]${numQueue} in queue\n${numActive} online`;
            break;
          case UI_STATUS.loading:
            p.textContent = "Loading";
            queueinfo.textContent = `[${numPlaying}]${numQueue} in queue\n${numActive} online`;
            break;
          case UI_STATUS.declined:
            queueinfo.textContent = "You Are Already In Queue";
            p.remove();
            break;
          case UI_STATUS.banned:
            queueinfo.style.minWidth = "1000px"
            queueinfo.textContent = "You Are Banned";
            p.remove();
            OFFLINED = true
            break;
          case UI_STATUS.offline:
            OFFLINED = true
            queueinfo.style.color = "#bcc8d4";
            queueinfo.className = "mmInfoContainer";
            queueinfo.textContent = "not connected to matchmaking";
            p.remove();
            break
        }
        if (msg) {
          queueinfo.textContent = msg;
        }
      }

      function ping() {
        ws.send(JSON.stringify({ type: "ping" }));
      }

      function updateClock() {
        timeInQueue += 1;
        updateUI();
      }
      p.onmouseover = function () {
        HOVERING = true;
        p.style.color = "rgba(255,255,255,0.7)";
        updateUI();
      };
      p.onmouseout = function () {
        HOVERING = false;
        p.style.color = "rgba(255,255,255,1)";
        updateUI();
      };

      ws.onmessage = event => {
        let res = JSON.parse(event.data);
        if (res.type == "room") {
          status = UI_STATUS.idle;
          liveObj.joinRoom(res.rid)
          console.log("found match at " + res.rid)
          createjs.Sound.play("readyPlayerDal");
          if (readyKiller) {
            readyKiller()
          }
          document.title = "🚨Match Starting!";
          setTimeout(() => {
            document.title = "Jstris";
          }, 2000);
          updateUI();
        } else if (res.type == "readyStart") {
          cc.style.display = "none"
          readyKiller = insertChatButtons(msg => ws.send(JSON.stringify({ type: "ready", rid: liveObj.rid, cid: liveObj.cid })));

        } else if (res.type == "readyConfirm") {
          if (res.rid == liveObj.rid) {
            if (readyKiller) readyKiller()
          }
        } else if (res.type == "msg") {
          if (res.secret) {
            liveObj.showInChat("", `<em><b>${res.msg}</b></em>`)
          } else { liveObj.showInChat("[Matchmaking]", res.msg) }
        } else if (res.type == "accept") {
          timeInQueue = 0;
          clearInterval(timeInc);
          timeInc = setInterval(updateClock, 1000);
          status = UI_STATUS.queueing;
          updateUI();
        } else if (res.type == "decline") {
          status = UI_STATUS.declined;
          updateUI();
        } else if (res.type == "bans") {
          status = UI_STATUS.banned;
          let banmsg = "You are banned from matchmaking for:"
          console.log(res.bans)
          for (let ban of res.bans) {
            banmsg += " " + ban.reason + "; Expires: " + new Date(ban.timeout).toLocaleString();
          }
          updateUI(banmsg);
        } else if (res.type == "removed") {
          status = UI_STATUS.idle;
          updateUI();
        } else if (res.type == "ping") {
          if (res.queue > 0) {
            queueinfo.style.color = "#1b998b";
          } else {
            queueinfo.style.color = "#bcc8d4";
          }
          numQueue = res.queue;
          numPlaying = res.playing;
          numActive = res.active
          updateUI();
        } else if (res.type == "init") {
          CONNECTED = true;
          cc.prepend(p);
          status = UI_STATUS.idle;
          updateUI();
          console.log("JEAGUE LEAGUE CONNECTED");
        }
      };
      let WSOPENED = false
      ws.onopen = function (event) {
        WSOPENED = true
        setInterval(ping, 10000);
        ws.send(JSON.stringify({ type: "init", name: name, version: JEAGUE_VERSION }));
        //ws.send(JSON.stringify({ type: "init", token: token, version: JEAGUE_VERSION }));
        p.onclick = function () {
          if (!CONNECTED) {
            return;
          }
          if (status == UI_STATUS.queueing) {
            status = UI_STATUS.loading;
            ws.send(JSON.stringify({ type: "disconnect" }));
          } else if (liveObj.connected) {
            status = UI_STATUS.loading;
            ws.send(JSON.stringify({ type: "connect" }));
          } else {
            alert("you are not connected to jstris")
          }
          updateUI();
        };
      };
      ws.onclose = function () {
        if (WSOPENED) {
          status = UI_STATUS.offline
          updateUI("jstris+ server down")
        }
      }
    }
  } else if (urlParts[3] && urlParts[3] == "u" && urlParts[4]) {
    let nameHolders = document.getElementsByClassName("mainName")
    let mainName = ""
    if (nameHolders[0] && nameHolders[0].firstChild) {
      mainName = nameHolders[0].firstChild.textContent.trim()
    } else {
      return
    }
    addMatchesBtn(mainName)
    let ws = new WebSocket(HOST);
    let cc = document.getElementsByClassName("col-flex-bio col-flex")[0];




    ws.onopen = function () {
      ws.send(JSON.stringify({ type: "stats", name: mainName }));
    };
    let loaded = false;
    ws.onmessage = event => {
      let res = JSON.parse(event.data);
      if (res.type == "stats") {
        if (!loaded) {
          let playerInfo = document.createElement("div");
          playerInfo.className = "aboutPlayer";
          let statHeader = document.createElement("span");
          statHeader.className = "aboutTitle";
          statHeader.textContent = "Matchmaking Stats";
          let statInfo = document.createElement("div");
          statInfo.className = "aboutBox";
          statInfo.style.whiteSpace = "pre-wrap"
          for (const [key, value] of Object.entries(res.stats)) {
            let b = document.createElement("b")
            let span = document.createElement("span")
            let br = document.createElement("br")
            b.textContent = key + ": "
            span.textContent = value
            statInfo.appendChild(b)
            statInfo.appendChild(span)
            statInfo.appendChild(br)
          }
          playerInfo.appendChild(statHeader);
          playerInfo.appendChild(statInfo);
          cc.appendChild(playerInfo);
        }
        loaded = true;
      }
    };
  } else if (urlParts[3] && urlParts[3] == "matches" && urlParts[4]) {
    let cc = document.getElementsByClassName("well")[0];
    let collapsible = document.createElement("button")
    collapsible.className = "mmCollapsible"
    collapsible.textContent = "Jstris+ Matches"
    let collapsibleCarrot = createElementFromHTML("<span class='caret'></span>")
    collapsible.appendChild(collapsibleCarrot)
    let matchView = document.createElement("div")
    matchView.className = "col-sm-12 mmMatches"
    collapsible.onclick = () => {
      if (matchView.style.display == "block") { matchView.style.display = "none" }
      else { matchView.style.display = "block" }
    }
    let VERIFIED = false;
    getPlayerName((name, isLoggedIn) => {
      addMatchesBtn(name)
      if (name != decodeURI(urlParts[4]) || !isLoggedIn) return

      if (!VERIFIED) {

        let modal = document.createElement("div");
        let modalContent = document.createElement("div");
        let modalClose = document.createElement("span");
        let modalTable = document.createElement("table");
        modalClose.className = "mmClose";
        modalClose.textContent = "×";
        modalContent.appendChild(modalTable);
        modalContent.appendChild(modalClose);
        modal.className = "mmModal";
        modalContent.className = "mmModal-content";
        modal.append(modalContent);
        modalClose.onclick = function () {
          modal.style.display = "none";
        };

        modalTable.className = "table table-striped table-hover match-list";

        document.body.appendChild(modal);

        function loadGame(game, match) {
          const ALL_STATS = ["apm", "pps", "cheese", "apd", "time"];
          let table = modalContent.firstChild;
          while (table.firstChild) {
            table.removeChild(table.firstChild);
          }
          let aref = document.createElement("a");
          let apic = document.createElement("img");
          aref.style.position = "absolute";
          aref.style.left = "5px";
          aref.style.top = "5px";
          apic.src = "https://jstris.jezevec10.com/res/play.png";
          aref.appendChild(apic);
          aref.href = `/games/${game.gid}`;
          aref.target = "_blank";
          table.appendChild(aref);
          //   console.log(res)
          if (game.stats || game.altStats) {
            let thead = document.createElement("thead");
            let theadtr = document.createElement("tr");
            let spacer = document.createElement("th");
            spacer.colSpan = 1;
            theadtr.appendChild(spacer);
            for (let ss of ALL_STATS) {
              let stat = document.createElement("th");
              stat.className = "apm";
              stat.textContent = ss.toUpperCase();
              theadtr.appendChild(stat);
            }
            let tdate = document.createElement("th");
            thead.appendChild(theadtr);
            table.appendChild(thead);

            let body = document.createElement("tbody");
            table.appendChild(body);
            let winnerName = name;
            let loserName = name;
            if (!game.win) {
              winnerName = match.opponent
            } else {
              loserName = match.opponent
            }
            let players = [];
            if (game.stats) {
              players.push({ name: winnerName, stats: game.stats });
            }
            if (game.altStats) {
              players.push({ name: loserName, stats: game.altStats });
            }
            for (let match of players) {
              let tr = document.createElement("tr");
              let p1 = document.createElement("td");
              p1.className = "pl1";
              var ap1 = document.createElement("a");
              ap1.textContent = match.name;
              ap1.href = `/u/${match.name}`;
              p1.appendChild(ap1);
              tr.appendChild(p1);
              if (match.stats) {
                let sstats = {};
                for (let ss of ALL_STATS) {
                  sstats[ss] = "-";
                }
                for (const [key, value] of Object.entries(match.stats)) {
                  if (isNaN(parseFloat(value)))
                    continue;
                  if (parseFloat(value) < 0)
                    continue;
                  if (sstats[key]) {
                    sstats[key] = value;
                  }
                }
                for (let ss of ALL_STATS) {
                  let stat = document.createElement("td");
                  stat.className = "apm";
                  stat.textContent = sstats[ss];
                  tr.appendChild(stat);
                }
              } else {
                for (let i = 0; i < ALL_STATS.length; i++) {
                  let stat = document.createElement("td");
                  stat.className = "apm";
                  stat.textContent = "-";
                  tr.appendChild(stat);
                }
              }

              body.appendChild(tr);
            }
          }

          modal.style.display = "block";
        }
        let ws = new WebSocket(HOST);
        //  console.log(dnielle)
        ws.onopen = function () {
          ws.send(JSON.stringify({ type: "init", name: name, version: JEAGUE_VERSION }));
          //ws.send(JSON.stringify({ type: "init", token: dnielle.token, version: JEAGUE_VERSION }));
        };
        let loaded = false;
        ws.onmessage = event => {
          let res = JSON.parse(event.data);
          if (res.type == "matches") {
            if (!loaded) {
              console.log(res)
              const ALL_STATS = ["apm", "pps", "cheese", "apd", "time"];
              //   console.log(res)
              let table = document.createElement("table");
              table.className = "table table-striped table-hover match-list";
              let thead = document.createElement("thead");
              let theadtr = document.createElement("tr");
              let spacer = document.createElement("th");
              spacer.colSpan = 3;
              theadtr.appendChild(spacer);
              for (let ss of ALL_STATS) {
                let stat = document.createElement("th");
                stat.className = "apm";
                stat.textContent = ss.toUpperCase();
                theadtr.appendChild(stat);
              }
              let tdate = document.createElement("th");
              tdate.className = "date";
              tdate.textContent = "Date";
              let tgames = document.createElement("th");
              tgames.className = "date";
              tgames.textContent = "Games";
              theadtr.appendChild(tdate);
              theadtr.appendChild(tgames);
              thead.appendChild(theadtr);
              table.appendChild(thead);

              let body = document.createElement("tbody");
              table.appendChild(body);
              for (let match of res.matches.reverse()) {
                let tr = document.createElement("tr");
                let p1 = document.createElement("td");
                p1.className = "pl1";
                var ap1 = document.createElement("a");
                ap1.textContent = name;
                ap1.href = `/u/${name}`;
                p1.appendChild(ap1);
                tr.appendChild(p1);
                let sc = document.createElement("td");
                sc.className = "sc";
                let sM = document.createElement("span");
                sM.style.color = "#04AA6D";
                sM.className = "scoreMiddle";
                if (match.forced) {
                  sM.textContent = "default";
                  if (!match.win) {
                    sM.textContent = "forfeit";
                    sM.style.color = "#A90441";
                  }
                } else {
                  let wins = 0
                  let losses = 0
                  for (let game of match.games) {
                    if (game.win) wins += 1
                    else losses += 1
                  }
                  sM.textContent = `${wins} - ${losses}`;
                  if (!match.win) {
                    sM.style.color = "#A90441";
                  }
                }
                sc.appendChild(sM);
                tr.appendChild(sc);
                let p2 = document.createElement("td");
                p2.className = "pl2";
                var ap2 = document.createElement("a");
                ap2.textContent = match.opponent;
                ap2.href = `/u/${match.opponent}`;
                p2.appendChild(ap2);
                tr.appendChild(p2);
                if (match.stats) {
                  let sstats = {};
                  for (let ss of ALL_STATS) {
                    sstats[ss] = "-";
                  }
                  for (const [key, value] of Object.entries(match.stats)) {
                    if (isNaN(parseFloat(value)))
                      continue;
                    if (parseFloat(value) < 0)
                      continue;
                    if (sstats[key]) {
                      sstats[key] = value;
                    }
                  }
                  for (let ss of ALL_STATS) {
                    let stat = document.createElement("td");
                    stat.className = "apm";
                    stat.textContent = sstats[ss];
                    tr.appendChild(stat);
                  }
                } else {
                  for (let i = 0; i < ALL_STATS.length; i++) {
                    let stat = document.createElement("td");
                    stat.className = "apm";
                    stat.textContent = "-";
                    tr.appendChild(stat);
                  }
                }
                let date = document.createElement("td");
                date.className = "date";
                date.textContent = new Date(match.date).toLocaleDateString();
                tr.appendChild(date);
                let btns = document.createElement("td");
                if (match.games && match.games.length > 0) {
                  btns.style.display = "flex";
                  btns.style.justifyContent = "flex-end";
                  if (match.games) {
                    for (let m of match.games) {
                      let btn = document.createElement("button");
                      btn.className = "mm-button";
                      btns.appendChild(btn);
                      if (!m.win) {
                        btn.style.backgroundColor = "#A90441";
                      }
                      btn.onclick = function () {
                        loadGame(m, match);
                      };
                    }
                  }
                } else {
                  btns.className = "apm";
                }
                tr.appendChild(btns);
                body.appendChild(tr);
              }
              matchView.appendChild(table);
              let opponentFilter = document.createElement("input")
              opponentFilter.type = "text"
              opponentFilter.name = "opponent"
              opponentFilter.className = "form-control"
              opponentFilter.placeholder = "Username"
              opponentFilter.autocomplete = "off"
              opponentFilter.style.padding = "10px"
              opponentFilter.multiple = true
              opponentFilter.onchange = (event) => {
                let raw_names = opponentFilter.value.split(" ")
                let names = []
                for (let name of raw_names) {
                  names.push(name.toLowerCase())
                }
                for (let i = 0; i < body.children.length; i++) {
                  let child = body.children[i]
                  for (let j = 0; j < child.children.length; j++) {
                    let child2 = child.children[j]
                    if (child2.className == "pl2") {
                      if (child2.firstChild && names.includes(child2.firstChild.textContent.toLowerCase())) child.style.display = ""
                      else { child.style.display = "none" }
                      break
                    }
                  }
                }
              }
              matchView.prepend(opponentFilter)
              cc.parentNode.prepend(matchView)
              cc.parentNode.prepend(collapsible)
            }
            loaded = true;
          }
        };
      }
      VERIFIED = true;
    });
    /*
    var jaliek = new XMLHttpRequest();
    let VERIFIED = false;
    jaliek.onreadystatechange = function () {
      if (4 === this.readyState && 200 === this.status) {
        var dnielle = JSON.parse(this.responseText);
        function parseJwt(token) {
          var base64Url = token.split(".")[1];
          var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          var jsonPayload = decodeURIComponent(window.atob(base64).split("").map(function (c) {
            return "%" + (
              "00" + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(""));

          return JSON.parse(jsonPayload);
        }
        let tt = parseJwt(dnielle.token);
        addMatchesBtn(tt.n)
        if (tt.n != decodeURI(urlParts[4])) return

        if (!VERIFIED) {

          let modal = document.createElement("div");
          let modalContent = document.createElement("div");
          let modalClose = document.createElement("span");
          let modalTable = document.createElement("table");
          modalClose.className = "mmClose";
          modalClose.textContent = "×";
          modalContent.appendChild(modalTable);
          modalContent.appendChild(modalClose);
          modal.className = "mmModal";
          modalContent.className = "mmModal-content";
          modal.append(modalContent);
          modalClose.onclick = function () {
            modal.style.display = "none";
          };

          modalTable.className = "table table-striped table-hover match-list";

          document.body.appendChild(modal);

          function loadGame(game, match) {
            const ALL_STATS = ["apm", "pps", "cheese", "apd", "time"];
            let table = modalContent.firstChild;
            while (table.firstChild) {
              table.removeChild(table.firstChild);
            }
            let aref = document.createElement("a");
            let apic = document.createElement("img");
            aref.style.position = "absolute";
            aref.style.left = "5px";
            aref.style.top = "5px";
            apic.src = "https://jstris.jezevec10.com/res/play.png";
            aref.appendChild(apic);
            aref.href = `/games/${game.gid}`;
            aref.target = "_blank";
            table.appendChild(aref);
            //   console.log(res)
            if (game.stats || game.altStats) {
              let thead = document.createElement("thead");
              let theadtr = document.createElement("tr");
              let spacer = document.createElement("th");
              spacer.colSpan = 1;
              theadtr.appendChild(spacer);
              for (let ss of ALL_STATS) {
                let stat = document.createElement("th");
                stat.className = "apm";
                stat.textContent = ss.toUpperCase();
                theadtr.appendChild(stat);
              }
              let tdate = document.createElement("th");
              thead.appendChild(theadtr);
              table.appendChild(thead);

              let body = document.createElement("tbody");
              table.appendChild(body);
              let winnerName = tt.n
              let loserName = tt.n
              if (!game.win) {
                winnerName = match.opponent
              } else {
                loserName = match.opponent
              }
              let players = [];
              if (game.stats) {
                players.push({ name: winnerName, stats: game.stats });
              }
              if (game.altStats) {
                players.push({ name: loserName, stats: game.altStats });
              }
              for (let match of players) {
                let tr = document.createElement("tr");
                let p1 = document.createElement("td");
                p1.className = "pl1";
                var ap1 = document.createElement("a");
                ap1.textContent = match.name;
                ap1.href = `/u/${match.name}`;
                p1.appendChild(ap1);
                tr.appendChild(p1);
                if (match.stats) {
                  let sstats = {};
                  for (let ss of ALL_STATS) {
                    sstats[ss] = "-";
                  }
                  for (const [key, value] of Object.entries(match.stats)) {
                    if (isNaN(parseFloat(value)))
                      continue;
                    if (parseFloat(value) < 0)
                      continue;
                    if (sstats[key]) {
                      sstats[key] = value;
                    }
                  }
                  for (let ss of ALL_STATS) {
                    let stat = document.createElement("td");
                    stat.className = "apm";
                    stat.textContent = sstats[ss];
                    tr.appendChild(stat);
                  }
                } else {
                  for (let i = 0; i < ALL_STATS.length; i++) {
                    let stat = document.createElement("td");
                    stat.className = "apm";
                    stat.textContent = "-";
                    tr.appendChild(stat);
                  }
                }

                body.appendChild(tr);
              }
            }

            modal.style.display = "block";
          }
          let ws = new WebSocket(HOST);
          //  console.log(dnielle)
          ws.onopen = function () {
            ws.send(JSON.stringify({ type: "init", name: name, version: JEAGUE_VERSION }));
            //ws.send(JSON.stringify({ type: "init", token: dnielle.token, version: JEAGUE_VERSION }));
          };
          let loaded = false;
          ws.onmessage = event => {
            let res = JSON.parse(event.data);
            if (res.type == "matches") {
              if (!loaded) {
                console.log(res)
                const ALL_STATS = ["apm", "pps", "cheese", "apd", "time"];
                //   console.log(res)
                let table = document.createElement("table");
                table.className = "table table-striped table-hover match-list";
                let thead = document.createElement("thead");
                let theadtr = document.createElement("tr");
                let spacer = document.createElement("th");
                spacer.colSpan = 3;
                theadtr.appendChild(spacer);
                for (let ss of ALL_STATS) {
                  let stat = document.createElement("th");
                  stat.className = "apm";
                  stat.textContent = ss.toUpperCase();
                  theadtr.appendChild(stat);
                }
                let tdate = document.createElement("th");
                tdate.className = "date";
                tdate.textContent = "Date";
                let tgames = document.createElement("th");
                tgames.className = "date";
                tgames.textContent = "Games";
                theadtr.appendChild(tdate);
                theadtr.appendChild(tgames);
                thead.appendChild(theadtr);
                table.appendChild(thead);

                let body = document.createElement("tbody");
                table.appendChild(body);
                for (let match of res.matches.reverse()) {
                  let tr = document.createElement("tr");
                  let p1 = document.createElement("td");
                  p1.className = "pl1";
                  var ap1 = document.createElement("a");
                  ap1.textContent = tt.n;
                  ap1.href = `/u/${tt.n}`;
                  p1.appendChild(ap1);
                  tr.appendChild(p1);
                  let sc = document.createElement("td");
                  sc.className = "sc";
                  let sM = document.createElement("span");
                  sM.style.color = "#04AA6D";
                  sM.className = "scoreMiddle";
                  if (match.forced) {
                    sM.textContent = "default";
                    if (!match.win) {
                      sM.textContent = "forfeit";
                      sM.style.color = "#A90441";
                    }
                  } else {
                    let wins = 0
                    let losses = 0
                    for (let game of match.games) {
                      if (game.win) wins += 1
                      else losses += 1
                    }
                    sM.textContent = `${wins} - ${losses}`;
                    if (!match.win) {
                      sM.style.color = "#A90441";
                    }
                  }
                  sc.appendChild(sM);
                  tr.appendChild(sc);
                  let p2 = document.createElement("td");
                  p2.className = "pl2";
                  var ap2 = document.createElement("a");
                  ap2.textContent = match.opponent;
                  ap2.href = `/u/${match.opponent}`;
                  p2.appendChild(ap2);
                  tr.appendChild(p2);
                  if (match.stats) {
                    let sstats = {};
                    for (let ss of ALL_STATS) {
                      sstats[ss] = "-";
                    }
                    for (const [key, value] of Object.entries(match.stats)) {
                      if (isNaN(parseFloat(value)))
                        continue;
                      if (parseFloat(value) < 0)
                        continue;
                      if (sstats[key]) {
                        sstats[key] = value;
                      }
                    }
                    for (let ss of ALL_STATS) {
                      let stat = document.createElement("td");
                      stat.className = "apm";
                      stat.textContent = sstats[ss];
                      tr.appendChild(stat);
                    }
                  } else {
                    for (let i = 0; i < ALL_STATS.length; i++) {
                      let stat = document.createElement("td");
                      stat.className = "apm";
                      stat.textContent = "-";
                      tr.appendChild(stat);
                    }
                  }
                  let date = document.createElement("td");
                  date.className = "date";
                  date.textContent = new Date(match.date).toLocaleDateString();
                  tr.appendChild(date);
                  let btns = document.createElement("td");
                  if (match.games && match.games.length > 0) {
                    btns.style.display = "flex";
                    btns.style.justifyContent = "flex-end";
                    if (match.games) {
                      for (let m of match.games) {
                        let btn = document.createElement("button");
                        btn.className = "mm-button";
                        btns.appendChild(btn);
                        if (!m.win) {
                          btn.style.backgroundColor = "#A90441";
                        }
                        btn.onclick = function () {
                          loadGame(m, match);
                        };
                      }
                    }
                  } else {
                    btns.className = "apm";
                  }
                  tr.appendChild(btns);
                  body.appendChild(tr);
                }
                matchView.appendChild(table);
                let opponentFilter = document.createElement("input")
                opponentFilter.type = "text"
                opponentFilter.name = "opponent"
                opponentFilter.className = "form-control"
                opponentFilter.placeholder = "Username"
                opponentFilter.autocomplete = "off"
                opponentFilter.style.padding = "10px"
                opponentFilter.multiple = true
                opponentFilter.onchange = (event) => {
                  let raw_names = opponentFilter.value.split(" ")
                  let names = []
                  for (let name of raw_names) {
                    names.push(name.toLowerCase())
                  }
                  for (let i = 0; i < body.children.length; i++) {
                    let child = body.children[i]
                    for (let j = 0; j < child.children.length; j++) {
                      let child2 = child.children[j]
                      if (child2.className == "pl2") {
                        if (child2.firstChild && names.includes(child2.firstChild.textContent.toLowerCase())) child.style.display = ""
                        else { child.style.display = "none" }
                        break
                      }
                    }
                  }
                }
                matchView.prepend(opponentFilter)
                cc.parentNode.prepend(matchView)
                cc.parentNode.prepend(collapsible)
              }
              loaded = true;
            }
          };
        }
        VERIFIED = true;
      }
    };
    jaliek.open("GET", "/token", true);
    jaliek.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    jaliek.send();
    */
  }
  //})
};
;// CONCATENATED MODULE: ./src/toggleChatKeyInput.js


const TOGGLE_CHAT_KEY_INPUT_ELEMENT = document.createElement("div");
TOGGLE_CHAT_KEY_INPUT_ELEMENT.className = "settings-inputRow";
TOGGLE_CHAT_KEY_INPUT_ELEMENT.innerHTML += "<b>Toggle chat with this button</b>"

const inputDiv = document.createElement("div");
const input = document.createElement("input");
input.value = displayKeyCode(Config().TOGGLE_CHAT_KEYCODE);
input.id = "TOGGLE_CHAT_KEY_INPUT_ELEMENT";

input.addEventListener("keydown", e => {
  var charCode = (e.which) ? e.which : e.keyCode
  Config().set("TOGGLE_CHAT_KEYCODE", charCode);
  input.value = displayKeyCode(charCode);
  e.stopPropagation();
  e.preventDefault();
  return false;
});
input.addEventListener("keypress", () => false);
const clearBtn = document.createElement("button");
clearBtn.addEventListener("click", e => {
  Config().set("TOGGLE_CHAT_KEYCODE", null);
  input.value = displayKeyCode(null);
})
clearBtn.innerHTML = "Clear";

input.style.marginRight = "5px";
inputDiv.style.display = "flex";
inputDiv.appendChild(input);
inputDiv.appendChild(clearBtn);
TOGGLE_CHAT_KEY_INPUT_ELEMENT.appendChild(inputDiv);

// stolen from https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
function displayKeyCode(charCode) {
  
  if (charCode == null) {
    return "<enter a key>";
  }

  let a = String.fromCharCode(charCode);
  if (charCode == 8) a = "backspace"; //  backspace
  if (charCode == 9) a = "tab"; //  tab
  if (charCode == 13) a = "enter"; //  enter
  if (charCode == 16) a = "shift"; //  shift
  if (charCode == 17) a = "ctrl"; //  ctrl
  if (charCode == 18) a = "alt"; //  alt
  if (charCode == 19) a = "pause/break"; //  pause/break
  if (charCode == 20) a = "caps lock"; //  caps lock
  if (charCode == 27) a = "escape"; //  escape
  if (charCode == 32) a = "space"; // space
  if (charCode == 33) a = "page up"; // page up, to avoid displaying alternate character and confusing people	         
  if (charCode == 34) a = "page down"; // page down
  if (charCode == 35) a = "end"; // end
  if (charCode == 36) a = "home"; // home
  if (charCode == 37) a = "left arrow"; // left arrow
  if (charCode == 38) a = "up arrow"; // up arrow
  if (charCode == 39) a = "right arrow"; // right arrow
  if (charCode == 40) a = "down arrow"; // down arrow
  if (charCode == 45) a = "insert"; // insert
  if (charCode == 46) a = "delete"; // delete
  if (charCode == 91) a = "left window"; // left window
  if (charCode == 92) a = "right window"; // right window
  if (charCode == 93) a = "select key"; // select key
  if (charCode == 96) a = "numpad 0"; // numpad 0
  if (charCode == 97) a = "numpad 1"; // numpad 1
  if (charCode == 98) a = "numpad 2"; // numpad 2
  if (charCode == 99) a = "numpad 3"; // numpad 3
  if (charCode == 100) a = "numpad 4"; // numpad 4
  if (charCode == 101) a = "numpad 5"; // numpad 5
  if (charCode == 102) a = "numpad 6"; // numpad 6
  if (charCode == 103) a = "numpad 7"; // numpad 7
  if (charCode == 104) a = "numpad 8"; // numpad 8
  if (charCode == 105) a = "numpad 9"; // numpad 9
  if (charCode == 106) a = "multiply"; // multiply
  if (charCode == 107) a = "add"; // add
  if (charCode == 109) a = "subtract"; // subtract
  if (charCode == 110) a = "decimal point"; // decimal point
  if (charCode == 111) a = "divide"; // divide
  if (charCode == 112) a = "F1"; // F1
  if (charCode == 113) a = "F2"; // F2
  if (charCode == 114) a = "F3"; // F3
  if (charCode == 115) a = "F4"; // F4
  if (charCode == 116) a = "F5"; // F5
  if (charCode == 117) a = "F6"; // F6
  if (charCode == 118) a = "F7"; // F7
  if (charCode == 119) a = "F8"; // F8
  if (charCode == 120) a = "F9"; // F9
  if (charCode == 121) a = "F10"; // F10
  if (charCode == 122) a = "F11"; // F11
  if (charCode == 123) a = "F12"; // F12
  if (charCode == 144) a = "num lock"; // num lock
  if (charCode == 145) a = "scroll lock"; // scroll lock
  if (charCode == 186) a = ";"; // semi-colon
  if (charCode == 187) a = "="; // equal-sign
  if (charCode == 188) a = ","; // comma
  if (charCode == 189) a = "-"; // dash
  if (charCode == 190) a = "."; // period
  if (charCode == 191) a = "/"; // forward slash
  if (charCode == 192) a = "`"; // grave accent
  if (charCode == 219) a = "["; // open bracket
  if (charCode == 220) a = "\\"; // back slash
  if (charCode == 221) a = "]"; // close bracket
  if (charCode == 222) a = "'"; // single quote
  return a;
}

;// CONCATENATED MODULE: ./src/chat.js





let game = null;

const initChat = () => {
  'use strict';

  // === show or hide chat timestamps code ===
  // showing timestamp logic is in css
  if (Config().ENABLE_CHAT_TIMESTAMPS)
    document.body.classList.add("show-chat-timestamps");
  Config().onChange("ENABLE_CHAT_TIMESTAMPS", val => {
    if (val) {
      document.body.classList.add("show-chat-timestamps");
    } else {
      document.body.classList.remove("show-chat-timestamps");
    }
  })

  const oldReadyGo = Game.prototype.readyGo;
  Game.prototype.readyGo = function() {
    game = this;
    return oldReadyGo.apply(this, arguments);
  }

  // === toggle chat button code ===

  document.getElementById("TOGGLE_CHAT_KEY_INPUT_ELEMENT").value = displayKeyCode(Config().TOGGLE_CHAT_KEYCODE);

  // thanks justin https://greasyfork.org/en/scripts/423192-change-chat-key
  document.addEventListener("keydown", e => {
    var charCode = (e.which) ? e.which : e.keyCode
    if (charCode == Config().TOGGLE_CHAT_KEYCODE) {
        console.log("yah");
        if (game && game.focusState !== 1) { // game already focused, unfocus
          game.setFocusState(1);
          setTimeout(function() {game.Live.chatInput.focus()}, 0) // setTimeout to prevent the key from being typed
        } else { // focus game
          console.log("yah")
          document.getElementsByClassName("layer mainLayer gfxLayer")[0].click();
          document.getElementsByClassName("layer mainLayer gfxLayer")[0].focus();
        }
        
    }
  });

  // === emote code ===

  let CUSTOM_EMOTES = [
    {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/Cheese.png",
      t: "qep",
      g: "Jstris+",
      n: "MrCheese"
    }, {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/Cat.png",
      t: "jermy",
      g: "Jstris+",
      n: "CatUp"
    }, {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/Freg.png",
      t: "frog",
      g: "Jstris+",
      n: "FrogSad"
    }, {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/freycat.webp",
      t: "frey",
      g: "Jstris+",
      n: "freycat"
    }, {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/Blahaj.png",
      t: "jermy",
      g: "Jstris+",
      n: "StarHaj"
    }
    , {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/ThisIsFine.png",
      t: "jermy",
      g: "Jstris+",
      n: "fine"
    }
  ]
  let chatListener = Live.prototype.showInChat
  Live.prototype.showInChat = function () {
    let zandria = arguments[1]

    if (typeof zandria == "string") {
      zandria = zandria.replace(/:(.*?):/g, function (match) {
        let cEmote = null
        for (let emote of CUSTOM_EMOTES) {
          if (emote.n == match.split(':')[1]) {
            cEmote = emote
            break
          }
        }
        if (cEmote) {
          return `<img src='${cEmote.u}' class='emojiPlus' alt=':${cEmote.n}:'>`
        }
        return match
      });
    }
    arguments[1] = zandria
    let val = chatListener.apply(this, arguments)
    // Add Timestamps
    var s = document.createElement("span");
    s.className = 'chat-timestamp';
    s.innerHTML = "[" + new Date().toTimeString().slice(0, 8) + "] ";
    var c = document.getElementsByClassName("chl");
    c[c.length - 1].prepend(s);

    return val
  }
  ChatAutocomplete.prototype.loadEmotesIndex = function (_0xd06fx4) {
    if (!this.moreEmotesAdded) {
      var brentson = new XMLHttpRequest,
        terrilynne = "/code/emotes?";
      brentson.timeout = 8e3,
        brentson.open("GET", terrilynne, true);
      try {
        brentson.send();
      } catch (bleu) { };
      var areeg = this;
      brentson.ontimeout = function () { },
        brentson.onerror = brentson.onabort = function () { },
        brentson.onload = function () {
          if (200 === brentson.status) {
            let zakeriah = JSON.parse(brentson.responseText);
            for (let emote of CUSTOM_EMOTES) {
              zakeriah.unshift(emote)
            }
            null !== areeg.preProcessEmotes && (zakeriah = areeg.preProcessEmotes(zakeriah)),
              areeg.addEmotes(zakeriah),
              null !== areeg.onEmoteObjectReady && areeg.onEmoteObjectReady(zakeriah);
          }
        };
    }
  }
  EmoteSelect.prototype.initializeContainers = function () {
    console.log(this.groupEmotes["Jstris+"] = "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/freycat.webp")
    this.searchElem = document.createElement("form"), this.searchElem.classList.add("form-inline", "emoteForm"), this.emoteElem.appendChild(this.searchElem), this.searchBar = document.createElement("input"), this.searchBar.setAttribute("autocomplete", "off"), this.searchBar.classList.add("form-control"), this.searchBar.id = "emoteSearch", this.searchBar.addEventListener("input", () => {
      this.searchFunction(this.emoteList);
    }), this.searchElem.addEventListener("submit", kesean => {
      kesean.preventDefault();
    }), this.searchBar.setAttribute("type", "text"), this.searchBar.setAttribute("placeholder", "Search Emotes"), this.searchElem.appendChild(this.searchBar), this.optionsContainer = document.createElement("div"), this.optionsContainer.classList.add("optionsContainer"), this.emoteElem.appendChild(this.optionsContainer), this.emotesWrapper = document.createElement("div"), this.emotesWrapper.classList.add("emotesWrapper"), this.optionsContainer.appendChild(this.emotesWrapper);
  }
  ChatAutocomplete.prototype.processHint = function (ylario) {

    var maizah = ylario[0].toLowerCase(),
      cahlin = ylario[1];
    if ("" !== this.prfx && (null === maizah || maizah.length < this.minimalLengthForHint || maizah[0] !== this.prfx)) {
      hideElem(this.hintsElem);
    } else {
      bertile = bertile;
      var maiesha = maizah.substring(this.prfx.length),
        bertile = this.prefixInSearch
          ? maizah
          : maiesha,
        cinque = 0,
        dyllan = "function" == typeof this.hints
          ? this.hints()
          : this.hints;
      this.hintsElem.innerHTML = "";
      var roey = [],
        tishie = [];
      for (var cedrik in dyllan) {
        var catenia = (shawnteria = dyllan[cedrik]).toLowerCase();
        catenia.startsWith(bertile)
          ? roey.push(shawnteria)
          : maiesha.length >= 2 && catenia.includes(maiesha) && tishie.push(shawnteria);
      };
      if (roey.sort(), roey.length < this.maxPerHint) {
        tishie.sort();
        for (const ajitesh of tishie) {
          if (-1 === roey.indexOf(ajitesh) && (roey.push(ajitesh), roey.length >= this.maxPerHint)) {
            break;
          }
        }
      };
      for (var shawnteria of roey) {
        var vidhu = document.createElement("div");
        if (this.hintsImg && this.hintsImg[shawnteria]) {
          vidhu.className = "emHint";
          var cebria = document.createElement("img");
          let cEmote = null
          for (let emote of CUSTOM_EMOTES) {
            if (emote.n == shawnteria.split(':')[1]) {
              cEmote = emote
              break
            }
          }
          if (cEmote) {
            cebria.src = cEmote.u
          } else {
            cebria.src = CDN_URL("/" + this.hintsImg[shawnteria])
          }
          vidhu.appendChild(cebria);
          var wael = document.createElement("div");
          wael.textContent = shawnteria,
            vidhu.appendChild(wael);
        } else {
          vidhu.innerHTML = shawnteria;
        };
        vidhu.dataset.pos = cahlin,
          vidhu.dataset.str = shawnteria;
        var yolandi = this;
        if (vidhu.addEventListener("click", function (dennies) {
          for (var ajane = yolandi.inp.value, delanei = parseInt(this.dataset.pos), xila = ajane.substring(0, delanei), neng = xila.indexOf(" "), marshelia = neng + 1; -1 !== neng;) {
            -1 !== (neng = xila.indexOf(" ", neng + 1)) && (marshelia = neng + 1);
          };
          yolandi.prefixInSearch || ++marshelia,
            yolandi.inp.value = ajane.substring(0, marshelia) + this.dataset.str + " " + ajane.substring(delanei),
            yolandi.inp.focus(),
            yolandi.setCaretPosition(delanei + this.dataset.str.length + 1 - (delanei - marshelia)),
            hideElem(yolandi.hintsElem),
            yolandi.wipePrevious && (yolandi.inp.value = this.dataset.str, yolandi.onWiped && yolandi.onWiped(this.dataset.str));
        }, false), this.hintsElem.appendChild(vidhu), ++cinque >= this.maxPerHint) {
          break;
        }
      };
      this.setSelected(0),
        cinque
          ? showElem(this.hintsElem)
          : hideElem(this.hintsElem);
    }
  }
  console.log("JSTRIS+ EMOTES LOADED")
}

;// CONCATENATED MODULE: ./src/style.css
/* harmony default export */ const style = ("@import url('https://fonts.googleapis.com/css2?family=Gugi&display=swap');\n\n/* =========== settings modal css ============= */\n\n.settings-modal {\n  display: none;\n  /* Hidden by default */\n  position: fixed;\n  /* Stay in place */\n  z-index: 99999;\n  /* Sit on top */\n  left: 0;\n  top: 0;\n  width: 100%;\n  /* Full width */\n  height: 100%;\n  /* Full height */\n  overflow: auto;\n  /* Enable scroll if needed */\n  background-color: rgb(0, 0, 0);\n  /* Fallback color */\n  background-color: rgba(0, 0, 0, 0.4);\n  /* Black w/ opacity */\n  -webkit-animation-name: fadeIn;\n  /* Fade in the background */\n  -webkit-animation-duration: 0.4s;\n  animation-name: fadeIn;\n  animation-duration: 0.4s;\n}\n\n.settings-modalCheckbox {\n  width: 30px;\n  height: 30px;\n}\n\n.settings-text {\n  text-align: center;\n}\n\n.settings-modalTextbox {\n  height: 30px;\n  font-size: 25px;\n  border: solid 1px black;\n\n}\n\n.settings-modalTextarea {\n  height: 60px;\n  border: solid 1px black;\n  resize: none;\n}\n\n.settings-modalContentTitle {\n  text-align: left;\n  width: 60%;\n  min-width: 300px;\n  margin: auto;\n  padding: 20px;\n}\n\n.settings-inputRow {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  width: 60%;\n  min-width: 300px;\n  margin: auto;\n  padding: 10px;\n  border-bottom: solid 1px #2c2c2c;\n  position: relative;\n}\n\n.settings-inputRow select {\n  color: black;\n}\n\n.settings-modalOpenButton {\n  width: 40px;\n  height: 40px;\n  cursor: pointer;\n  border-radius: 10px;\n  position: fixed;\n  left: 30px;\n  bottom: 30px;\n\n  transition: 0.5s;\n\n}\n\n.settings-modalCloseButton {\n  width: 30px;\n  height: 30px;\n  cursor: pointer;\n  transition: 0.5s;\n  position: absolute;\n  right: 12px;\n  top: 12px;\n}\n\n.settings-modalOpenButton:hover {\n  transform: rotate (-360deg);\n  opacity: 0.3;\n}\n\n.settings-modalClosebutton:hover {\n  opacity: 0.3;\n}\n\n/* Modal Content */\n.settings-modal-content {\n  position: fixed;\n  bottom: 0;\n  background-color: #fefefe;\n  width: 100%;\n  height: 75vh;\n  -webkit-animation-name: slideIn;\n  -webkit-animation-duration: 0.4s;\n  animation-name: slideIn;\n  display: flex;\n  flex-direction: column;\n  animation-duration: 0.4s;\n}\n\n.settings-modal-header {\n  padding: 16px;\n  background-color: #5cb85c;\n  color: white;\n  text-align: center;\n  position: relative;\n}\n\n.settings-modal-header h2 {\n  line-height: 16px;\n  margin-top: 3px;\n  margin-bottom: 3px;\n}\n\n.settings-modal-body {\n  padding: 2px 16px;\n  color: black;\n  flex: 1;\n  overflow-y: scroll;\n  background-color: #1c1c1c;\n  color: white;\n}\n\n.settings-modal-footer {\n  padding: 2px 16px;\n  background-color: #5cb85c;\n  color: white;\n}\n\n.settings-sliderValue {\n  position: absolute;\n  font-size: 18px;\n  right: 330px;\n}\n\n.settings-slider {\n  -webkit-appearance: none;\n  max-width: 300px;\n  height: 15px;\n  border-radius: 5px;\n  background: #d3d3d3;\n  outline: none;\n  opacity: 0.7;\n  -webkit-transition: .2s;\n  transition: opacity .2s;\n}\n\n.settings-slider:hover {\n  opacity: 1;\n}\n\n.settings-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 25px;\n  height: 25px;\n  border-radius: 50%;\n  background: #04AA6D;\n  cursor: pointer;\n}\n\n.settings-slider::-moz-range-thumb {\n  width: 25px;\n  height: 25px;\n  border-radius: 50%;\n  background: #04AA6D;\n  cursor: pointer;\n}\n\n/* Add Animation */\n@-webkit-keyframes slideIn {\n  from {\n    bottom: -300px;\n    opacity: 0\n  }\n\n  to {\n    bottom: 0;\n    opacity: 1\n  }\n}\n\n@keyframes slideIn {\n  from {\n    bottom: -300px;\n    opacity: 0\n  }\n\n  to {\n    bottom: 0;\n    opacity: 1\n  }\n}\n\n@-webkit-keyframes fadeIn {\n  from {\n    opacity: 0\n  }\n\n  to {\n    opacity: 1\n  }\n}\n\n@keyframes fadeIn {\n  from {\n    opacity: 0\n  }\n\n  to {\n    opacity: 1\n  }\n}\n\n/* =========== matchmaking css ============= */\n.mmMatches {\n  padding: 0 18px;\n  display: none;\n  overflow: hidden;\n}\n\n.mmCollapsible {\n  background-color: #464444;\n  color: white;\n  cursor: pointer;\n  padding: 18px;\n  width: 100%;\n  border: none;\n  text-align: left;\n  outline: none;\n  font-size: 16px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.mmCollapsible:hover {\n  background-color: #7b7575;\n}\n\n.mmContainer {\n  display: flex;\n  flex-direction: row;\n  z-index: 50;\n  color: white;\n  position: absolute;\n  left: 100px;\n  bottom: 30px;\n  color: #999;\n  width: 200px;\n  position: fixed;\n}\n\n.mmInfoContainer {\n  height: 40px;\n  flex-direction: column;\n  justify-content: center;\n  min-width: 150px;\n  align-items: center;\n  white-space: pre;\n  display: none;\n  /* hide unless show-queue-info */\n}\n\n.show-queue-info .mmInfoContainer {\n  display: flex !important;\n}\n\n.mmButton {\n  color: white;\n  height: 40px;\n  border: 2px solid white;\n  border-radius: 10px;\n  background-color: transparent;\n  min-width: 200px;\n  display: none;\n}\n\n.show-mm-button .mmButton {\n  display: block !important;\n}\n\n.mmModal {\n  display: none;\n  /* Hidden by default */\n  position: fixed;\n  /* Stay in place */\n  z-index: 1;\n  /* Sit on top */\n  padding-top: 100px;\n  /* Location of the box */\n  left: 0;\n  top: 0;\n  width: 100%;\n  /* Full width */\n  height: 100%;\n  /* Full height */\n  overflow: auto;\n  /* Enable scroll if needed */\n  background-color: rgb(0, 0, 0);\n  /* Fallback color */\n  background-color: rgba(0, 0, 0, 0.4);\n  /* Black w/ opacity */\n}\n\n/* Modal Content */\n.mmModal-content {\n  background-color: #fefefe;\n  margin: auto;\n  padding: 20px;\n  border: 1px solid #888;\n  width: 40%;\n  height: 40%;\n  background-color: #343837;\n  position: relative;\n}\n\n/* The Close Button */\n.mmClose {\n  position: absolute;\n  top: 0px;\n  right: 5px;\n  color: #aaaaaa;\n  font-size: 30px;\n  font-weight: bold;\n}\n\n.mmClose:hover,\n.mmClose:focus {\n  color: #000;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.mm-button {\n  border: none;\n  color: white;\n  padding: 10px;\n  text-align: center;\n  text-decoration: none;\n  display: inline-block;\n  font-size: 0px;\n  margin: 2px 2px;\n  border-radius: 100%;\n  border: 2px solid #222222;\n  background-color: #04AA6D;\n}\n\n.mm-button:hover {\n  border: 2px solid white;\n}\n\n.mm-chat-buttons-container {\n  position: sticky;\n  height: 45px;\n}\n\n.mm-ready-button {\n  border: none;\n  color: white;\n  padding: 10px;\n  text-align: center;\n  text-decoration: none;\n  margin: 2px 2px;\n  border: 2px solid #222222;\n  background-color: #04AA6D;\n}\n\n.mm-ready-button:hover {\n  border: 2px solid white;\n}\n\n/* =========== action text css ============= */\n\n.action-text {\n  transition: 1s;\n  /*font-family: 'Gugi', sans-serif;*/\n  -webkit-animation-name: bounce;\n  /* Fade in the background */\n  -webkit-animation-duration: 0.4s;\n  animation-name: action-text;\n  animation-duration: 0.4s;\n  animation-fill-mode: forwards;\n}\n\n@keyframes action-text {\n  0% {\n    transform: translateY(0);\n  }\n\n  30% {\n    transform: translateY(-3px);\n  }\n\n  100% {\n    transform: translateY(0);\n  }\n}\n\n/* Chat timestamp showing logic */\n\n.chat-timestamp {\n  display: none;\n  color: grey;\n}\n\n.show-chat-timestamps .chat-timestamp {\n  display: inline !important;\n}\n\n\n/* ===== stats css ===== */\n\n.stats-table {\n  z-index: 10;\n  color: white;\n  position: absolute;\n  left: -210px;\n  bottom: 40px;\n  color: #999;\n  width: 200px;\n}\n\n/* ===== kbd display css ===== */\n\n#keyboardHolder {\n  position: absolute;\n  left: -350px;\n  top: 100px;\n  transform-origin: top right;\n}\n\n@media screen and (max-width: 1425px) {\n  #keyboardHolder {\n    transform: scale(75%);\n    left: -262px;\n  }\n\n  #kps {\n    font-size: 27px !important;\n  }\n}\n\n@media screen and (max-width: 1260px) {\n  #keyboardHolder {\n    transform: scale(50%);\n    left: -200px;\n  }\n\n  #kps {\n    font-size: 40px !important;\n  }\n}\n\n@media screen and (max-width: 900px) {\n  #keyboardHolder {\n    transform: scale(50%);\n    left: 250px;\n    top: 500px;\n  }\n\n  #kps {\n    font-size: 40px !important;\n  }\n}\n\n#kbo {\n  text-align: center;\n  position: absolute;\n  font-size: 15px;\n}\n\n#kps {\n  margin-bottom: 10px;\n  font-size: 20px;\n}\n\n#kbo .tg {\n  border-collapse: collapse;\n  border-spacing: 0;\n  color: rgba(255, 60, 109);\n}\n\n#kbo .tg td {\n  padding: 10px 5px;\n  border-style: solid;\n  border-width: 2px;\n  transition: 0.1s;\n}\n\n#kbo .tg th {\n  padding: 10px 5px;\n  border-style: solid;\n  border-width: 2px;\n}\n\n#kbo .tg .kbnone {\n  border-color: #000000;\n  border: inherit;\n}\n\n#kbo .tg .kbkey {\n  border-color: rgba(130, 220, 94, 1);\n  background-color: black;\n}\n\n.hide-kbd-display {\n  display: none;\n}\n\n.really-hide-kbd-display {\n  /* for when keyboard display really should not be shown, like 1v1 replays (for now) */\n  display: none !important;\n}\n\n/* custom emoji */\n\n.emojiPlus {\n  height: 3em;\n  pointer-events: none;\n}");
;// CONCATENATED MODULE: ./src/customSkinPresets.js



const FETCH_URL = "https://raw.githubusercontent.com/freyhoe/Jstris-/main/presets/skinPresets.json";
let CUSTOM_SKIN_PRESETS = [];
const fetchSkinPresets = () => {
  fetch(FETCH_URL, { cache: "reload" })
  .then(e => e.json())
  .then(j => {
    CUSTOM_SKIN_PRESETS = j;
    for (let i of CUSTOM_SKIN_PRESETS) {
      let option = document.createElement("option");
      option.value = JSON.stringify(i);
      option.innerHTML = i.name;
      dropdown.appendChild(option);
    }
  })
}


const CUSTOM_SKIN_PRESET_ELEMENT = document.createElement("div");
CUSTOM_SKIN_PRESET_ELEMENT.className = "settings-inputRow";
CUSTOM_SKIN_PRESET_ELEMENT.innerHTML += "<b>Custom skin presets</b>"

const dropdown = document.createElement("select");
dropdown.innerHTML += "<option>Select...</option>";

dropdown.addEventListener("change", () => {
  var { url, ghostUrl } = JSON.parse(dropdown.value);
  
  document.getElementById("CUSTOM_SKIN_URL").value = url || "";
  Config().set("CUSTOM_SKIN_URL", url || "");
  document.getElementById("CUSTOM_GHOST_SKIN_URL").value = ghostUrl || "";
  Config().set("CUSTOM_GHOST_SKIN_URL", ghostUrl || "");
  dropdown.selectedIndex = 0;
})

CUSTOM_SKIN_PRESET_ELEMENT.appendChild(dropdown);
;// CONCATENATED MODULE: ./src/customSoundPresets.js


const customSoundPresets_FETCH_URL = "https://raw.githubusercontent.com/freyhoe/Jstris-/main/presets/soundPresets.json"

let CUSTOM_SOUND_PRESETS = [];
const fetchSoundPresets = () => {
  fetch(customSoundPresets_FETCH_URL, { cache: "reload" })
  .then(e => e.json())
  .then(j => {
    CUSTOM_SOUND_PRESETS = j;
    for (let i of CUSTOM_SOUND_PRESETS) {
      let option = document.createElement("option");
      option.value = JSON.stringify(i);
      option.innerHTML = i.name;
      customSoundPresets_dropdown.appendChild(option);
    }
  })
}

const CUSTOM_SOUND_PRESET_ELEMENT = document.createElement("div");
CUSTOM_SOUND_PRESET_ELEMENT.className = "settings-inputRow";
CUSTOM_SOUND_PRESET_ELEMENT.innerHTML += "<b>Custom sound presets</b>"


const customSoundPresets_dropdown = document.createElement("select");
customSoundPresets_dropdown.innerHTML += "<option>Select...</option>";

customSoundPresets_dropdown.addEventListener("change", () => {
  document.getElementById("CUSTOM_SFX_JSON").value = customSoundPresets_dropdown.value;
  Config().set("CUSTOM_SFX_JSON", customSoundPresets_dropdown.value);

  customSoundPresets_dropdown.selectedIndex = 0;
})

CUSTOM_SOUND_PRESET_ELEMENT.appendChild(customSoundPresets_dropdown);


;// CONCATENATED MODULE: ./src/settingsModal.js





const createTitle = (text, style) => {
  var modalBody = document.getElementById("settingsBody");
  var p = document.createElement("h3");
  p.className = "settings-modalContentTitle";
  p.textContent = text;
  if (style)
    for (var i in style)
      p.style[i] = style[i];
  modalBody.appendChild(p);
}

const createCheckbox = (varName, displayName) => {
  var modalBody = document.getElementById("settingsBody");
  var box = document.createElement("input")
  box.type = "checkbox"
  box.id = varName;
  box.checked = Config()[varName];
  box.className = "settings-modalCheckbox";
  box.addEventListener("change", () => {
    Config().set(varName, box.checked);
  });
  var label = document.createElement("label");
  label.htmlFor = varName;
  label.innerHTML = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(label);
  div.appendChild(box);

  modalBody.appendChild(div);

}

const createTextInput = (varName, displayName) => {
  var modalBody = document.getElementById("settingsBody");
  var box = document.createElement("input")
  box.type = "text"
  box.id = varName;
  box.value = Config()[varName];
  box.className = "settings-modalTextbox";
  box.addEventListener("change", () => {
    Config().set(varName, box.value);
  });
  var label = document.createElement("label");
  label.htmlFor = varName;
  label.innerHTML = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(label);
  div.appendChild(box);

  modalBody.appendChild(div);

}

const createResetButton = (toReset, displayName) => {
  let vars = toReset;
  if (!Array.isArray(toReset))
    vars = [toReset];
  var modalBody = document.getElementById("settingsBody");
  var button = document.createElement("button")
  button.addEventListener("click", () => {
    vars.forEach((varName) => {
      Config().reset(varName);
      let el = document.getElementById(varName);
      if (el.type == "checkbox") {
        el.checked = Config()[varName];
      } else {
        el.value = Config()[varName];
      }
      el.dispatchEvent(new Event('change', { value: el.value }));
    });
  });
  button.textContent = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(button);

  modalBody.appendChild(div);

}

const createTextArea = (varName, displayName) => {
  var modalBody = document.getElementById("settingsBody");
  var box = document.createElement("textarea")
  box.id = varName;
  box.value = Config()[varName];
  box.className = "settings-modalTextarea";
  box.addEventListener("change", () => {
    Config().set(varName, box.value);
  });
  var label = document.createElement("label");
  label.htmlFor = varName;
  label.innerHTML = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(label);
  div.appendChild(box);

  modalBody.appendChild(div);

}


const createHTML = (ele) => {
  var modalBody = document.getElementById("settingsBody");
  var p = document.createElement("div");
  if (typeof ele == "string")
    p.innerHTML = ele;
  else
    p.appendChild(ele);
  modalBody.appendChild(p);
}

const createSliderInput = (varName, displayName, min = 0, max = 1, step = 0.05) => {
  var modalBody = document.getElementById("settingsBody");
  var slider = document.createElement("input")
  slider.type = "range"
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.id = varName;
  slider.value = Config()[varName];
  slider.className = "settings-slider";
  var valueLabel = document.createElement("span");
  valueLabel.className = "settings-sliderValue"
  slider.addEventListener("change", () => {
    Config().set(varName, slider.value);
    valueLabel.innerHTML = Number.parseFloat(slider.value).toFixed(2);
  });
  valueLabel.innerHTML = Number.parseFloat(Config()[varName]).toFixed(2);

  var label = document.createElement("label");
  label.htmlFor = varName;
  label.innerHTML = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(label);
  div.appendChild(slider);
  div.appendChild(valueLabel);

  modalBody.appendChild(div);

}

const generateBody = () => {
  createHTML(`<a href="http://jeague.tali.software" class='settings-text'>About Jstris+</a>`)
  createTitle("Visual settings");
  createCheckbox("ENABLE_PLACE_BLOCK_ANIMATION", "Enable place block animation");
  createSliderInput("PIECE_FLASH_LENGTH", "Length of place block animation");
  createSliderInput("PIECE_FLASH_OPACITY", "Initial opacity of place block animation");
  createCheckbox("ENABLE_LINECLEAR_ANIMATION", "Enable line clear animations");
  createSliderInput("LINE_CLEAR_LENGTH", "Length of line clear animation", 0, 2);
  createCheckbox("ENABLE_LINECLEAR_SHAKE", "Enable shake on line clear");
  createSliderInput("LINE_CLEAR_SHAKE_STRENGTH", "Strength of line clear shake", 0, 5);
  createSliderInput("LINE_CLEAR_SHAKE_LENGTH", "Length of line clear shake", 0, 3);
  createCheckbox("ENABLE_ACTION_TEXT", "Enable action text");
  createResetButton([
    "ENABLE_PLACE_BLOCK_ANIMATION", "PIECE_FLASH_LENGTH", "PIECE_FLASH_OPACITY", "ENABLE_LINECLEAR_ANIMATION",
    "LINE_CLEAR_LENGTH", "ENABLE_LINECLEAR_SHAKE", "LINE_CLEAR_SHAKE_STRENGTH", "LINE_CLEAR_SHAKE_LENGTH",
    "ENABLE_ACTION_TEXT"
  ], "Reset Visual Settings to Default")

  createTitle("Customization Settings");

  createHTML(`<p class='settings-text'>Checkout the 
  <a target='_blank' href='https://docs.google.com/spreadsheets/d/1xO8DTORacMmSJAQicpJscob7WUkOVuaNH0wzkR_X194/htmlview#'>Jstris Customization Database</a>
  for a list of skins and backgrounds to use.</p>`)

  createTextInput("BACKGROUND_IMAGE_URL", "Background image url (blank for none)");

  fetchSkinPresets();
  createHTML(CUSTOM_SKIN_PRESET_ELEMENT);
  createTextInput("CUSTOM_SKIN_URL", "Custom block skin url (blank for regular skin)");
  createTextInput("CUSTOM_GHOST_SKIN_URL", "Custom ghost block skin url (blank for default)");
  createHTML(`<p class='settings-text'>(Turning off custom skin may require a refresh)</p>`);
  createCheckbox("ENABLE_REPLAY_SKIN", "Enable custom skins in replays (requires refresh)");
  createCheckbox("ENABLE_KEYBOARD_DISPLAY", "Enable keyboard overlay");

  createTitle("Audio settings");
  createCheckbox("ENABLE_OPPONENT_SFX", "Enable opponent SFX");
  createSliderInput("OPPONENT_SFX_VOLUME_MULTPLIER", "Opponent SFX volume");
  createCheckbox("ENABLE_CUSTOM_SFX", "Enable custom SFX (turning off requires refresh)");
  createHTML(`<p class='settings-text'>(Turning off custom sounds may require a refresh)</p>`)
  createCheckbox("ENABLE_CUSTOM_VFX", "Enable custom spawn SFX (voice annotations)");
  createHTML(`<p class='settings-text'>(Custom SFX must be enabled for spawn SFX)</p>`);

  fetchSoundPresets();
  createHTML(CUSTOM_SOUND_PRESET_ELEMENT);
  createTextArea("CUSTOM_SFX_JSON", "Data for custom SFX");
  createHTML(`<p class='settings-text' id='custom_sfx_json_err'></p>`);

  createHTML(`<p class='settings-text'>Refer to the <a target="_blank" href="https://docs.google.com/document/d/1FaijL-LlBRnSZBbnQ2FUWxF9ktgoAQy0NnoHpjkXadE/edit#">guide</a> and the 
  <a target='_blank' href='https://docs.google.com/spreadsheets/d/1xO8DTORacMmSJAQicpJscob7WUkOVuaNH0wzkR_X194/htmlview#'>Jstris Customization Database</a>
  for custom SFX resources.`)

  createTitle("Custom stats settings");
  createCheckbox("ENABLE_STAT_APP", "Enable attack per piece stat (for all modes)");
  createCheckbox("ENABLE_STAT_PPD", "Enable pieces per downstack stat (100L cheese pace / 100) (for all modes)");
  createCheckbox("ENABLE_STAT_CHEESE_BLOCK_PACE", "Enable block pace stat for cheese race");
  createCheckbox("ENABLE_STAT_CHEESE_TIME_PACE", "Enable time pace stat for cheese race");
  createCheckbox("ENABLE_STAT_PPB", "Enable points per block stat for ultra");
  createCheckbox("ENABLE_STAT_SCORE_PACE", "Enable score pace for ultra");
  createCheckbox("ENABLE_STAT_PC_NUMBER", "Enable pc number indicator for pc mode");

  createTitle("Misc settings");
  createCheckbox("ENABLE_CHAT_TIMESTAMPS", "Enable chat timestamps");
  createCheckbox("SHOW_MM_BUTTON", "Show matchmaking button");
  createCheckbox("SHOW_QUEUE_INFO", "Show matchmaking queue info");
  createHTML(TOGGLE_CHAT_KEY_INPUT_ELEMENT);
}

const initModal = () => {


  // modal UI inject
  var modalButton = document.createElement("IMG");
  modalButton.src = "https://media.istockphoto.com/vectors/gear-icon-vector-illustration-vector-id857768248?k=6&m=857768248&s=170667a&w=0&h=p8E79IurGj0VrH8FO3l1-NXmMubUiShDW88xXynZpjE=";
  modalButton.className = "settings-modalOpenButton";

  var modalCloseButton = document.createElement("IMG");
  modalCloseButton.src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.onlinewebfonts.com%2Fsvg%2Fimg_324119.png&f=1&nofb=1";
  modalCloseButton.className = "settings-modalCloseButton"

  modalButton.addEventListener("click", () => {
    if (typeof ($) == "function")
      $(window).trigger('modal-opened');
    modal.style.display = "flex";
  });
  modalCloseButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  var modal = document.createElement("div");
  modal.className = "settings-modal";

  var modalContent = document.createElement("div");
  modalContent.className = "settings-modal-content";


  var modalHeader = document.createElement("div");
  modalHeader.className = "settings-modal-header";

  var header = document.createElement("h2");
  header.innerHTML = "Jstris+ Settings";

  modalHeader.appendChild(header);
  modalHeader.appendChild(modalCloseButton)

  var modalBody = document.createElement("div");
  modalBody.id = "settingsBody";
  modalBody.className = "settings-modal-body";

  modal.appendChild(modalContent);
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);

  document.body.appendChild(modal);
  document.body.appendChild(modalButton);


  generateBody();

}
;// CONCATENATED MODULE: ./src/layout.js


const changeBG = link => {
  console.log("Changing BG to "+link);
  var app = document.getElementById("BG_only");
  app.style.backgroundImage = `url(${link})`;
  app.style.backgroundSize = 'cover'
}

const initLayout = () => {
  changeBG(Config().BACKGROUND_IMAGE_URL)
  Config().onChange("BACKGROUND_IMAGE_URL", val => {
    changeBG(val);
  });
  console.log("Layout loaded.");
}
;// CONCATENATED MODULE: ./src/stats.js



const replaceBadValues = (n, defaultValue) => {
  // NaN check
  if (Number.isNaN(n) || !Number.isFinite(n))
    return defaultValue || 0;
  return n;

}

let stats = [];
const updateStats = function () {

  const index = this.ISGAME? 0 : parseInt(this.v.canvas.parentElement.getAttribute("data-index"));
  stats[index].forEach((stat) => {
    if (stat.enabled && stat.row) {
      if (stat.enabledMode && stat.enabledMode != this.pmode) {
        stat.row.style.display = "none";
        return;
      }
      stat.row.style.display = "table-row";
      var val = stat.calc(this);
      stat.row.children[1].innerHTML = val;
    } else {
      stat.row.style.display = "none";
    }
  });
}
const initStat = (index, name, configVar, calc, options = {}) => {
  stats[index].push({
    name,
    calc,
    val: 0,
    enabled: Config()[configVar],
    initialValue: options.initialValue || 0,
    enabledMode: options.enabledMode || 0, // 0 = enabled for all modes 
  });
  Config().onChange(configVar, val => {
    for (var individualStats of stats)
      var stat = individualStats.find(e => e.name == name);
      stat.enabled = val;
  })
}

const initStats = () => {
  const stages = document.querySelectorAll("#stage");
  stages.forEach((stageEle, i) => {
    stageEle.setAttribute("data-index", i); 
    stats.push([]);
    initGameStats(stageEle, i);
  })

}
const initGameStats = (stageEle, index) => {
  // these must be non-arrow functions so they can be bound
  initStat(index,"APP", "ENABLE_STAT_APP", game => replaceBadValues(game.gamedata.attack / game.placedBlocks).toFixed(3));
  initStat(index,"PPD", "ENABLE_STAT_PPD", game => replaceBadValues(game.placedBlocks / game.gamedata.garbageCleared).toFixed(3));

  initStat(index,"Block pace", "ENABLE_STAT_CHEESE_BLOCK_PACE", game => {
    let totalLines = game.ISGAME ? game["cheeseModes"][game["sprintMode"]] : game.initialLines;
    let linesLeft = game.linesRemaining
    let linesCleared = totalLines - linesLeft
    var piecePace = replaceBadValues((linesLeft / linesCleared) * game["placedBlocks"] + game["placedBlocks"])
    return (piecePace * 0 + 1) ? Math.floor(piecePace) : '0'
  }, { enabledMode: 3 });

  initStat(index,"Time pace", "ENABLE_STAT_CHEESE_TIME_PACE", game => {
    let totalLines = game.ISGAME ? game["cheeseModes"][game["sprintMode"]] : game.initialLines;
    let linesLeft = game.linesRemaining
    let linesCleared = totalLines - linesLeft;
    let time = game.ISGAME? game.clock : game.clock / 1000;
    var seconds = replaceBadValues((totalLines / linesCleared) * time);
    let m = Math.floor(seconds / 60)
    let s = Math.floor(seconds % 60)
    let ms = Math.floor((seconds % 1) * 100)
    return (m ? (m + ":") : '') + ("0" + s).slice(-2) + "." + ("0" + ms).slice(-2)
  }, { enabledMode: 3 });

  initStat(index,"PPB", "ENABLE_STAT_PPB", game => {
    var score = game["gamedata"]["score"];
    var placedBlocks = game["placedBlocks"];
    return replaceBadValues(score / placedBlocks).toFixed(2);
  }, { enabledMode: 5 });

  initStat(index,"Score pace", "ENABLE_STAT_SCORE_PACE", game => {
    var score = game["gamedata"]["score"];
    let time = game.ISGAME? game.clock : game.clock / 1000;
    return replaceBadValues(score + score / time * (120 - time)).toFixed(0);
  }, { enabledMode: 5 });

  initStat(index,"PC #", "ENABLE_STAT_PC_NUMBER", game => {
    let suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th'];
    let pcs = game.gamedata.PCs;
    
    if (!game.PCdata)
      return "1st";
    var blocks = game.placedBlocks - game.PCdata.blocks;
    let pcNumber = ((pcs + 1 + 3 * ((10 * pcs - blocks) / 5)) % 7) || 7;
    pcNumber = replaceBadValues(pcNumber, 1);
    if (!Number.isInteger(pcNumber))
      return "";
    return pcNumber + suffixes[pcNumber];
  }, { enabledMode: 8 });

  const statsTable = document.createElement("TABLE");
  statsTable.className = 'stats-table'
  //document.getElementById("stage").appendChild(statsTable);
  stageEle.appendChild(statsTable);

  stats[index].forEach(stat => {
    const row = document.createElement('tr');
    row.style.display = "none";
    const name = document.createElement('td');
    name.innerHTML = stat.name;
    const val = document.createElement('td');
    val.className = 'val';
    val.id = `${stat.name}-val`;
    val.innerHTML = stat.val;
    row.appendChild(name);
    row.appendChild(val);
    statsTable.appendChild(row);
    stat.row = row;
  })
  if (typeof Game == "function") {
    let oldQueueBoxFunc = Game.prototype.updateQueueBox;
    Game.prototype.updateQueueBox = function () {
      updateStats.call(this)
      return oldQueueBoxFunc.apply(this, arguments);
    }
  }
  if (typeof Replayer == "function" && typeof Game != "function") {
    let oldQueueBoxFunc = Replayer.prototype.updateQueueBox;
    Replayer.prototype.updateQueueBox = function () {
      updateStats.call(this)      
      return oldQueueBoxFunc.apply(this, arguments);
    }

    let oldCheckLineClears = Replayer.prototype.checkLineClears;
    Replayer.prototype.checkLineClears = function() {
      let val = oldCheckLineClears.apply(this, arguments);
      if (this.PCdata) {
        // empty matrix check
        if (this.matrix.every(row => row.every(cell => cell == 0))) {
          this.PCdata.blocks = 0;
        } else {
          this.PCdata.blocks++;
        }

      }
      return val;
    }

    var oldInitReplay = Replayer.prototype.initReplay;
    Replayer.prototype.initReplay = function () {
      let val = oldInitReplay.apply(this, arguments);
      this.initialLines = this.linesRemaining;
      if (this.pmode == 8)
        this.PCdata = { blocks : 0 }

      return val;
    }
  }

}
;// CONCATENATED MODULE: ./src/replayer-sfx.js





const initReplayerSFX = () => {
  console.log("replayer sounds init");
  SlotView.prototype.playReplayerSound = function(sound) {
    let volume = Config().OPPONENT_SFX_VOLUME_MULTPLIER || 0;

    if (!shouldRenderEffectsOnView(this)) {
      volume /= 4;
    }
    let enabled = !!localStorage.getItem("SE") && Config().ENABLE_OPPONENT_SFX;
    if (enabled) {
      if (Array.isArray(sound)) {
        sound.forEach(e => {
          let instance = createjs.Sound.play(e);
          instance.volume = volume;
        });
      } else {
        var instance = createjs.Sound.play(sound);
        instance.volume = volume;
      }
    }
      
  }


  const onBlockHold = SlotView.prototype.onBlockHold;
  SlotView.prototype.onBlockHold = function() {
    this.playReplayerSound("hold");
    onBlockHold.apply(this, arguments);
  }

  const onBlockMove = SlotView.prototype.onBlockMove;
  SlotView.prototype.onBlockMove = function() {
    this.playReplayerSound("move");
    onBlockMove.apply(this, arguments);
  }
  const onGameOver = SlotView.prototype.onGameOver;
  SlotView.prototype.onGameOver = function() {
    this.playReplayerSound("died");
    onGameOver.apply(this, arguments);
  }
  const onBlockLocked = SlotView.prototype.onBlockLocked;
  SlotView.prototype.onBlockLocked = function() {
    this.playReplayerSound("lock");
    onBlockLocked.apply(this, arguments);
  }
  const onLinesCleared = SlotView.prototype.onLinesCleared;
  SlotView.prototype.onLinesCleared = function(attack, comboAttack, { type, b2b, cmb }) {

    let game = this.slot.gs.p;
    let suhrit = [type, type, b2b && this.g.isBack2Back, cmb];
    var sounds = game.SFXset.getClearSFX(...suhrit);

    if (Array.isArray(sounds))
      sounds.forEach(sound => this.playReplayerSound(sound));
    else
      this.playReplayerSound(sounds);

    onLinesCleared.apply(this, arguments);
  }
  if (typeof Game == "function") {
    const oldReadyGo = Game.prototype.readyGo;

    const oldLineClears = GameCore.prototype.checkLineClears;
    GameCore.prototype.checkLineClears = function() {
      if (!(this.p && this.p.bot && this.p.bot.IS_BOT))
        return oldLineClears.apply(this, arguments);

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
        if (10 === blocks) {
          cleared ++;
        }
      }
      return oldLineClears.apply(this,arguments);
    }
    Game.prototype.readyGo = function() {
      let val = oldReadyGo.apply(this, arguments)
      console.log("injected bot sfx")
      if (this.Bots && this.Bots.bots) {
        this.Bots.bots.forEach(e => {
          if (e.g) {
            e.g.SFXset = this.SFXset;
            e.g.playSound = (a) => {
              if (a) {
                SlotView.prototype.playReplayerSound(a)
              }
            }
            let oldOnBotMove = e.__proto__.onBotMove;
            e.__proto__.onBotMove = function() {
              let val = oldOnBotMove.apply(this, arguments);
              SlotView.prototype.playReplayerSound("harddrop");
              return val;
            }
            let oldOnBotGameOver = e.__proto__.onGameOver;
            e.__proto__.onGameOver = function() {
              let val = oldOnBotGameOver.apply(this, arguments);
              // when you restart the game, all the bots get gameovered
              if (!e.p.p.gameEnded)
                SlotView.prototype.playReplayerSound("died");
              return val;
            }
          }
        });
      }

      return val;
    }

  }
  
}
;// CONCATENATED MODULE: ./src/keyboardDisplay.js

const initKeyboardDisplay = () => {
  const isGame = typeof Game != "undefined";
  const isReplayer = typeof Replayer != "undefined";

  if (!isGame && !isReplayer) return;

  const keyConfig = [
    [
      'new',
      null,
      {k: 'reset', l: 'F4'},
    ],
    [
      null
    ],
    [
      '180',
      'ccw',
      'cw',
      null,
      null,
      'hd',
    ],
    [
      null,
      null,
      {k: 'hold', l: 'HLD'},
      null,
      {k: 'left', l: 'L'},
      'sd',
      {k: 'right', l: 'R'}
    ]
  ];

  var kbhold = document.createElement("div");
  kbhold.id = "keyboardHolder";

  if (!Config().ENABLE_KEYBOARD_DISPLAY)
    kbhold.classList.add('hide-kbd-display')
  Config().onChange("ENABLE_KEYBOARD_DISPLAY", val => {
    if (val) {
      kbhold.classList.remove('hide-kbd-display')
    } else {
      kbhold.classList.add('hide-kbd-display')
    }
  })
  document.getElementById("stage").appendChild(kbhold);
  
  

  let keyTable = `
    <div id="kbo">
      <div id="kps"></div>
      <table class="tg">
  `;

  for (const row of keyConfig) {
    keyTable += `<tr>`;

    for (const key of row) {
      let isKey = key != null;
      let label = "";
      let cssClass = "kbnone";

      if (isKey) {
        label = typeof key == 'string'? key.toUpperCase() : key.l;
        cssClass = "kbkey kbd-" + (typeof key == 'string'? key.toLowerCase() : key.k);
      }

      keyTable += `<td class="${cssClass}">${label}</td>`;
    }

    keyTable += `</tr>`;
  }

  keyTable += `
      </table>
    </div>
  `;

  keyboardHolder.innerHTML = keyTable;
  let setKey = function(key, type) {
    for (const td of document.getElementsByClassName(`kbd-${key}`)) {
      td.style.backgroundColor = ["", "lightgoldenrodyellow"][type];
    }
  }

  if (isGame) {
    let oldReadyGo = Game.prototype.readyGo;
    Game.prototype.readyGo = function() {
      Game['set2ings'] = this.Settings.controls;
      return oldReadyGo.apply(this, arguments);
    }

    let oldUpdateTextBar = Game.prototype.updateTextBar;
    Game.prototype.updateTextBar = function() {
      let val = oldUpdateTextBar.apply(this, arguments);
      kps.innerHTML = 'KPS: ' + (this.getKPP() * this.placedBlocks / this.clock).toFixed(2);
      return val;
    }

    let press = function (e) {
      if (typeof Game.set2ings == 'undefined') return;

      let i = Game.set2ings.indexOf(e.keyCode);
      if (i == -1) return;

      let key = ['left', 'right', 'sd', 'hd', 'ccw', 'cw', 'hold', '180', 'reset', 'new'][i];
      setKey(key, +(e.type == "keydown"))
    }

    document.addEventListener('keydown', press);
    document.addEventListener('keyup', press);

  } else if (isReplayer) {
    var url = window.location.href.split("/")

    if (!url[2].endsWith("jstris.jezevec10.com")) return;
    if (url[3] != "replay") return;
    if (url[4] == "1v1") {
      kbhold.classList.add("really-hide-kbd-display");
      return;
    }

    let L;

    let fetchURL = "https://"+url[2]+"/replay/data?id="+url[(L=url[4]=="live")+4]+"&type="+(L?1:0);
    /*
    if(url[4] == "live"){
      fetchURL = "https://"+url[2]+"/replay/data?id=" + url[5] + "&type=1"
    } else {
      fetchURL = "https://"+url[2]+"/replay/data?id=" + url[4] + "&type=0"
    }
    */

    //fetch(`https://${url[2]}/replay/data?id=${url.length == 6? (url[5] + "&live=1") : url[4]}&type=0`)
    fetch(fetchURL)
      .then(res => res.json())
      .then(json => {
        if (!json.c)
          return;
        let das = json.c.das;

        Replayer.setKey = setKey;

        let oldPlayUntilTime = Replayer.prototype.playUntilTime
        Replayer.prototype.playUntilTime = function() {
          
          kps.innerHTML = 'KPS: ' + (this.getKPP() * this.placedBlocks / this.clock * 1000).toFixed(2);

          if (this.ptr == 0) Replayer.lastPtr = -1;

          this.kbdActions = [];

          for (let i = 0; i < this.actions.length; i++) {
            let o = {a: this.actions[i].a, t: this.actions[i].t};

            if (o.a == 2 || o.a == 3) {
              o.a -= 2;
              for (let j = i - 1; j >= 0; j--) {
                if (this.kbdActions[j].a < 2) {
                  this.kbdActions[j].a += 2;
                  break;
                }
              }
            }

            this.kbdActions.push(o);
          }

          let pressKey = function(key, type) {
            Replayer.setKey(key, Math.min(type, 1));

            if (type == 2) {
              setTimeout(x => Replayer.setKey(key, 0), das * 3 / 5)
            }
          };
          
          let val = oldPlayUntilTime.apply(this, arguments);
          
          if (this.ptr != Replayer.lastPtr && this.ptr - 1 < this.kbdActions.length) {
            var highlight = [
              ["left", 2],
              ["right", 2],
              ["left", 1],
              ["right", 1],
              ["ccw", 2],
              ["cw", 2],
              ["180", 2],
              ["hd", 2],
              ["sd", 2],
              null,
              ["hold", 2]
            ][this.kbdActions[this.ptr - 1].a];

            if (highlight) {
              pressKey(...highlight)
            }
          }

          Replayer.lastPtr = this.ptr;

          return val;
        };
      });
  }
}
;// CONCATENATED MODULE: ./src/skin.js

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

const initCustomSkin = () => {
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

const initConnectedSkins = () => {
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
;// CONCATENATED MODULE: ./src/sfxLoader.js
const DALREADY = "https://freyhoe.github.io/Jstris-/sfx/ready.wav"


;

const attemptLoadSFX = function () {
    if (typeof loadSFX == "function") {
        loadSFX(...arguments);
        createjs.Sound.registerSound(DALREADY, "readyPlayerDal")
    } else {
        setTimeout(() => attemptLoadSFX(...arguments), 200);
    }
}
const loadSound = (name, url) => {
    if (!name || !url) {
        return;
    }
    let ishta = url.url
    if (ishta) {

        let enslee = createjs.Sound.registerSound(ishta, name);
        if (!enslee || !createjs.Sound._idHash[name]) {
            return void console.error("loadSounds error: src parse / cannot init plugins, id=" + name + (false === enslee ? ", rs=false" : ", no _idHash"));
        }
        createjs.Sound._idHash[name].sndObj = url;
    }
};
const loadReplayerSFX = function (sfx) {
    let SOUNDS = ["hold", "linefall", "lock", "harddrop", "rotate", "success", "garbage", "b2b", "land", "move", "died", "ready", "go", "golive", "ding", "msg", "fault", "item", "pickup"];
    let SErot = localStorage.getItem("SErot")
    if (!SErot) {
        sfx.rotate = { url: "null.wav" }
    }
    if (sfx.scoring) {
        for (var i = 0; i < sfx.scoring.length; ++i) {
            sfx.scoring[i] && loadSound("s" + i, sfx.scoring[i]);
        }
    }
    if (sfx.b2bScoring && Array.isArray(sfx.b2bScoring)) {
        for (i = 0; i < sfx.b2bScoring.length; ++i) {
            sfx.b2bScoring[i] && loadSound("bs" + i, sfx.b2bScoring[i]);
        }
    }
    if (sfx.spawns) {
        for (var talitha in sfx.spawns) {
            loadSound("b_" + talitha, sfx.spawns[talitha]);
        }
    }
    for (i = 0; i < SOUNDS.length; ++i) {
        let kayley = SOUNDS[i];
        loadSound(kayley, sfx[kayley]);
    }
    if (sfx.comboTones && Array.isArray(sfx.comboTones)) {
        for (i = 0; i < sfx.comboTones.length; ++i) {
            var zohet = sfx.comboTones[i];
            zohet && createjs.Sound.registerSound(sfx.getSoundUrlFromObj(zohet), "c" + i);
        }
        sfx.maxCombo = sfx.comboTones.length - 1;
    } else {
        if (sfx.comboTones) {
            var kisa = [];
            for (i = 0; i < sfx.comboTones.cnt; ++i) {
                kisa.push({ id: "c" + i, startTime: i * (sfx.comboTones.duration + sfx.comboTones.spacing), duration: sfx.comboTones.duration });
            }
            sfx.maxCombo = sfx.comboTones.cnt - 1;
            var kaley = [{ src: sfx.getSoundUrl("comboTones"), data: { audioSprite: kisa } }];
            createjs.Sound.registerSounds(kaley, "");
        }
    }
}

const loadDefaultSFX = () => {
    console.log("loading default sfx")
    try {
        loadSFX(new window.SFXsets[localStorage["SFXset"]].data());
    } catch (e) { // just in case
        console.log("failed loading default sfx: " + e);
    }
    return;
}

const changeSFX = () => {
    var json = Config().CUSTOM_SFX_JSON;
    let sfx = null;

    if (json) {
        try {
            sfx = JSON.parse(json);
            document.getElementById("custom_sfx_json_err").innerHTML = "Loaded " + (sfx.name || "custom sounds");
        } catch (e) {
            console.log("SFX json was invalid.");
            document.getElementById("custom_sfx_json_err").innerHTML = "SFX json is invalid.";
        }
    } else {
        document.getElementById("custom_sfx_json_err").innerHTML = "";
    }
    if (typeof Game == "function") {
        if (!Config().ENABLE_CUSTOM_SFX || !sfx) {
            loadDefaultSFX();
        } else {
            console.log("Changing SFX...");
            console.log(sfx);

            let csfx = loadCustomSFX(sfx);
            attemptLoadSFX(csfx)

        }
    }

    if (typeof window.View == "function" && typeof window.Live != "function") { //force sfx on replayers
        let onready = View.prototype.onReady
        View.prototype.onReady = function () {
            let val = onready.apply(this, arguments);
            let csfx = loadCustomSFX(sfx)
            this.SFXset = csfx
            loadReplayerSFX(csfx)
            //   console.log(this.SFXset)
            return val
        }
    }
}

const initCustomSFX = () => {
    if (!createjs) return

    createjs.Sound.registerSound(DALREADY, "readyPlayerDal")
    if (typeof Game == "function") {
        let onnextblock = Game.prototype.getNextBlock
        Game.prototype.getNextBlock = function () {

            if (Config().ENABLE_CUSTOM_VFX) {
                this.playCurrentPieceSound()
            }
            let val = onnextblock.apply(this, arguments)
            return val
        }
        let onholdblock = Game.prototype.holdBlock
        Game.prototype.holdBlock = function () {
            if (Config().ENABLE_CUSTOM_VFX) {
                this.playCurrentPieceSound()
            }
            let val = onholdblock.apply(this, arguments)
            return val
        }
    }

    /*   let onPlay = createjs.Sound.play
       createjs.Sound.play = function () {
           console.log(arguments[0])
           let val = onPlay.apply(this, arguments)
           return val
       }*/
    changeSFX(Config().CUSTOM_SFX_JSON)
    Config().onChange("CUSTOM_SFX_JSON", changeSFX);
    Config().onChange("ENABLE_CUSTOM_SFX", changeSFX);
    Config().onChange("ENABLE_CUSTOM_VFX", changeSFX);
    return true
}

const loadCustomSFX = (sfx = {}) => {
    const SOUNDS = ["hold", "linefall", "lock", "harddrop", "rotate", "success", "garbage", "b2b", "land", "move", "died", "ready", "go", "golive", "ding", "msg", "fault", "item", "pickup"]
    let SCORES = [
        "SOFT_DROP",
        "HARD_DROP",
        "CLEAR1",
        "CLEAR2",
        "CLEAR3",
        "CLEAR4",
        "TSPIN_MINI",
        "TSPIN",
        "TSPIN_MINI_SINGLE",
        "TSPIN_SINGLE",
        "TSPIN_DOUBLE",
        "TSPIN_TRIPLE",
        "PERFECT_CLEAR",
        "COMBO",
        "CLEAR5"
    ]
    function CustomSFXset() {
        this.volume = 1
    }
    CustomSFXset.prototype = new BaseSFXset;
    CustomSFXset.prototype.getSoundUrlFromObj = function (obj) {
        return obj.url
    }

    CustomSFXset.prototype.getClearSFX = function (altClearType, clearType, b2b, combo) {
        let sounds = [],
            prefix = '';
        let specialSound = null
        let override = false
        if (this.specialScoring) {
            let scorings = [this.specialScoring[SCORES[clearType]]]
            if ((clearType > 4 && clearType <= 11) || clearType == 14) {
                if (this.specialScoring.TSPINORTETRIS) {
                    scorings.push(this.specialScoring.TSPINORTETRIS)
                }
            } else if (clearType == 127) {
                if (this.specialScoring.ALLSPIN) {
                    scorings.push(this.specialScoring.ALLSPIN)
                }
            }
            for (let scoring of scorings) {
                if (Array.isArray(scoring)) {

                    let bestFit = { score: 0.5, sound: null, combo: -1 }
                    for (let sfx of scoring) {
                        let score = 0
                        if (sfx.hasOwnProperty("b2b") && sfx.b2b == b2b) {
                            score += 1
                        }
                        if (sfx.hasOwnProperty("combo") && sfx.combo <= combo) {
                            score += 1
                        }
                        if (bestFit.score < score) {
                            override = sfx.override
                            bestFit = { score: score, sound: sfx.name, combo: combo }
                        } else if (bestFit.score == score) {
                            if (sfx.combo && combo > bestFit.combo) {
                                override = sfx.override
                                bestFit = { score: score, sound: sfx.name, combo: combo }
                            }
                        }
                    }
                    if (bestFit.sound != null) {
                        specialSound = bestFit.sound
                        sounds.push(specialSound)
                    }
                }
            }

            if (this.specialScoring.ANY) {
                let bestFit = { score: 0, sound: null, combo: -1 }

                for (let sfx of this.specialScoring.ANY) {
                    let score = 0
                    if (sfx.hasOwnProperty("b2b")) {
                        if (sfx.b2b == b2b) score += 1
                        else continue
                    }

                    if (sfx.hasOwnProperty("combo")) {
                        if (sfx.combo <= combo) score += 1
                        else continue
                    }
                    if (bestFit.score < score) {
                        override = sfx.override
                        bestFit = { score: score, sound: sfx.name, combo: combo }
                    } else if (bestFit.score == score) {
                        if (sfx.combo && combo > bestFit.combo) {
                            override = sfx.override
                            bestFit = { score: score, sound: sfx.name, combo: combo }
                        }
                    }
                }
                if (bestFit.sound != null) {
                    specialSound = bestFit.sound
                    sounds.push(specialSound)
                }
            }

        }
        if (sfx.hasOwnProperty(b2b) && b2b) {
            sounds.push('b2b')
        }
        if (combo >= 0) {
            sounds.push(this.getComboSFX(combo))
        }
        if (this.scoring && (!specialSound || override == false)) {
            sounds.push(prefix + this.getScoreSFX(clearType))
        }
        if (altClearType == Score.A.PERFECT_CLEAR) {
            sounds.push(prefix + this.getScoreSFX(altClearType))
        }
        //   console.log(sounds)
        return sounds
    }
    let customSFX = new CustomSFXset

    /*    function CustomVFXset() {
            this.volume = 1
        }
        CustomVFXset.prototype = new NullSFXset
        CustomVFXset.prototype.getSoundUrlFromObj = function (obj) {
            return obj.url
        }
        let customVFX = new CustomVFXset*/

    for (let name of SOUNDS) {
        if (sfx.hasOwnProperty(name)) {
            customSFX[name] = {
                url: sfx[name],
            }
        } else {
            customSFX[name] = {
                url: "null.wav",
            }
        }
    }
    if (sfx.comboTones) {
        if (Array.isArray(sfx.comboTones)) {
            customSFX.comboTones = []
            for (let tone of sfx.comboTones) {
                if (typeof tone === 'string') {
                    customSFX.comboTones.push({ url: tone })
                } else {
                    customSFX.comboTones.push({ url: "null.wav" })
                }
            }
        } else if (typeof sfx.comboTones == "object") {
            if (sfx.comboTones.duration && sfx.comboTones.spacing && sfx.comboTones.cnt) {
                customSFX.comboTones = {
                    url: sfx.comboTones.url,
                    duration: sfx.comboTones.duration,
                    spacing: sfx.comboTones.spacing,
                    cnt: sfx.comboTones.cnt,
                }
            }
        }
    }
    if (sfx.specialScoring && typeof sfx.specialScoring == "object") {
        for (let key in sfx.specialScoring) {
            if (!Array.isArray(sfx.specialScoring[key])) continue
            for (let i in sfx.specialScoring[key]) {
                let sound = sfx.specialScoring[key][i]
                sound.name = "CUSTOMSFX" + key + i
                loadSound(sound.name, sound)
            }
        }
        customSFX.specialScoring = sfx.specialScoring
    }
    if (sfx.scoring && typeof sfx.scoring == "object") {
        customSFX.scoring = Array(15)

        for (let key in sfx.scoring) {
            let i = SCORES.indexOf(key)
            if (i < 0) continue
            customSFX.scoring[i] = { url: sfx.scoring[key] }
        }
    }
    if (sfx.spawns && typeof sfx.spawns == "object") {
        let scores = [
            "I", "O", "T", "L", "J", "S", "Z"
        ]
        for (let key in sfx.spawns) {
            let i = scores.indexOf(key)
            if (i > 0) {
                loadSound("b_" + key, { url: sfx.spawns[key] })
            }

        }
    } else {
        let scores = [
            "I", "O", "T", "L", "J", "S", "Z"
        ]
        for (var key of scores) {
            loadSound("b_" + key, { url: "null.wav" })
        }
    }
    return customSFX
    //    attemptLoadSFX(customSFX);

}

;// CONCATENATED MODULE: ./src/index.js
















//import { initConnectedSkins } from './connectedSkins';


// inject style
var styleSheet = document.createElement("style");
styleSheet.innerText = style;
document.body.appendChild(styleSheet);


initConfig();
initModal();
if (typeof ReplayController == "function") initReplayManager()

if (typeof GameCore == "function") {
    initCustomSkin();
    if (!location.href.includes('export')) {
        initActionText();
        initFX();
        initKeyboardDisplay();
    }
    initStats();
    initCustomSFX();
}
if (typeof Game == "function") {
    initLayout();
}
if (typeof Live == "function") initChat();
if (typeof SlotView == "function") initReplayerSFX();
initMM();


/******/ })()
;