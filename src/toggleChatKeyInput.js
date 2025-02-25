import { Config } from "./config";

export const createKeyInputElement = (varName, desc) => {
  const TOGGLE_CHAT_KEY_INPUT_ELEMENT = document.createElement("div");
  TOGGLE_CHAT_KEY_INPUT_ELEMENT.className = "settings-inputRow";
  TOGGLE_CHAT_KEY_INPUT_ELEMENT.innerHTML += `<b>${desc}</b>`;

  const inputDiv = document.createElement("div");
  const input = document.createElement("input");
  input.value = displayKey(Config().varName);
  input.id = `${varName}_INPUT_ELEMENT`;

  input.addEventListener("keydown", (e) => {
    let key = e.code;
    Config().set(varName, key);
    input.value = displayKey(key);
    e.stopPropagation();
    e.preventDefault();
    return;
  });
  input.addEventListener("keypress", () => false);
  const clearBtn = document.createElement("button");
  clearBtn.addEventListener("click", (e) => {
    Config().set(varName, null);
    input.value = displayKey(null);
  });
  clearBtn.textContent = "Clear";

  input.style.marginRight = "5px";
  inputDiv.style.display = "flex";
  inputDiv.appendChild(input);
  inputDiv.appendChild(clearBtn);
  TOGGLE_CHAT_KEY_INPUT_ELEMENT.appendChild(inputDiv);

  return TOGGLE_CHAT_KEY_INPUT_ELEMENT;
};

export function displayKey(key) {
  if (key == null) {
    return "<enter a key>";
  }
  switch (key) {
    case "ShiftLeft":
      return "Left Shift";
    case "ShiftRight":
      return "Right Shift";
    case "ControlLeft":
      return "Left Ctrl";
    case "ControlRight":
      return "Right Ctrl";
    case "AltLeft":
      return "Left Alt";
    case "AltRight":
      return "Right Alt";
    case "MetaLeft":
      return "Left Win";
    case "MetaRight":
      return "Right Win";
    case "PageUp":
      return "Page Up";
    case "PageDown":
      return "Page Down";
    case "Backquote":
      return "`";
    case "Minus":
      return "-";
    case "Equal":
      return "=";
    case "BracketLeft":
      return "[";
    case "BracketRight":
      return "]";
    case "Backslash":
      return "\\";
    case "Semicolon":
      return ";";
    case "Quote":
      return "'";
    case "Comma":
      return ",";
    case "Period":
      return ".";
    case "Slash":
      return "/";
    case "ArrowLeft":
      return "Left Arrow";
    case "ArrowRight":
      return "Right Arrow";
    case "ArrowUp":
      return "Up Arrow";
    case "ArrowDown":
      return "Down Arrow";
    default: {
      if (key.startsWith("Numpad")) {
        let trimmedKey = key.substring(6);
        switch (trimmedKey) {
          case "Add":
            return "Numpad +";
          case "Subtract":
            return "Numpad -";
          case "Multiply":
            return "Numpad *";
          case "Divide":
            return "Numpad /";
          default:
            return `Numpad ${trimmedKey}`;
        }
      }
      if (key.startsWith("Digit")) return key.substring(5);
      if (key.startsWith("Key")) return key.substring(3);
      return key;
    }
  }
}
