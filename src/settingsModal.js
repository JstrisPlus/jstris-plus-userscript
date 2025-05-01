import { Config } from "./config";
import { CUSTOM_SKIN_PRESET_ELEMENT, fetchSkinPresets } from "./customSkinPresets";
import { CUSTOM_SOUND_PRESET_ELEMENT, fetchSoundPresets } from "./customSoundPresets";
import { CUSTOM_PLUS_SOUND_PRESET_ELEMENT, fetchPlusSoundPresets } from "./plusSoundPresets";
import { createKeyInputElement, TOGGLE_CHAT_KEY_INPUT_ELEMENT } from "./toggleChatKeyInput";

const GEAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 15 15"><path fill="currentColor" fill-rule="evenodd" d="M7.07.65a.85.85 0 0 0-.828.662l-.238 1.05q-.57.167-1.08.448l-.91-.574a.85.85 0 0 0-1.055.118l-.606.606a.85.85 0 0 0-.118 1.054l.574.912q-.28.509-.447 1.079l-1.05.238a.85.85 0 0 0-.662.829v.857a.85.85 0 0 0 .662.829l1.05.238q.166.57.448 1.08l-.575.91a.85.85 0 0 0 .118 1.055l.607.606a.85.85 0 0 0 1.054.118l.911-.574q.51.28 1.079.447l.238 1.05a.85.85 0 0 0 .829.662h.857a.85.85 0 0 0 .829-.662l.238-1.05q.57-.166 1.08-.447l.911.574a.85.85 0 0 0 1.054-.118l.606-.606a.85.85 0 0 0 .118-1.054l-.574-.911q.282-.51.448-1.08l1.05-.238a.85.85 0 0 0 .662-.829v-.857a.85.85 0 0 0-.662-.83l-1.05-.237q-.166-.57-.447-1.08l.574-.91a.85.85 0 0 0-.118-1.055l-.606-.606a.85.85 0 0 0-1.055-.118l-.91.574a5.3 5.3 0 0 0-1.08-.448l-.239-1.05A.85.85 0 0 0 7.928.65zM4.92 3.813a4.5 4.5 0 0 1 1.795-.745L7.071 1.5h.857l.356 1.568a4.5 4.5 0 0 1 1.795.744l1.36-.857l.607.606l-.858 1.36c.37.527.628 1.136.744 1.795l1.568.356v.857l-1.568.355a4.5 4.5 0 0 1-.744 1.796l.857 1.36l-.606.606l-1.36-.857a4.5 4.5 0 0 1-1.795.743L7.928 13.5h-.857l-.356-1.568a4.5 4.5 0 0 1-1.794-.744l-1.36.858l-.607-.606l.858-1.36a4.5 4.5 0 0 1-.744-1.796L1.5 7.93v-.857l1.568-.356a4.5 4.5 0 0 1 .744-1.794L2.954 3.56l.606-.606zM9.026 7.5a1.525 1.525 0 1 1-3.05 0a1.525 1.525 0 0 1 3.05 0m.9 0a2.425 2.425 0 1 1-4.85 0a2.425 2.425 0 0 1 4.85 0" clip-rule="evenodd"/></svg>
`

const X_SVG = `
<svg fill="#000000" width="30" height="30" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 14.545L1.455 16 8 9.455 14.545 16 16 14.545 9.455 8 16 1.455 14.545 0 8 6.545 1.455 0 0 1.455 6.545 8z" fill="#333" fill-rule="evenodd"/>
</svg>
`

export const createTitle = (text, style) => {
  var modalBody = document.getElementById("settingsBody");
  var p = document.createElement("h3");
  p.className = "settings-modalContentTitle";
  p.textContent = text;
  if (style)
    for (var i in style)
      p.style[i] = style[i];
  modalBody.appendChild(p);
}

export const createCheckbox = (varName, displayName) => {
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

export const createTextInput = (varName, displayName) => {
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

export const createResetButton = (toReset, displayName) => {
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

export const createTextArea = (varName, displayName) => {
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


export const createHTML = (ele) => {
  var modalBody = document.getElementById("settingsBody");
  var p = document.createElement("div");
  if (typeof ele == "string")
    p.innerHTML = ele;
  else
    p.appendChild(ele);
  modalBody.appendChild(p);
}

export const createSliderInput = (varName, displayName, min = 0, max = 1, step = 0.05) => {
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
  createHTML(`<p class='settings-text'><a href="http://jeague.tali.software" class='settings-text'>About Jstris+</a></p>`)
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

  fetchPlusSoundPresets();
  createHTML(CUSTOM_PLUS_SOUND_PRESET_ELEMENT)
  createTextArea("CUSTOM_PLUS_SFX_JSON", "Data for custom plus SFX");
  createHTML(`<p class='settings-text' id='custom_plus_sfx_json_err'></p>`);

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
  createSliderInput("OVERSTACK_COLUMN", "Well column for overstack counter", 0, 9, 1);
  createSliderInput("PARITY_COLUMN", "Well column for local parity", -1, 9, 1);

  createTitle("Misc settings");
  createCheckbox("ENABLE_AUTOMATIC_REPLAY_CODES", "Enable automatic replay code saving on reset");
  createHTML(createKeyInputElement("UNDO_KEYCODE", "keybind to undo moves in practice mode"));
  createCheckbox("ENABLE_CHAT_TIMESTAMPS", "Enable chat timestamps");
  createCheckbox("SHOW_MM_BUTTON", "Show matchmaking button");
  createCheckbox("SHOW_QUEUE_INFO", "Show matchmaking queue info");
  createHTML(createKeyInputElement("TOGGLE_CHAT_KEYCODE", "Open chat with this button"));
  createHTML(createKeyInputElement("CLOSE_CHAT_KEYCODE", "Close chat with this button"));
  createHTML(createKeyInputElement("SCREENSHOT_KEYCODE", "Take a screenshot with this button"));
}

export const initModal = () => {


  // modal UI inject
  var modalButton = document.createElement("div");
  modalButton.innerHTML = GEAR_SVG;
  modalButton.className = "settings-modalOpenButton";

  var modalCloseButton = document.createElement("div");
  modalCloseButton.innerHTML = X_SVG;
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