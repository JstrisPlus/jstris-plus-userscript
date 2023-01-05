import { Config } from "./config";
export const initExtraKeybinds = () => {
    /**
     * Function to be called on each keydown or keyup.
     * Handles extra keybinds.
     */
    Game.prototype.extraKeybindsInput = function(keyboardEvent) {
        if (keyboardEvent.repeat) return;

        const conf = Config();
        if (conf.ENABLE_EXTRA_KEYBINDS === false) return;

        const keyCode = keyboardEvent.keyCode;
        const extraKeybinds = conf.EXTRA_KEYBINDS;

        if (this.Settings.controls.includes(keyCode)) return; // key is used in standard controls. exit to prevent infinite loop

        for (let keyNum = 0; keyNum < 8; keyNum++) {
            const isBound = extraKeybinds[keyNum].includes(keyCode);
            if (isBound === false) continue;

            let realKeyCode = this.Settings.controls[keyNum];
            let event = new KeyboardEvent(keyboardEvent.type, {keyCode : realKeyCode});
            document.dispatchEvent(event);
        }
    }

    // create key listener (keyup and keydown) to call extraKeybindsInput
    // (on generatePracticeQueue, add the listener if not already added)
    let extraKeybindsInjected = false;
    const oldGeneratePracticeQueue = Game.prototype.generatePracticeQueue;
    Game.prototype.generatePracticeQueue = function () {
        if (!extraKeybindsInjected) {
            document.addEventListener("keyup",   this.extraKeybindsInput.bind(this), true);
            document.addEventListener("keydown", this.extraKeybindsInput.bind(this), true);
            extraKeybindsInjected = true;
        }

        return oldGeneratePracticeQueue.apply(this, arguments);
    }

    /**
     * Processes the given keycode for the given key index.
     * Either sets the primary key (if not already set), adds an extra key, or removes all (if keycode is esc)
     * @override
     */
    Settings.prototype.setControlKey = function(id,keyCode){
        const conf = Config();
        if (keyCode === 27) { // if keycode is escape, clear all keys. TODO: replace this with clear button (maybe?)
            this.clearKey(id);
        }
        else if (!conf.ENABLE_EXTRA_KEYBINDS || this.controls[id - 1] === 0) {
            this.setPrimaryControlKey(id, keyCode);
        }
        else {
            if (this.controls[id - 1] === keyCode || conf.EXTRA_KEYBINDS[id - 1].includes(keyCode)) return; // don't add duplicate
            conf.EXTRA_KEYBINDS[id - 1].push(keyCode);
            conf.set("EXTRA_KEYBINDS", conf.EXTRA_KEYBINDS);
        }
    }

    /**
     * Removes the keybinds (primary and extra) of the given key id
     */
    Settings.prototype.clearKey = function(id) {
        this.controls[id - 1] = 0;

        let conf = Config();
        let extraKeys = conf.EXTRA_KEYBINDS;
        extraKeys[id - 1] = [];
        conf.set("EXTRA_KEYBINDS", extraKeys);
    }

    /**
     * Sets the primary key. Code taken from the original setControlKey code
     */
    Settings.prototype.setPrimaryControlKey = function(id, keyCode) {
        this.controls[id-1] = keyCode;
        switch(id) {
            case 1: this.ml = keyCode; break;
            case 2: this.mr = keyCode; break;
            case 3: this.sd = keyCode; break;
            case 4: this.hd = keyCode; break;
            case 5: this.rl = keyCode; break;
            case 6: this.rr = keyCode; break;
            case 7: this.hk = keyCode; break;
            case 8: this.dr = keyCode; break;
            case 9: /*sprint reset*/ break;
            case 10: /*game reset*/ break;
            default: console.warn("Tried to set unknown key id!");
        }
    }

    /**
     * Returns the text to display in a control input box, including all extra keybinds
     */
    Settings.prototype.getMultiKeyText = function(id) {
        const conf = Config();
        const primaryKeyCode = this.controls[id-1];
        const extraKeyCodes = conf.EXTRA_KEYBINDS[id - 1];

        if (primaryKeyCode === 0) return ""; // no key is set
        if (id >= 9) return this.getKeyName(primaryKeyCode); // restart keys don't support extra keybinds
        if (conf.ENABLE_EXTRA_KEYBINDS === false) return this.getKeyName(primaryKeyCode); // if extra keybinds is disabled, keep them stored but not displayed

        const allKeyCodes = [primaryKeyCode].concat(extraKeyCodes);
        return allKeyCodes
            .map(this.getKeyName)
            .join(" ");
    }

    /* ---------------------------------------------------------------------------------------- */
    /* Override settings.handleKeyDown and settings.openSettings to display additional keybinds */
    /* ---------------------------------------------------------------------------------------- */

    Settings.prototype.handleKeyDown = function(keyCode,id) {
        document.getElementById("kc"+id).innerHTML=keyCode;
        this.setControlKey(id,keyCode);
        this.setCookie("k"+id,keyCode);
        this.inputBoxes[id].value=this.getMultiKeyText(id);
    }


    let oldOpenSettings = Settings.prototype.openSettings;
    Settings.prototype.openSettings = function() {
        oldOpenSettings.apply(this, arguments);

        if (Config().ENABLE_EXTRA_KEYBINDS === false) return; // won't affect anything so don't bother

        // set each key input field's text
        // it'd be more efficient to replace the bit of the function that already does this but blehhh
        for (let i = 1; i < this.inputBoxes.length; i++){
            this.inputBoxes[i].value = this.getMultiKeyText(i);
        }
    }
}