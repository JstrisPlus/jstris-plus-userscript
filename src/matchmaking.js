import { Config } from "./config";
import { getPlayerName } from "./util";
import { notify, playSound } from "./util";
let ROOMBA = "JstrisPlus";

function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}
function addMatchesBtn(name) {
  for (let dropDown of document.getElementsByClassName("dropdown-menu")) {
    let found = false;
    let children = dropDown.children;
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (!child.children.length > 0) continue;
      if (child.children[0].href == "https://jstris.jezevec10.com/profile") {
        found = true;
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.style.color = "#ffb700";
        a.href = "https://jstris.jezevec10.com/matches/" + name + "?plus=true";
        a.textContent = "Matchmaking History";
        li.appendChild(a);
        dropDown.insertBefore(li, child.nextSibling);
        break;
      }
    }
    if (found) {
      break;
    }
  }
}
function createStatBlock(stats) {
  let statInfo = document.createElement("div");
  statInfo.className = "t-main";
  statInfo.style.flexWrap = "wrap";
  // statInfo.style.whiteSpace = "pre-wrap"
  for (const [key, value] of Object.entries(stats)) {
    let stat = document.createElement("div");
    stat.className = "t-itm";
    let desc = document.createElement("div");
    desc.className = "t-desc";
    desc.textContent = key;
    let val = document.createElement("div");
    val.className = "t-val";
    val.textContent = value;
    stat.appendChild(val);
    stat.appendChild(desc);
    statInfo.append(stat);
  }
  return statInfo;
}
const insertChatButtons = (sendMessage) => {
  let chatBox = document.getElementById("chatContent");
  let chatButtons = document.createElement("div");
  chatButtons.className = "mm-chat-buttons-container";
  let readyButton = document.createElement("button");
  readyButton.className = "mm-ready-button";
  readyButton.textContent = "Ready";
  chatButtons.prepend(readyButton);
  chatBox.appendChild(chatButtons);
  readyButton.addEventListener("click", () => {
    readyButton.disabled = true;
    setTimeout(() => {
      readyButton.disabled = false;
    }, 1000);
    sendMessage("!ready");
  });
  return (function (boundButtonsDiv) {
    return () => {
      try {
        document.getElementById("chatContent").removeChild(boundButtonsDiv);
      } catch (e) {
        //console.log(e);
        console.log("Ready button was already removed.");
      }
    };
  })(chatButtons); // do this to make sure that the returned kill callback is removing the correct div
};

export const initMM = () => {
  let HOST = "wss://jeague.tali.software/";
  let APIHOST = "https://jeague.tali.software/api/v1/";
  let readyKiller = null;
  // development server
  if (process.env.HOST == "dev") {
    APIHOST = "https://jeague-dev.tali.software/api/v1/";
    HOST = "wss://jeague-dev.tali.software/";
  }

  // local server
  if (process.env.HOST == "local") {
    APIHOST = "http://localhost:3000/api/v1/";
    HOST = "ws://localhost:3000";
    console.log("running on local");
  }

  let p = document.createElement("button");
  p.className = "mmButton";
  p.id = "queueButton";
  p.textContent = "Enter Matchmaking";
  const JEAGUE_VERSION = "UT99";
  let urlParts = window.location.href.split("/");
  if (typeof Live == "function") {
    let chatListener = Live.prototype.showInChat;
    let suppressChat = false;
    let nameListener = Live.prototype.getName;
    Live.prototype.getName = function () {
      if (arguments[0] && this.clients[arguments[0]] && this.clients[arguments[0]].name == ROOMBA) {
        return "[Matchmaking]";
      }
      let v = nameListener.apply(this, arguments);
      return v;
    };
    Live.prototype.showInChat = function () {
      if (suppressChat) return;
      let val = chatListener.apply(this, arguments);
      return val;
    };
    let responseListener = Live.prototype.handleResponse;
    Live.prototype.handleResponse = function () {
      let res = arguments[0];
      suppressChat = false;
      if (res.t == 6) {
        if (res.m == "<em>Room wins counter set to zero.</em>") {
          for (let client of Object.values(this.clients)) {
            if (client.name == ROOMBA) {
              suppressChat = true;
            }
          }
        }
      } else if (res.t == 2) {
        if (res.n == ROOMBA) {
          suppressChat = true;
          cc.style.display = "none";
        }
      } else if (res.t == 3) {
        if (this.clients[res.cid] && this.clients[res.cid].name == ROOMBA) {
          suppressChat = true;
          cc.style.display = "flex";
          if (readyKiller) {
            readyKiller();
          }
        }
      } else if (res.t == 4) {
        let found = false;
        if (res.players) {
          for (let key in res.players) {
            if (res.players[key].n == ROOMBA) {
              found = true;
              break;
            }
          }
        }
        if (res.spec) {
          for (let key in res.spec) {
            if (res.spec[key].n == ROOMBA) {
              found = true;
              break;
            }
          }
        }
        if (found) {
          cc.style.display = "none";
        } else {
          cc.style.display = "flex";
        }
      }
      let val = responseListener.apply(this, arguments);
      suppressChat = false;
      if (res.t == 12) {
        for (let gs of this.p.GS.slots) {
          gs.v.isKO = false;
          gs.v.KOplace = null;
        }
      }
      return val;
    };

    if (Config().SHOW_QUEUE_INFO) {
      document.body.classList.add("show-queue-info");
    }
    Config().onChange("SHOW_QUEUE_INFO", (val) => {
      if (val) {
        document.body.classList.add("show-queue-info");
      } else {
        document.body.classList.remove("show-queue-info");
      }
    });
    if (Config().SHOW_MM_BUTTON) {
      document.body.classList.add("show-mm-button");
    }
    Config().onChange("SHOW_MM_BUTTON", (val) => {
      if (val) {
        document.body.classList.add("show-mm-button");
      } else {
        document.body.classList.remove("show-mm-button");
      }
    });
    let queueinfo = document.createElement("div");
    queueinfo.className = "mmInfoContainer";
    queueinfo.textContent = "not connected to matchmaking";
    let cc = document.createElement("div");
    cc.className = "mmContainer";
    document.body.appendChild(cc);
    cc.prepend(queueinfo);
    let mmLoaded = false;
    let liveObj = null;
    let liveListener = Live.prototype.authorize;
    Live.prototype.authorize = function () {
      liveObj = this;
      let val = liveListener.apply(this, arguments);
      if (arguments[0] && arguments[0].token) {
        //loadMM(arguments[0].token);
        loadMM();
      }
      return val;
    };

    //function loadMM(token) {
    function loadMM() {
      if (mmLoaded) return;
      mmLoaded = true;
      document.addEventListener(
        "keyup",
        (evtobj) => {
          if (0 == liveObj.p.focusState) {
            if (evtobj.code == Config().SCREENSHOT_KEY) {
              liveObj.p.screenshot(APIHOST);
            }
          }
        },
        false
      );
      let name = liveObj.chatName;

      addMatchesBtn(liveObj.chatName);
      let CONNECTED = false;
      let ws = new WebSocket(HOST);
      console.log(`Attempting to connect to matchmaking host: ${HOST}`);

      window.JeagueSocket = ws;
      /*     let connectionListener = Live.prototype.onClose
           Live.prototype.onClose = function () {
             let val = connectionListener.apply(this, arguments)
             ws.close()
             status = UI_STATUS.offline
             updateUI()
             return val
           }*/
      let UI_STATUS = {
        idle: 0,
        queueing: 1,
        loading: 2,
        banned: 4,
        offline: 5,
      };
      let status = UI_STATUS.idle;
      let numQueue = 0;
      let numPlaying = 0;
      let numActive = 0;
      let HOVERING = false;

      let timeInQueue = 0;
      let timeInc = null;
      let toMMSS = function (sec_num) {
        let minutes = Math.floor(sec_num / 60);
        let seconds = sec_num - minutes * 60;
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        return "" + minutes + ":" + seconds;
      };
      let OFFLINED = false;
      function updateUI(msg) {
        if (OFFLINED) return;
        switch (status) {
          case UI_STATUS.queueing:
            if (HOVERING) {
              p.textContent = "Exit Matchmaking";
            } else {
              p.textContent = toMMSS(timeInQueue);
            }
            queueinfo.textContent = `[${numPlaying}]${numQueue} in queue\n${numActive} online`;
            break;
          case UI_STATUS.idle:
            p.textContent = "Enter Matchmaking";
            queueinfo.textContent = `[${numPlaying}]${numQueue} in queue\n${numActive} online`;
            break;
          case UI_STATUS.loading:
            p.textContent = "Loading";
            queueinfo.textContent = `[${numPlaying}]${numQueue} in queue\n${numActive} online`;
            break;
          case UI_STATUS.banned:
            queueinfo.style.minWidth = "1000px";
            queueinfo.textContent = "You Are Banned";
            p.remove();
            OFFLINED = true;
            break;
          case UI_STATUS.offline:
            OFFLINED = true;
            queueinfo.style.color = "#bcc8d4";
            queueinfo.className = "mmInfoContainer";
            queueinfo.textContent = "not connected to matchmaking";
            p.remove();
            break;
        }
        if (msg) {
          queueinfo.textContent = msg;
        }
      }

      function ping() {
        ws.send(JSON.stringify({ type: "ping" }));
      }

      function updateClock() {
        timeInQueue += 1;
        updateUI();
      }
      p.onmouseover = function () {
        HOVERING = true;
        p.style.color = "rgba(255,255,255,0.7)";
        updateUI();
      };
      p.onmouseout = function () {
        HOVERING = false;
        p.style.color = "rgba(255,255,255,1)";
        updateUI();
      };

      ws.onmessage = (event) => {
        let res = JSON.parse(event.data);
        if (res.type == "room") {
          status = UI_STATUS.idle;
          liveObj.p.GS.resetAll();
          liveObj.joinRoom(res.rid);
          console.log("found match at " + res.rid);
          playSound("READY");
          if (readyKiller) {
            readyKiller();
          }
          notify("Jstris+", "🚨Match Starting!");
          document.title = "🚨Match Starting!";
          setTimeout(() => {
            document.title = "Jstris";
          }, 2000);
          updateUI();
        } else if (res.type == "readyStart") {
          cc.style.display = "none";
          readyKiller = insertChatButtons((msg) =>
            ws.send(JSON.stringify({ type: "ready", rid: liveObj.rid, cid: liveObj.cid }))
          );
        } else if (res.type == "readyConfirm") {
          if (res.rid == liveObj.rid) {
            if (readyKiller) readyKiller();
          }
        } else if (res.type == "msg") {
          if (res.secret) {
            liveObj.showInChat("", `<em><b>${res.msg}</b></em>`);
          } else {
            liveObj.showInChat("[Matchmaking]", res.msg);
          }
        } else if (res.type == "accept") {
          timeInQueue = 0;
          clearInterval(timeInc);
          timeInc = setInterval(updateClock, 1000);
          status = UI_STATUS.queueing;
          updateUI();
        } else if (res.type == "decline") {
          if (res.shutdown) {
            alert("server preparing for an update");
          } else {
            alert("you are already in queue!");
          }
          status = UI_STATUS.idle;
          updateUI();
        } else if (res.type == "bans") {
          status = UI_STATUS.banned;
          let banmsg = "You are banned from matchmaking for:";
          console.log(res.bans);
          for (let ban of res.bans) {
            banmsg += ` ${ban.reason}; Expires: ${new Date(ban.timeout).toLocaleString()}`;
          }
          updateUI(banmsg);
        } else if (res.type == "removed") {
          status = UI_STATUS.idle;
          updateUI();
        } else if (res.type == "ping") {
          if (res.queue > 0) {
            queueinfo.style.color = "#1b998b";
          } else {
            queueinfo.style.color = "#bcc8d4";
          }
          numQueue = res.queue;
          numPlaying = res.playing;
          numActive = res.active;
          updateUI();
        } else if (res.type == "init") {
          CONNECTED = true;
          cc.prepend(p);
          status = UI_STATUS.idle;
          updateUI();
          console.log("JEAGUE LEAGUE CONNECTED");
        }
      };
      function powertipCallback(records) {
        records.forEach(function (record) {
          var list = record.addedNodes;
          var i = list.length - 1;

          for (; i > -1; i--) {
            if (list[i].className == "t-ftr" && list[i].firstChild) {
              let name = list[i].children[0].dataset.name;
              if (name) {
                let powerTipStat = list[i].parentNode;
                fetch(APIHOST + "stats/" + name).then((response) => {
                  if (response.status != 200) return;
                  response.json().then((res) => {
                    let mmHeader = document.createElement("div");
                    mmHeader.className = "t-titles";
                    let span = document.createElement("span");
                    span.textContent = "Matchmaking Stats";
                    mmHeader.appendChild(span);
                    powerTipStat.appendChild(mmHeader);
                    powerTipStat.appendChild(createStatBlock(res));
                  });
                });
              }
            }
          }
        });
      }

      var observer = new MutationObserver(powertipCallback);

      var targetNode = document.body;

      observer.observe(targetNode, { childList: true, subtree: true });

      let WSOPENED = false;
      ws.onopen = function (event) {
        WSOPENED = true;
        setInterval(ping, 10000);
        ws.send(JSON.stringify({ type: "init", name: name, version: JEAGUE_VERSION }));
        //ws.send(JSON.stringify({ type: "init", token: token, version: JEAGUE_VERSION }));
        p.onclick = function () {
          if (!CONNECTED) {
            return;
          }
          if (status == UI_STATUS.queueing) {
            status = UI_STATUS.loading;
            ws.send(JSON.stringify({ type: "disconnect" }));
          } else if (liveObj.connected) {
            status = UI_STATUS.loading;
            ws.send(JSON.stringify({ type: "connect" }));
          } else {
            alert("you are not connected to jstris");
          }
          updateUI();
        };
      };
      ws.onclose = function () {
        if (WSOPENED) {
          status = UI_STATUS.offline;
          updateUI("jstris+ server down");
        }
      };
    }
  } else if (urlParts[3] && urlParts[3] == "u" && urlParts[4]) {
    let nameHolders = document.getElementsByClassName("mainName");
    let mainName = "";
    if (nameHolders[0] && nameHolders[0].firstChild) {
      mainName = nameHolders[0].firstChild.textContent.trim();
    } else {
      return;
    }
    addMatchesBtn(mainName);
    let cc = document.getElementsByClassName("col-flex-bio col-flex")[0];
    let cc1 = document.getElementsByClassName("row-flex uProfileTop")[0];
    let a = document.createElement("a");
    a.href = "https://jstris.jezevec10.com/matches/" + mainName + "?plus=true";
    a.textContent = "Matchmaking History";
    a.className = "btn btn-default btn-sm";
    let img = document.createElement("img");
    img.src = "https://s.jezevec10.com/res/list.png";
    img.className = "btnIcn";
    img.style.float = "left";
    a.style.minWidth = "180px";
    a.style.textAlign = "left";
    a.prepend(img);
    a.style.backgroundColor = "#e74c3c";
    cc1.children[0].appendChild(a);
    fetch(APIHOST + "stats/" + mainName).then((response) => {
      if (response.status != 200) return;
      response.json().then((res) => {
        let playerInfo = document.createElement("div");
        playerInfo.className = "aboutPlayer";
        let statHeader = document.createElement("span");
        statHeader.className = "aboutTitle";
        statHeader.textContent = "Matchmaking Stats";
        playerInfo.appendChild(statHeader);
        playerInfo.appendChild(createStatBlock(res));
        cc.appendChild(playerInfo);
      });
    });
  } else if (urlParts[3] && urlParts[3] == "matches" && urlParts[4]) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get("plus")) return;

    let cc = document.getElementsByClassName("well")[0].parentNode;
    for (let child of cc.children) {
      cc.removeChild(child);
    }
    let loader = document.createElement("div");
    loader.className = "mmLoader";
    cc.prepend(loader);
    document.getElementsByClassName("well")[0].remove();
    let collapsible = document.createElement("button");
    collapsible.className = "mmCollapsible";
    collapsible.textContent = "Jstris+ Matches";
    let collapsibleCarrot = createElementFromHTML("<span class='caret'></span>");
    collapsible.appendChild(collapsibleCarrot);
    let matchView = document.createElement("div");
    matchView.className = "col-sm-12 mmMatches";
    collapsible.onclick = () => {
      if (matchView.style.display == "block") {
        matchView.style.display = "none";
      } else {
        matchView.style.display = "block";
      }
    };
    let name = decodeURI(urlParts[4]).split("?")[0];
    fetch(APIHOST + "matches/" + name).then((response) => {
      if (response.status != 200) {
        response.text().then((res) => {
          loader.remove();
          cc.textContent = res;
        });
        return;
      }
      response.json().then((res) => {
        let modal = document.createElement("div");
        let modalContent = document.createElement("div");
        let modalClose = document.createElement("span");
        let modalTable = document.createElement("table");
        modalClose.className = "mmClose";
        modalClose.textContent = "×";
        modalContent.appendChild(modalTable);
        modalContent.appendChild(modalClose);
        modal.className = "mmModal";
        modalContent.className = "mmModal-content";
        modal.append(modalContent);
        modalClose.onclick = function () {
          modal.style.display = "none";
        };

        modalTable.className = "table table-striped table-hover match-list";

        document.body.appendChild(modal);

        function loadGame(game, match) {
          const ALL_STATS = ["apm", "pps", "cheese", "apd", "time"];
          let table = modalContent.firstChild;
          while (table.firstChild) {
            table.removeChild(table.firstChild);
          }
          let aref = document.createElement("a");
          let apic = document.createElement("img");
          aref.style.position = "absolute";
          aref.style.left = "5px";
          aref.style.top = "5px";
          apic.src = "https://jstris.jezevec10.com/res/play.png";
          aref.appendChild(apic);
          aref.href = `/games/${game.gid}`;
          aref.target = "_blank";
          table.appendChild(aref);
          //   console.log(res)
          if (game.stats || game.altStats) {
            let thead = document.createElement("thead");
            let theadtr = document.createElement("tr");
            let spacer = document.createElement("th");
            spacer.colSpan = 1;
            theadtr.appendChild(spacer);
            for (let ss of ALL_STATS) {
              let stat = document.createElement("th");
              stat.className = "apm";
              stat.textContent = ss.toUpperCase();
              theadtr.appendChild(stat);
            }
            let tdate = document.createElement("th");
            thead.appendChild(theadtr);
            table.appendChild(thead);

            let body = document.createElement("tbody");
            table.appendChild(body);
            let winnerName = match.player;
            let loserName = match.player;
            if (!game.win) {
              winnerName = match.opponent;
            } else {
              loserName = match.opponent;
            }
            let players = [];
            if (game.stats) {
              players.push({ name: winnerName, stats: game.stats });
            }
            if (game.altStats) {
              players.push({ name: loserName, stats: game.altStats });
            }
            for (let match of players) {
              let tr = document.createElement("tr");
              let p1 = document.createElement("td");
              p1.className = "pl1";
              var ap1 = document.createElement("a");
              ap1.textContent = match.name;
              ap1.href = `/u/${match.name}`;
              p1.appendChild(ap1);
              tr.appendChild(p1);
              if (match.stats) {
                let sstats = {};
                for (let ss of ALL_STATS) {
                  sstats[ss] = "-";
                }
                for (const [key, value] of Object.entries(match.stats)) {
                  if (isNaN(parseFloat(value))) continue;
                  if (parseFloat(value) < 0) continue;
                  if (sstats[key]) {
                    sstats[key] = value;
                  }
                }
                for (let ss of ALL_STATS) {
                  let stat = document.createElement("td");
                  stat.className = "apm";
                  stat.textContent = sstats[ss];
                  tr.appendChild(stat);
                }
              } else {
                for (let i = 0; i < ALL_STATS.length; i++) {
                  let stat = document.createElement("td");
                  stat.className = "apm";
                  stat.textContent = "-";
                  tr.appendChild(stat);
                }
              }

              body.appendChild(tr);
            }
          }

          modal.style.display = "block";
        }
        console.log(res);
        const ALL_STATS = ["apm", "pps", "cheese", "apd", "time"];
        //   console.log(res)
        let table = document.createElement("table");
        table.className = "table table-striped table-hover match-list";
        let thead = document.createElement("thead");
        let theadtr = document.createElement("tr");
        let spacer = document.createElement("th");
        spacer.colSpan = 3;
        theadtr.appendChild(spacer);
        for (let ss of ALL_STATS) {
          let stat = document.createElement("th");
          stat.className = "apm";
          stat.textContent = ss.toUpperCase();
          theadtr.appendChild(stat);
        }
        let tdate = document.createElement("th");
        tdate.className = "date";
        tdate.textContent = "Date";
        let tgames = document.createElement("th");
        tgames.className = "date";
        tgames.textContent = "Games";
        theadtr.appendChild(tdate);
        theadtr.appendChild(tgames);
        thead.appendChild(theadtr);
        table.appendChild(thead);

        let body = document.createElement("tbody");
        table.appendChild(body);
        for (let match of res) {
          let tr = document.createElement("tr");
          let p1 = document.createElement("td");
          p1.className = "pl1";
          var ap1 = document.createElement("a");
          ap1.textContent = name;
          ap1.href = `/u/${name}`;
          p1.appendChild(ap1);
          tr.appendChild(p1);
          let sc = document.createElement("td");
          sc.className = "sc";
          let sM = document.createElement("span");
          sM.style.color = "#04AA6D";
          sM.className = "scoreMiddle";
          let switched = match.opponent == name;
          if (match.forced) {
            sM.textContent = "default";
            if (switched) {
              sM.textContent = "forfeit";
              sM.style.color = "#A90441";
            }
          } else {
            let wins = 0;
            let losses = 0;
            for (let game of match.games) {
              if (switched) {
                if (game.win) losses += 1;
                else {
                  wins += 1;
                }
              } else {
                if (!game.win) losses += 1;
                else {
                  wins += 1;
                }
              }
            }
            sM.textContent = `${wins} - ${losses}`;
            if (switched) {
              sM.style.color = "#A90441";
            }
          }
          sc.appendChild(sM);
          tr.appendChild(sc);
          let p2 = document.createElement("td");
          p2.className = "pl2";
          var ap2 = document.createElement("a");
          ap2.textContent = switched ? match.player : match.opponent;
          ap2.href = `/u/${switched ? match.player : match.opponent}`;
          p2.appendChild(ap2);
          tr.appendChild(p2);
          if (switched ? match.opponentStats : match.stats) {
            let sstats = {};
            for (let ss of ALL_STATS) {
              sstats[ss] = "-";
            }
            for (const [key, value] of Object.entries(switched ? match.opponentStats : match.stats)) {
              if (isNaN(parseFloat(value))) continue;
              if (parseFloat(value) < 0) continue;
              if (sstats[key]) {
                sstats[key] = value;
              }
            }
            for (let ss of ALL_STATS) {
              let stat = document.createElement("td");
              stat.className = "apm";
              stat.textContent = sstats[ss];
              tr.appendChild(stat);
            }
          } else {
            for (let i = 0; i < ALL_STATS.length; i++) {
              let stat = document.createElement("td");
              stat.className = "apm";
              stat.textContent = "-";
              tr.appendChild(stat);
            }
          }
          let date = document.createElement("td");
          date.className = "date";
          date.textContent = new Date(match.date).toLocaleDateString();
          tr.appendChild(date);
          let btns = document.createElement("td");
          if (match.games && match.games.length > 0) {
            btns.style.display = "flex";
            btns.style.justifyContent = "flex-end";
            if (match.games) {
              for (let m of match.games) {
                let btn = document.createElement("button");
                btn.className = "mm-button";
                btns.appendChild(btn);
                if (m.win == switched) {
                  btn.style.backgroundColor = "#A90441";
                }
                btn.onclick = function () {
                  loadGame(m, match);
                };
              }
            }
          } else {
            btns.className = "apm";
          }
          tr.appendChild(btns);
          body.appendChild(tr);
        }
        matchView.appendChild(table);
        let opponentFilter = document.createElement("input");
        opponentFilter.type = "text";
        opponentFilter.name = "opponent";
        opponentFilter.className = "form-control";
        opponentFilter.placeholder = "Username";
        opponentFilter.autocomplete = "off";
        opponentFilter.style.padding = "10px";
        opponentFilter.multiple = true;
        opponentFilter.onchange = (event) => {
          let raw_names = opponentFilter.value.split(" ");
          let names = [];
          for (let name of raw_names) {
            names.push(name.toLowerCase());
          }
          for (let i = 0; i < body.children.length; i++) {
            let child = body.children[i];
            for (let j = 0; j < child.children.length; j++) {
              let child2 = child.children[j];
              if (child2.className == "pl2") {
                if (child2.firstChild && names.includes(child2.firstChild.textContent.toLowerCase()))
                  child.style.display = "";
                else {
                  child.style.display = "none";
                }
                break;
              }
            }
          }
        };
        matchView.prepend(opponentFilter);
        cc.prepend(matchView);
        loader.remove();
        //              cc.prepend(collapsible)
      });
    });
  }
};
