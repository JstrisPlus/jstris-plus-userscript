import { Config } from "./config"

const changeBG = link => {
  console.log("Changing BG to "+link);
  var app = document.getElementById("BG_only");
  app.style.backgroundImage = `url(${link})`;
  app.style.backgroundSize = 'cover'
}

export const initLayout = () => {
  changeBG(Config().BACKGROUND_IMAGE_URL)
  Config().onChange("BACKGROUND_IMAGE_URL", val => {
    changeBG(val);
  });
  console.log("Layout loaded.");
}