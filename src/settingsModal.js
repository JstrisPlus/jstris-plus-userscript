import { Config } from "./config";
import { CUSTOM_SKIN_PRESET_ELEMENT, fetchSkinPresets } from "./customSkinPresets";
import { CUSTOM_SOUND_PRESET_ELEMENT, fetchSoundPresets } from "./customSoundPresets";
import { CUSTOM_PLUS_SOUND_PRESET_ELEMENT, fetchPlusSoundPresets } from "./plusSoundPresets";
import { createKeyInputElement, TOGGLE_CHAT_KEY_INPUT_ELEMENT } from "./toggleChatKeyInput";

export const createTitle = (text, style) => {
  var modalBody = document.getElementById("settingsBody");
  var p = document.createElement("h3");
  p.className = "settings-modalContentTitle";
  p.textContent = text;
  if (style) for (var i in style) p.style[i] = style[i];
  modalBody.appendChild(p);
};

export const createCheckbox = (varName, displayName) => {
  var modalBody = document.getElementById("settingsBody");
  var box = document.createElement("input");
  box.type = "checkbox";
  box.id = varName;
  box.checked = Config()[varName];
  box.className = "settings-modalCheckbox";
  box.addEventListener("change", () => {
    Config().set(varName, box.checked);
  });
  var label = document.createElement("label");
  label.htmlFor = varName;
  label.textContent = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(label);
  div.appendChild(box);

  modalBody.appendChild(div);
};

export const createTextInput = (varName, displayName) => {
  var modalBody = document.getElementById("settingsBody");
  var box = document.createElement("input");
  box.type = "text";
  box.id = varName;
  box.value = Config()[varName];
  box.className = "settings-modalTextbox";
  box.addEventListener("change", () => {
    Config().set(varName, box.value);
  });
  var label = document.createElement("label");
  label.htmlFor = varName;
  label.textContent = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(label);
  div.appendChild(box);

  modalBody.appendChild(div);
};

export const createResetButton = (toReset, displayName) => {
  let vars = toReset;
  if (!Array.isArray(toReset)) vars = [toReset];
  var modalBody = document.getElementById("settingsBody");
  var button = document.createElement("button");
  button.addEventListener("click", () => {
    vars.forEach((varName) => {
      Config().reset(varName);
      let el = document.getElementById(varName);
      if (el.type == "checkbox") {
        el.checked = Config()[varName];
      } else {
        el.value = Config()[varName];
      }
      el.dispatchEvent(new Event("change", { value: el.value }));
    });
  });
  button.textContent = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(button);

  modalBody.appendChild(div);
};

export const createTextArea = (varName, displayName) => {
  var modalBody = document.getElementById("settingsBody");
  var box = document.createElement("textarea");
  box.id = varName;
  box.value = Config()[varName];
  box.className = "settings-modalTextarea";
  box.addEventListener("change", () => {
    Config().set(varName, box.value);
  });
  var label = document.createElement("label");
  label.htmlFor = varName;
  label.textContent = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(label);
  div.appendChild(box);

  modalBody.appendChild(div);
};

export const createHTML = (ele) => {
  var modalBody = document.getElementById("settingsBody");
  var p = document.createElement("div");
  if (typeof ele == "string") p.innerHTML = ele;
  else p.appendChild(ele);
  modalBody.appendChild(p);
};

export const createSliderInput = (varName, displayName, min = 0, max = 1, step = 0.05) => {
  var modalBody = document.getElementById("settingsBody");
  var slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.id = varName;
  slider.value = Config()[varName];
  slider.className = "settings-slider";
  var valueLabel = document.createElement("span");
  valueLabel.className = "settings-sliderValue";
  slider.addEventListener("change", () => {
    Config().set(varName, slider.value);
    valueLabel.textContent = Number.parseFloat(slider.value).toFixed(2);
  });
  valueLabel.textContent = Number.parseFloat(Config()[varName]).toFixed(2);

  var label = document.createElement("label");
  label.htmlFor = varName;
  label.textContent = displayName;

  var div = document.createElement("div");
  div.className = "settings-inputRow";
  div.appendChild(label);
  div.appendChild(slider);
  div.appendChild(valueLabel);

  modalBody.appendChild(div);
};

const generateBody = () => {
  createHTML(
    `<p class='settings-text'><a href="http://jeague.tali.software" class='settings-text'>About Jstris+</a></p>`
  );
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
  createResetButton(
    [
      "ENABLE_PLACE_BLOCK_ANIMATION",
      "PIECE_FLASH_LENGTH",
      "PIECE_FLASH_OPACITY",
      "ENABLE_LINECLEAR_ANIMATION",
      "LINE_CLEAR_LENGTH",
      "ENABLE_LINECLEAR_SHAKE",
      "LINE_CLEAR_SHAKE_STRENGTH",
      "LINE_CLEAR_SHAKE_LENGTH",
      "ENABLE_ACTION_TEXT",
    ],
    "Reset Visual Settings to Default"
  );

  createTitle("Customization Settings");

  createHTML(`<p class='settings-text'>Checkout the 
  <a target='_blank' href='https://docs.google.com/spreadsheets/d/1xO8DTORacMmSJAQicpJscob7WUkOVuaNH0wzkR_X194/htmlview#'>Jstris Customization Database</a>
  for a list of skins and backgrounds to use.</p>`);

  createTextInput("BACKGROUND_IMAGE_URL", "Background image url (blank for none)");

  fetchSkinPresets();
  createHTML(CUSTOM_SKIN_PRESET_ELEMENT);
  createTextInput("CUSTOM_SKIN_URL", "Custom block skin url (blank for regular skin)");
  createTextInput("CUSTOM_GHOST_SKIN_URL", "Custom ghost block skin url (blank for default)");
  createHTML(`<p class='settings-text'>(Turning off custom skin may require a refresh)</p>`);
  createCheckbox("ENABLE_REPLAY_SKIN", "Enable custom skins in replays (requires refresh)");
  createCheckbox("ENABLE_KEYBOARD_DISPLAY", "Enable keyboard overlay");

  createTitle("Audio settings");

  fetchPlusSoundPresets();
  createHTML(CUSTOM_PLUS_SOUND_PRESET_ELEMENT);
  createTextArea("CUSTOM_PLUS_SFX_JSON", "Data for custom plus SFX");
  createHTML(`<p class='settings-text' id='custom_plus_sfx_json_err'></p>`);

  createCheckbox("ENABLE_OPPONENT_SFX", "Enable opponent SFX");
  createSliderInput("OPPONENT_SFX_VOLUME_MULTPLIER", "Opponent SFX volume");
  createCheckbox("ENABLE_CUSTOM_SFX", "Enable custom SFX (turning off requires refresh)");
  createHTML(`<p class='settings-text'>(Turning off custom sounds may require a refresh)</p>`);
  createCheckbox("ENABLE_CUSTOM_VFX", "Enable custom spawn SFX (voice annotations)");
  createHTML(`<p class='settings-text'>(Custom SFX must be enabled for spawn SFX)</p>`);

  fetchSoundPresets();
  createHTML(CUSTOM_SOUND_PRESET_ELEMENT);
  createTextArea("CUSTOM_SFX_JSON", "Data for custom SFX");
  createHTML(`<p class='settings-text' id='custom_sfx_json_err'></p>`);

  createHTML(`<p class='settings-text'>Refer to the <a target="_blank" href="https://docs.google.com/document/d/1FaijL-LlBRnSZBbnQ2FUWxF9ktgoAQy0NnoHpjkXadE/edit#">guide</a> and the 
  <a target='_blank' href='https://docs.google.com/spreadsheets/d/1xO8DTORacMmSJAQicpJscob7WUkOVuaNH0wzkR_X194/htmlview#'>Jstris Customization Database</a>
  for custom SFX resources.`);

  createTitle("Custom stats settings");
  createCheckbox("ENABLE_STAT_APP", "Enable attack per piece stat (for all modes)");
  createCheckbox("ENABLE_STAT_PPD", "Enable pieces per downstack stat (100L cheese pace / 100) (for all modes)");
  createCheckbox("ENABLE_STAT_CHEESE_BLOCK_PACE", "Enable block pace stat for cheese race");
  createCheckbox("ENABLE_STAT_CHEESE_TIME_PACE", "Enable time pace stat for cheese race");
  createCheckbox("ENABLE_STAT_PPB", "Enable points per block stat for ultra");
  createCheckbox("ENABLE_STAT_SCORE_PACE", "Enable score pace for ultra");
  createCheckbox("ENABLE_STAT_PC_NUMBER", "Enable pc number indicator for pc mode");

  createTitle("Misc settings");
  createCheckbox("ENABLE_AUTOMATIC_REPLAY_CODES", "Enable automatic replay code saving on reset");
  createHTML(createKeyInputElement("UNDO_KEY", "keybind to undo moves in practice mode"));
  createCheckbox("ENABLE_CHAT_TIMESTAMPS", "Enable chat timestamps");
  createCheckbox("SHOW_MM_BUTTON", "Show matchmaking button");
  createCheckbox("SHOW_QUEUE_INFO", "Show matchmaking queue info");
  createHTML(createKeyInputElement("TOGGLE_CHAT_KEY", "Open chat with this button"));
  createHTML(createKeyInputElement("CLOSE_CHAT_KEY", "Close chat with this button"));
  createHTML(createKeyInputElement("SCREENSHOT_KEY", "Take a screenshot with this button"));
};

export const initModal = () => {
  // modal UI inject
  var modalButton = document.createElement("IMG");
  modalButton.src =
    "https://media.istockphoto.com/vectors/gear-icon-vector-illustration-vector-id857768248?k=6&m=857768248&s=170667a&w=0&h=p8E79IurGj0VrH8FO3l1-NXmMubUiShDW88xXynZpjE=";
  modalButton.className = "settings-modalOpenButton";

  var modalCloseButton = document.createElement("IMG");
  modalCloseButton.src =
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.onlinewebfonts.com%2Fsvg%2Fimg_324119.png&f=1&nofb=1";
  modalCloseButton.className = "settings-modalCloseButton";

  modalButton.addEventListener("click", () => {
    if (typeof $ == "function") $(window).trigger("modal-opened");
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
  header.textContent = "Jstris+ Settings";

  modalHeader.appendChild(header);
  modalHeader.appendChild(modalCloseButton);

  var modalBody = document.createElement("div");
  modalBody.id = "settingsBody";
  modalBody.className = "settings-modal-body";

  modal.appendChild(modalContent);
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);

  document.body.appendChild(modal);
  document.body.appendChild(modalButton);

  generateBody();
};
