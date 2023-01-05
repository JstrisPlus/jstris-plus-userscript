import { Config } from "./config";
import { displayKeyCode } from "./toggleChatKeyInput";



let game = null;

export const initChat = () => {
  'use strict';

  // === show or hide chat timestamps code ===
  // showing timestamp logic is in css
  if (Config().ENABLE_CHAT_TIMESTAMPS)
    document.body.classList.add("show-chat-timestamps");
  Config().onChange("ENABLE_CHAT_TIMESTAMPS", val => {
    if (val) {
      document.body.classList.add("show-chat-timestamps");
    } else {
      document.body.classList.remove("show-chat-timestamps");
    }
  })

  const oldReadyGo = Game.prototype.readyGo;
  Game.prototype.readyGo = function() {
    game = this;
    return oldReadyGo.apply(this, arguments);
  }

  // === toggle chat button code ===

  document.getElementById("TOGGLE_CHAT_KEYCODE_INPUT_ELEMENT").value = displayKeyCode(Config().TOGGLE_CHAT_KEYCODE);
  document.getElementById("CLOSE_CHAT_KEYCODE_INPUT_ELEMENT").value = displayKeyCode(Config().CLOSE_CHAT_KEYCODE);

  // thanks justin https://greasyfork.org/en/scripts/423192-change-chat-key
  document.addEventListener("keydown", e => {
    var charCode = (e.which) ? e.which : e.keyCode
    if (charCode == Config().TOGGLE_CHAT_KEYCODE) {
        if (game && game.focusState !== 1) { // game already focused, unfocus
          game.setFocusState(1);
          setTimeout(function() {game.Live.chatInput.focus()}, 0) // setTimeout to prevent the key from being typed

        // if keys are same, should close chat in this case
        } else if (Config().CLOSE_CHAT_KEYCODE == Config().TOGGLE_CHAT_KEYCODE) { 
          document.getElementsByClassName("layer mainLayer gfxLayer")[0].click();
          document.getElementsByClassName("layer mainLayer gfxLayer")[0].focus();

        }
    } else if (charCode == Config().CLOSE_CHAT_KEYCODE) { // focus game
      document.getElementsByClassName("layer mainLayer gfxLayer")[0].click();
      document.getElementsByClassName("layer mainLayer gfxLayer")[0].focus();
    }
  });

  // === emote code ===

  let CUSTOM_EMOTES = [
    {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/Cheese.png",
      t: "qep",
      g: "Jstris+",
      n: "MrCheese"
    }, {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/Cat.png",
      t: "jermy",
      g: "Jstris+",
      n: "CatUp"
    }, {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/Freg.png",
      t: "frog",
      g: "Jstris+",
      n: "FrogSad"
    }, {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/freycat.webp",
      t: "frey",
      g: "Jstris+",
      n: "freycat"
    }, {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/Blahaj.png",
      t: "jermy",
      g: "Jstris+",
      n: "StarHaj"
    }
    , {
      u: "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/ThisIsFine.png",
      t: "jermy",
      g: "Jstris+",
      n: "fine"
    }
  ]
  let chatListener = Live.prototype.showInChat
  Live.prototype.showInChat = function () {
    let zandria = arguments[1]

    if (typeof zandria == "string") {
      zandria = zandria.replace(/:(.*?):/g, function (match) {
        let cEmote = null
        for (let emote of CUSTOM_EMOTES) {
          if (emote.n == match.split(':')[1]) {
            cEmote = emote
            break
          }
        }
        if (cEmote) {
          return `<img src='${cEmote.u}' class='emojiPlus' alt=':${cEmote.n}:'>`
        }
        return match
      });
    }
    arguments[1] = zandria
    let val = chatListener.apply(this, arguments)
    // Add Timestamps
    var s = document.createElement("span");
    s.className = 'chat-timestamp';
    s.innerHTML = "[" + new Date().toTimeString().slice(0, 8) + "] ";
    var c = document.getElementsByClassName("chl");
    c[c.length - 1].prepend(s);

    return val
  }
  ChatAutocomplete.prototype.loadEmotesIndex = function (_0xd06fx4) {
    if (!this.moreEmotesAdded) {
      var brentson = new XMLHttpRequest,
        terrilynne = "/code/emotes?";
      brentson.timeout = 8e3,
        brentson.open("GET", terrilynne, true);
      try {
        brentson.send();
      } catch (bleu) { };
      var areeg = this;
      brentson.ontimeout = function () { },
        brentson.onerror = brentson.onabort = function () { },
        brentson.onload = function () {
          if (200 === brentson.status) {
            let zakeriah = JSON.parse(brentson.responseText);
            for (let emote of CUSTOM_EMOTES) {
              zakeriah.unshift(emote)
            }
            null !== areeg.preProcessEmotes && (zakeriah = areeg.preProcessEmotes(zakeriah)),
              areeg.addEmotes(zakeriah),
              null !== areeg.onEmoteObjectReady && areeg.onEmoteObjectReady(zakeriah);
          }
        };
    }
  }
  EmoteSelect.prototype.initializeContainers = function () {
    console.log(this.groupEmotes["Jstris+"] = "https://raw.githubusercontent.com/freyhoe/Jstris-/main/emotes/freycat.webp")
    this.searchElem = document.createElement("form"), this.searchElem.classList.add("form-inline", "emoteForm"), this.emoteElem.appendChild(this.searchElem), this.searchBar = document.createElement("input"), this.searchBar.setAttribute("autocomplete", "off"), this.searchBar.classList.add("form-control"), this.searchBar.id = "emoteSearch", this.searchBar.addEventListener("input", () => {
      this.searchFunction(this.emoteList);
    }), this.searchElem.addEventListener("submit", kesean => {
      kesean.preventDefault();
    }), this.searchBar.setAttribute("type", "text"), this.searchBar.setAttribute("placeholder", "Search Emotes"), this.searchElem.appendChild(this.searchBar), this.optionsContainer = document.createElement("div"), this.optionsContainer.classList.add("optionsContainer"), this.emoteElem.appendChild(this.optionsContainer), this.emotesWrapper = document.createElement("div"), this.emotesWrapper.classList.add("emotesWrapper"), this.optionsContainer.appendChild(this.emotesWrapper);
  }
  ChatAutocomplete.prototype.processHint = function (ylario) {

    var maizah = ylario[0].toLowerCase(),
      cahlin = ylario[1];
    if ("" !== this.prfx && (null === maizah || maizah.length < this.minimalLengthForHint || maizah[0] !== this.prfx)) {
      hideElem(this.hintsElem);
    } else {
      bertile = bertile;
      var maiesha = maizah.substring(this.prfx.length),
        bertile = this.prefixInSearch
          ? maizah
          : maiesha,
        cinque = 0,
        dyllan = "function" == typeof this.hints
          ? this.hints()
          : this.hints;
      this.hintsElem.innerHTML = "";
      var roey = [],
        tishie = [];
      for (var cedrik in dyllan) {
        var catenia = (shawnteria = dyllan[cedrik]).toLowerCase();
        catenia.startsWith(bertile)
          ? roey.push(shawnteria)
          : maiesha.length >= 2 && catenia.includes(maiesha) && tishie.push(shawnteria);
      };
      if (roey.sort(), roey.length < this.maxPerHint) {
        tishie.sort();
        for (const ajitesh of tishie) {
          if (-1 === roey.indexOf(ajitesh) && (roey.push(ajitesh), roey.length >= this.maxPerHint)) {
            break;
          }
        }
      };
      for (var shawnteria of roey) {
        var vidhu = document.createElement("div");
        if (this.hintsImg && this.hintsImg[shawnteria]) {
          vidhu.className = "emHint";
          var cebria = document.createElement("img");
          let cEmote = null
          for (let emote of CUSTOM_EMOTES) {
            if (emote.n == shawnteria.split(':')[1]) {
              cEmote = emote
              break
            }
          }
          if (cEmote) {
            cebria.src = cEmote.u
          } else {
            cebria.src = CDN_URL("/" + this.hintsImg[shawnteria])
          }
          vidhu.appendChild(cebria);
          var wael = document.createElement("div");
          wael.textContent = shawnteria,
            vidhu.appendChild(wael);
        } else {
          vidhu.innerHTML = shawnteria;
        };
        vidhu.dataset.pos = cahlin,
          vidhu.dataset.str = shawnteria;
        var yolandi = this;
        if (vidhu.addEventListener("click", function (dennies) {
          for (var ajane = yolandi.inp.value, delanei = parseInt(this.dataset.pos), xila = ajane.substring(0, delanei), neng = xila.indexOf(" "), marshelia = neng + 1; -1 !== neng;) {
            -1 !== (neng = xila.indexOf(" ", neng + 1)) && (marshelia = neng + 1);
          };
          yolandi.prefixInSearch || ++marshelia,
            yolandi.inp.value = ajane.substring(0, marshelia) + this.dataset.str + " " + ajane.substring(delanei),
            yolandi.inp.focus(),
            yolandi.setCaretPosition(delanei + this.dataset.str.length + 1 - (delanei - marshelia)),
            hideElem(yolandi.hintsElem),
            yolandi.wipePrevious && (yolandi.inp.value = this.dataset.str, yolandi.onWiped && yolandi.onWiped(this.dataset.str));
        }, false), this.hintsElem.appendChild(vidhu), ++cinque >= this.maxPerHint) {
          break;
        }
      };
      this.setSelected(0),
        cinque
          ? showElem(this.hintsElem)
          : hideElem(this.hintsElem);
    }
  }
  console.log("JSTRIS+ EMOTES LOADED")
}
