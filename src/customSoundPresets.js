import { Config } from "./config";

const FETCH_URL = "https://raw.githubusercontent.com/JstrisPlus/jstris-plus-assets/main/presets/soundPresets.json"

export let CUSTOM_SOUND_PRESETS = [];
export const fetchSoundPresets = () => {
  fetch(FETCH_URL, { cache: "reload" })
    .then(e => e.json())
    .then(j => {
      CUSTOM_SOUND_PRESETS = j;
      for (let i of CUSTOM_SOUND_PRESETS) {
        let option = document.createElement("option");
        option.value = JSON.stringify(i);
        option.innerHTML = i.name;
        dropdown.appendChild(option);
      }
    })
}

export const CUSTOM_SOUND_PRESET_ELEMENT = document.createElement("div");
CUSTOM_SOUND_PRESET_ELEMENT.className = "settings-inputRow";
CUSTOM_SOUND_PRESET_ELEMENT.innerHTML += "<b>Custom sound presets</b>"


const dropdown = document.createElement("select");
dropdown.innerHTML += "<option>Select...</option>";

dropdown.addEventListener("change", () => {
  document.getElementById("CUSTOM_SFX_JSON").value = dropdown.value;
  Config().set("CUSTOM_SFX_JSON", dropdown.value);

  dropdown.selectedIndex = 0;
})

CUSTOM_SOUND_PRESET_ELEMENT.appendChild(dropdown);

