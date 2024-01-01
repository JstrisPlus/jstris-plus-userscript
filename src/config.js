// these are default values
var config = {
  FIRST_OPEN: true,

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
  CUSTOM_PLUS_SFX_JSON: "",

  ENABLE_STAT_APP: false,
  ENABLE_STAT_PPD: false,
  ENABLE_STAT_CHEESE_BLOCK_PACE: false,
  ENABLE_STAT_CHEESE_TIME_PACE: false,
  ENABLE_STAT_PPB: false,
  ENABLE_STAT_SCORE_PACE: false,
  ENABLE_STAT_PC_NUMBER: false,

  ENABLE_AUTOMATIC_REPLAY_CODES: false,
  ENABLE_CHAT_TIMESTAMPS: true,
  SHOW_QUEUE_INFO: true,
  SHOW_MM_BUTTON: true,
  TOGGLE_CHAT_KEYCODE: null,
  CLOSE_CHAT_KEYCODE: null,
  SCREENSHOT_KEYCODE: null,

  UNDO_KEYCODE: null,
};

const defaultConfig = { ...config };

var listeners = [];

export const initConfig = () => {
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

const reset = function (name) {
  set(name, defaultConfig[name]);
}

const onChange = (event, listener) => {
  listeners.push({ event, listener });
}

export const Config = () => ({ ...config, set, onChange, reset });