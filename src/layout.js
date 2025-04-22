import { Config } from "./config"

const createBGElement = () => {
  const ele = document.createElement("div");
  ele.id = "JS_PLUS_BG_ELEMENT";
  ele.style = "z-index: -100; position: absolute; height: max(100%, 100vh); width: 100%; top: 0px; left: 0px; background-size: cover;";
  document.body.appendChild(ele)
  return ele;
}

const changeBG = link => {
  console.log("Changing BG to " + link);
  document.body.style.position = "relative"
  var app = document.getElementById("JS_PLUS_BG_ELEMENT") ?? createBGElement();
  app.style.backgroundImage = `url(${link})`;
}

export const initLayout = () => {
  changeBG(Config().BACKGROUND_IMAGE_URL)
  Config().onChange("BACKGROUND_IMAGE_URL", val => {
    changeBG(val);
  });
  console.log("Layout loaded.");
}