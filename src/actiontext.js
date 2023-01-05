import { Config } from "./config";
import { shouldRenderEffectsOnView } from "./util";

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
        let spike_tracker = document.getElementById(`atk_spike_${this.index + 1}`);
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
        action.setAttribute("id", `atk_text_${this.index + 1}_${this.id++}`);
        action.setAttribute("class", "action-text fade in");
        action.style.textAlign = "center";
        if (value >= 5) {
            action.style.fontSize = "large";
            action.style.fontWeight = "bold";
        }
        if (value >= 10) {
            action.style.color = "red";
        }
        document.getElementById(`atk_div_${this.index + 1}`).prepend(action);
        this.displayedActions.splice(0, 0, action.id);
        setTimeout((ind, id) => {
            try {
                let target = document.getElementById(`atk_text_${ind + 1}_${id - 1}`);
                target.classList.remove("in");
                setTimeout((target) => {
                    try {
                        this.displayedActions = this.displayedActions.filter((i) => i != target.id);
                        target.parentNode.removeChild(target);
                    } catch (e) { } // idc
                }, FADEOUT * 1000, target);
            } catch (e) { } // idc
        }, DELAY, this.index, this.id);
    }

    reset() {
        for (let action of this.displayedActions) {
            try {
                action.parentNode.removeChild(action);
            } catch (e) { }
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

export const initActionText = () => {
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
        let lstage = lstages[i - 1];
        let num = window.displayerManager.createDisplayer();
        let spike_tracker = document.createElement("p");
        spike_tracker.setAttribute("id", `atk_spike_${num.index + 1}`);
        spike_tracker.setAttribute("style", `max-width: 96px; color: yellow; font-weight: bold;`);
        spike_tracker.setAttribute("class", "spike-tracker fade in");
        lstage.appendChild(spike_tracker);
        let atkdiv = document.createElement("div");
        atkdiv.setAttribute("style", `max-width: 96px; max-height: ${MAX_HEIGHT}px; overflow: hidden; padding: 5px;`);
        atkdiv.setAttribute("id", `atk_div_${num.index + 1}`);
        lstage.appendChild(atkdiv);
    }
    if (typeof trim != "function") { var trim = a => { a = a.slice(0, -1); a = a.substr(a.indexOf("{") + 1); return a } }
    if (typeof getArgs != "function") {
        var getArgs = a => {
            let args = a.toString().match(/function\s*(?:[_a-zA-Z]\w*\s*)?\(((?:(?:[_a-zA-Z]\w*)\s*,\s*?)*(?:[_a-zA-Z]\w*)?)\)/);
            if (args.length > 1) return args[1].split(/\s*,\s*/g);
            return [];
        }
    }
    let displayActionText = function () {
        try {
            let parseCanvasName = function (name) {
                let number = name.match(/(\d+)$/);
                if (number === null) return 1; // no number, assume is first player
                return parseInt(number[0]);
            }

            let IS_BOT = false;
            let playerNum;
            switch (this.v.constructor.name) {
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

            if (IS_BOT || (this.clock !== 0 && playerNum !== -1)) {
                if (!this.displayer) {
                    this.displayer = window.displayerManager.displayers[playerNum];
                }

                // generate clear text string
                let clearText;
                if (type !== this.Scoring.A.PERFECT_CLEAR) {
                    let lcNames = ["", "Single", "Double", "Triple", "Quad", "Multi"];
                    clearText = lcNames[Math.min(linesCleared, 5)];

                    let blockName = this.blockSets[this.activeBlock.set].blocks[this.activeBlock.id].name;
                    if (this.spinPossible) clearText = blockName + "&#x2011;Spin " + clearText; // &#x2011; is non-breaking hyphen, &nbsp; is non-brekaing space
                    else if (this.spinMiniPossible) clearText = blockName + "&#x2011;Spin " + clearText + " Mini";
                }
                else {
                    clearText = "Perfect Clear!";
                }

                if (b2b && this.isBack2Back) clearText = "B2B " + clearText;
                if (cmb > 0) clearText += ` combo${cmb}`;

                this.displayer.displayNewAction(atk + cba, clearText);
            }
        } catch (e) { console.log(e); }
    }
    try {
        let functionStr = trim(GameCore.prototype.checkLineClears.toString());

        // find switch(linesCleared) to get linesCleared variable
        functionStr = functionStr.replace(/switch\((_0x[a-f0-9]+x[a-f0-9]+)\)/, (match, p1) => `let linesCleared=${p1}; switch(${p1})`);

        // insert displayActionText after the following code:
        // ... atk+ cba;
        // let atkMeta={type:_,b2b:this._,cmb:this._};
        let replacePattern = /(_0x[a-f0-9]+x[a-f0-9]+)\+ (_0x[a-f0-9]+x[a-f0-9]+);let (_0x[a-f0-9]+x[a-f0-9]+)=\{type:_0x[a-f0-9]+x[a-f0-9]+,b2b:this\[_0x[a-f0-9]+\[\d+]],cmb:this\[_0x[a-f0-9]+\[\d+]]};/;
        let replacer = function (match, p1, p2, p3) { return match + `let atk = ${p1}; let cba = ${p2}; let type = ${p3}.type; let b2b = ${p3}.b2b; let cmb = ${p3}.cmb;` + trim(displayActionText.toString()); }
        functionStr = functionStr.replace(replacePattern, replacer);

        GameCore.prototype.checkLineClears = new Function(...getArgs(GameCore.prototype.checkLineClears), functionStr);
    } catch (e) {
        console.log(e);
        console.log("Could not inject into line clears!");
    }
    try {
        Replayer.prototype.checkLineClears = function (a) {
            GameCore.prototype.checkLineClears.call(this, a);
        }
        const oldInitReplay = Replayer.prototype.initReplay
        Replayer.prototype.initReplay = function () {
            try {
                if (this.v.displayer && this.v.displayer.reset)
                    this.v.displayer.reset()
            } catch (e) {
                console.log(e);
            }
            return oldInitReplay.apply(this, arguments);
        }
    } catch (e) {
        console.log(e);
        console.log("Could not inject into line clears!");
    }
    try {
        SlotView.prototype.onResized = function () {
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
                        if (!document.getElementById(`atk_spike_${this.displayer.index + 1}`)) {
                            let spike_tracker = document.createElement("p");
                            spike_tracker.setAttribute("class", "layer fade in");
                            spike_tracker.setAttribute("style", `top: ${top}px; left: ${left}px; width: ${this.holdCanvas.width}px; height: 20px; color: yellow; font-weight: bold;`);
                            spike_tracker.setAttribute("id", `atk_spike_${this.displayer.index + 1}`);
                            this.holdCanvas.parentNode.appendChild(spike_tracker);

                        }
                        if (!document.getElementById(`atk_div_${this.displayer.index + 1}`)) {
                            let atkdiv = document.createElement("div");
                            atkdiv.setAttribute("class", "layer");
                            atkdiv.setAttribute("style", `top: ${top + 40}px; left: ${left}px; width: ${this.holdCanvas.width}px; max-height: ${MAX_HEIGHT}px; overflow: hidden;`);
                            atkdiv.setAttribute("id", `atk_div_${this.displayer.index + 1}`);
                            this.holdCanvas.parentNode.appendChild(atkdiv);
                        }
                    } catch (e) { console.log(e); }
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
