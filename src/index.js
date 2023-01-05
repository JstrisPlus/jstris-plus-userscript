'use strict';

import { initActionText } from './actiontext';
import { initFX } from './jstris-fx';
import { initMM } from './matchmaking';
import { initChat } from './chat.js';
import { Config, initConfig } from './config';

import css from './style.css';
import { initModal } from './settingsModal';
import { initLayout } from './layout';
import { initStats } from './stats';
import { initReplayerSFX } from './replayer-sfx';
import { initKeyboardDisplay } from './keyboardDisplay';
import { initCustomSkin } from './skin';
import { initCustomSFX } from './sfxLoader'
//import { initConnectedSkins } from './connectedSkins';
import { initReplayManager } from './replayManager';
import { initPracticeUndo } from "./practiceUndo";
import { initPracticeSurvivalMode } from './practiceSurvivalMode';
import { fixTeamsMode } from './teamsMode';
import { initPracticeFumen, initReplayerSnapshot } from './practiceFumen';
import { initExtraKeybinds } from "./extraKeybinds";
import { authNotification, playSound, notify, setPlusSfx } from './util';
import { initScreenshot } from './screenshot';
// inject style
var styleSheet = document.createElement("style");
styleSheet.innerText = css;
document.body.appendChild(styleSheet);

initConfig();
initModal();

if (Config().FIRST_OPEN) {
    alert("Hi! Thank you for installing Jstris+! Remember to turn off all other userscripts and refresh the page before trying to play. Enjoy!")
    Config().set("FIRST_OPEN", false);
}

authNotification()

if (typeof ReplayController == "function") {
    initReplayManager()
    initReplayerSnapshot()
}

if (typeof GameCore == "function") {
    initCustomSkin();
    if (!location.href.includes('export')) {
        initActionText();
        initFX();
        initKeyboardDisplay();
    }
    initStats();
    initCustomSFX();

    initPracticeSurvivalMode();
}
if (typeof Game == "function") {
    initLayout();
    initPracticeUndo();
    initPracticeFumen()
    initExtraKeybinds();
    setPlusSfx(Config().CUSTOM_PLUS_SFX_JSON)
    let pbListener = GameCaption.prototype.newPB
    GameCaption.prototype.newPB = function () {
        playSound("PB");
        let val = pbListener.apply(this, arguments)
        return val
    }
    let b4Reset = Live.prototype.beforeReset
    Live.prototype.beforeReset = function () {
        if (!this.p.isTabFocused) {
            notify("Jstris", "⚠ New game starting! ⚠")
        }
        return b4Reset.apply(this, arguments)
    }
    initScreenshot()
    //fixTeamsMode()
}
if (typeof Live == "function") initChat();
initReplayerSFX();
initMM();