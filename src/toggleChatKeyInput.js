import { Config } from "./config";

export const createKeyInputElement = (varName, desc) => {
  const TOGGLE_CHAT_KEY_INPUT_ELEMENT = document.createElement("div");
  TOGGLE_CHAT_KEY_INPUT_ELEMENT.className = "settings-inputRow";
  TOGGLE_CHAT_KEY_INPUT_ELEMENT.innerHTML += `<b>${desc}</b>`

  const inputDiv = document.createElement("div");
  const input = document.createElement("input");
  input.value = displayKeyCode(Config().TOGGLE_CHAT_KEYCODE);
  input.id = `${varName}_INPUT_ELEMENT`;

  input.addEventListener("keydown", e => {
    var charCode = (e.which) ? e.which : e.keyCode
    Config().set(varName, charCode);
    input.value = displayKeyCode(charCode);
    e.stopPropagation();
    e.preventDefault();
    return false;
  });
  input.addEventListener("keypress", () => false);
  const clearBtn = document.createElement("button");
  clearBtn.addEventListener("click", e => {
    Config().set(varName, null);
    input.value = displayKeyCode(null);
  })
  clearBtn.innerHTML = "Clear";

  input.style.marginRight = "5px";
  inputDiv.style.display = "flex";
  inputDiv.appendChild(input);
  inputDiv.appendChild(clearBtn);
  TOGGLE_CHAT_KEY_INPUT_ELEMENT.appendChild(inputDiv);

  return TOGGLE_CHAT_KEY_INPUT_ELEMENT;

}


// stolen from https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
export function displayKeyCode(charCode) {
  
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
