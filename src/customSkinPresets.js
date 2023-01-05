import { Config } from "./config";


const FETCH_URL = "https://raw.githubusercontent.com/freyhoe/Jstris-/main/presets/skinPresets.json";
export let CUSTOM_SKIN_PRESETS = [];
export const fetchSkinPresets = () => {
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


export const CUSTOM_SKIN_PRESET_ELEMENT = document.createElement("div");
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