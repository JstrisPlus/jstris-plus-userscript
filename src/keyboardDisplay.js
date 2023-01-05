import { Config } from './config';
export const initKeyboardDisplay = () => {
  const isGame = typeof Game != "undefined";
  const isReplayer = typeof Replayer != "undefined";

  if (!isGame && !isReplayer) return;

  const keyConfig = [
    [
      'new',
      null,
      {k: 'reset', l: 'F4'},
    ],
    [
      null
    ],
    [
      '180',
      'ccw',
      'cw',
      null,
      null,
      'hd',
    ],
    [
      null,
      null,
      {k: 'hold', l: 'HLD'},
      null,
      {k: 'left', l: 'L'},
      'sd',
      {k: 'right', l: 'R'}
    ]
  ];

  var kbhold = document.createElement("div");
  kbhold.id = "keyboardHolder";

  if (!Config().ENABLE_KEYBOARD_DISPLAY)
    kbhold.classList.add('hide-kbd-display')
  Config().onChange("ENABLE_KEYBOARD_DISPLAY", val => {
    if (val) {
      kbhold.classList.remove('hide-kbd-display')
    } else {
      kbhold.classList.add('hide-kbd-display')
    }
  })
  document.getElementById("stage").appendChild(kbhold);
  
  

  let keyTable = `
    <div id="kbo">
      <div id="kps"></div>
      <table class="tg">
  `;

  for (const row of keyConfig) {
    keyTable += `<tr>`;

    for (const key of row) {
      let isKey = key != null;
      let label = "";
      let cssClass = "kbnone";

      if (isKey) {
        label = typeof key == 'string'? key.toUpperCase() : key.l;
        cssClass = "kbkey kbd-" + (typeof key == 'string'? key.toLowerCase() : key.k);
      }

      keyTable += `<td class="${cssClass}">${label}</td>`;
    }

    keyTable += `</tr>`;
  }

  keyTable += `
      </table>
    </div>
  `;

  keyboardHolder.innerHTML = keyTable;
  let setKey = function(key, type) {
    for (const td of document.getElementsByClassName(`kbd-${key}`)) {
      td.style.backgroundColor = ["", "lightgoldenrodyellow"][type];
    }
  }

  if (isGame) {
    let oldReadyGo = Game.prototype.readyGo;
    Game.prototype.readyGo = function() {
      Game['set2ings'] = this.Settings.controls;
      return oldReadyGo.apply(this, arguments);
    }

    let oldUpdateTextBar = Game.prototype.updateTextBar;
    Game.prototype.updateTextBar = function() {
      let val = oldUpdateTextBar.apply(this, arguments);
      kps.innerHTML = 'KPS: ' + (this.getKPP() * this.placedBlocks / this.clock).toFixed(2);
      return val;
    }

    let press = function (e) {
      if (typeof Game.set2ings == 'undefined') return;

      let i = Game.set2ings.indexOf(e.keyCode);
      if (i == -1) return;

      let key = ['left', 'right', 'sd', 'hd', 'ccw', 'cw', 'hold', '180', 'reset', 'new'][i];
      setKey(key, +(e.type == "keydown"))
    }

    document.addEventListener('keydown', press);
    document.addEventListener('keyup', press);

  } else if (isReplayer) {
    var url = window.location.href.split("/")

    if (!url[2].endsWith("jstris.jezevec10.com")) return;
    if (url[3] != "replay") return;
    if (url[4] == "1v1") {
      kbhold.classList.add("really-hide-kbd-display");
      return;
    }

    let L;

    let fetchURL = "https://"+url[2]+"/replay/data?id="+url[(L=url[4]=="live")+4]+"&type="+(L?1:0);
    /*
    if(url[4] == "live"){
      fetchURL = "https://"+url[2]+"/replay/data?id=" + url[5] + "&type=1"
    } else {
      fetchURL = "https://"+url[2]+"/replay/data?id=" + url[4] + "&type=0"
    }
    */

    //fetch(`https://${url[2]}/replay/data?id=${url.length == 6? (url[5] + "&live=1") : url[4]}&type=0`)
    fetch(fetchURL)
      .then(res => res.json())
      .then(json => {
        if (!json.c)
          return;
        let das = json.c.das;

        Replayer.setKey = setKey;

        let oldPlayUntilTime = Replayer.prototype.playUntilTime
        Replayer.prototype.playUntilTime = function() {
          
          kps.innerHTML = 'KPS: ' + (this.getKPP() * this.placedBlocks / this.clock * 1000).toFixed(2);

          if (this.ptr == 0) Replayer.lastPtr = -1;

          this.kbdActions = [];

          for (let i = 0; i < this.actions.length; i++) {
            let o = {a: this.actions[i].a, t: this.actions[i].t};

            if (o.a == 2 || o.a == 3) {
              o.a -= 2;
              for (let j = i - 1; j >= 0; j--) {
                if (this.kbdActions[j].a < 2) {
                  this.kbdActions[j].a += 2;
                  break;
                }
              }
            }

            this.kbdActions.push(o);
          }

          let pressKey = function(key, type) {
            Replayer.setKey(key, Math.min(type, 1));

            if (type == 2) {
              setTimeout(x => Replayer.setKey(key, 0), das * 3 / 5)
            }
          };
          
          let val = oldPlayUntilTime.apply(this, arguments);
          
          if (this.ptr != Replayer.lastPtr && this.ptr - 1 < this.kbdActions.length) {
            var highlight = [
              ["left", 2],
              ["right", 2],
              ["left", 1],
              ["right", 1],
              ["ccw", 2],
              ["cw", 2],
              ["180", 2],
              ["hd", 2],
              ["sd", 2],
              null,
              ["hold", 2]
            ][this.kbdActions[this.ptr - 1].a];

            if (highlight) {
              pressKey(...highlight)
            }
          }

          Replayer.lastPtr = this.ptr;

          return val;
        };
      });
  }
}