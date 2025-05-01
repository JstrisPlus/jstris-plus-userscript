import { Config } from "./config"


const replaceBadValues = (n, defaultValue) => {
  // NaN check
  if (Number.isNaN(n) || !Number.isFinite(n))
    return defaultValue || 0;
  return n;

}

let stats = [];
const updateStats = function () {

  const index = this.ISGAME? 0 : parseInt(this.v.canvas.parentElement.getAttribute("data-index"));
  stats[index].forEach((stat) => {
    if (stat.enabled && stat.row) {
      if (stat.enabledMode && stat.enabledMode != this.pmode) {
        stat.row.style.display = "none";
        return;
      }
      stat.row.style.display = "table-row";
      var val = stat.calc(this);
      if (val == undefined) return;
      if (val == -999) { // key disappear the stat
        stat.row.style.display = "none";
        return;
      }
      if (stat.name == "Overstack") {
        if (val < 0) stat.row.style.color = "red";
        else if (val < 12) stat.row.style.color = "green";
        else if (val < 25) stat.row.style.color = "orange";
        else stat.row.style.color = "red";
      }
      stat.row.children[1].innerHTML = val;
    } else {
      stat.row.style.display = "none";
    }
  });
}
const initStat = (index, name, configVar, calc, options = {}) => {
  stats[index].push({
    name,
    calc,
    val: 0,
    enabled: Config()[configVar],
    initialValue: options.initialValue || 0,
    enabledMode: options.enabledMode || 0, // 0 = enabled for all modes 
  });
  Config().onChange(configVar, val => {
    for (var individualStats of stats)
      var stat = individualStats.find(e => e.name == name);
      stat.enabled = val;
  })
}

const initStat2 = (index, name, configVar, calc, options = {}) => {
  let column = Config()[configVar];
  stats[index].push({
    name,
    calc,
    val: 0,
    enabled: (column > 1 && column < 8),
    initialValue: options.initialValue || 0,
    enabledMode: options.enabledMode || 0, // 0 = enabled for all modes 
  });
  Config().onChange(configVar, val => {
    for (var individualStats of stats)
      var stat = individualStats.find(e => e.name == name);
      stat.enabled = val;
  })
}

export const initStats = () => {
  const stages = document.querySelectorAll("#stage");
  stages.forEach((stageEle, i) => {
    stageEle.setAttribute("data-index", i); 
    stats.push([]);
    initGameStats(stageEle, i);
  })

}
export const initGameStats = (stageEle, index) => {
  // these must be non-arrow functions so they can be bound
  initStat(index,"APP", "ENABLE_STAT_APP", game => replaceBadValues(game.gamedata.attack / game.placedBlocks).toFixed(3));
  initStat(index,"PPD", "ENABLE_STAT_PPD", game => replaceBadValues(game.placedBlocks / game.gamedata.garbageCleared).toFixed(3));

  initStat(index,"Block pace", "ENABLE_STAT_CHEESE_BLOCK_PACE", game => {
    let totalLines = game.ISGAME ? game["cheeseModes"][game["sprintMode"]] : game.initialLines;
    let linesLeft = game.linesRemaining
    let linesCleared = totalLines - linesLeft
    var piecePace = replaceBadValues((linesLeft / linesCleared) * game["placedBlocks"] + game["placedBlocks"])
    return (piecePace * 0 + 1) ? Math.floor(piecePace) : '0'
  }, { enabledMode: 3 });

  initStat(index,"Time pace", "ENABLE_STAT_CHEESE_TIME_PACE", game => {
    let totalLines = game.ISGAME ? game["cheeseModes"][game["sprintMode"]] : game.initialLines;
    let linesLeft = game.linesRemaining
    let linesCleared = totalLines - linesLeft;
    let time = game.ISGAME? game.clock : game.clock / 1000;
    var seconds = replaceBadValues((totalLines / linesCleared) * time);
    let m = Math.floor(seconds / 60)
    let s = Math.floor(seconds % 60)
    let ms = Math.floor((seconds % 1) * 100)
    return (m ? (m + ":") : '') + ("0" + s).slice(-2) + "." + ("0" + ms).slice(-2)
  }, { enabledMode: 3 });

  initStat(index,"PPB", "ENABLE_STAT_PPB", game => {
    var score = game["gamedata"]["score"];
    var placedBlocks = game["placedBlocks"];
    return replaceBadValues(score / placedBlocks).toFixed(2);
  }, { enabledMode: 0 });

  initStat2(index,"Chk_par_L", "PARITY_COLUMN", game => {
    let well_index = parseInt(Config()["PARITY_COLUMN"]);
    if (well_index == -1 || well_index == 0) return -999;

    let board = game["matrix"];

    let blacks = 0;
    let whites = 0;
    for (let row in board) {
        for (let col = 0; col < well_index; col++) {
            if (row % 2 == col % 2) {
                whites += board[row][col] != 0;
            } else {
                blacks += board[row][col] != 0;
            }
        }
    }
    for (let col = 0; col < game.deadline.length; col++) {
        if (col % 2 == 0) blacks += game.deadline[col] != 0;
        else whites += game.deadline[col] != 0;
    }
    let check = whites - blacks;

    return check;


  }, { enabledMode: 2 });

  initStat2(index,"Chk_par_R", "PARITY_COLUMN", game => {
    let well_index = parseInt(Config()["PARITY_COLUMN"]);
    if (well_index == -1 || well_index == 9) return -999;

    let board = game["matrix"];

    let blacks = 0;
    let whites = 0;
    for (let row in board) {
        for (let col = 9; col > well_index; col--) {
            if (row % 2 == col % 2) {
                whites += board[row][col] != 0;
            } else {
                blacks += board[row][col] != 0;
            }
        }
    }
    for (let col = 0; col < game.deadline.length; col++) {
        if (col % 2 == 0) blacks += game.deadline[col] != 0;
        else whites += game.deadline[col] != 0;
    }
    let check = whites - blacks;

    return check;


  }, { enabledMode: 2 });

  initStat2(index,"Overstack", "OVERSTACK_COLUMN", game => {
    let well_index = parseInt(Config()["OVERSTACK_COLUMN"]);
    if (well_index <= 1 || well_index >= 8) return -999;
    var placedBlocks = game["placedBlocks"];
    if (placedBlocks % 7 != 0) return undefined;

    let board = game["matrix"];

    let col = well_index + 1;
    let well_height_8 = 0;
    for (let row = 19; row >= 0; row--) {
        if (board[row][col] == 0) {
            well_height_8 = 20 - row;
            break;
        }
    }
    col = well_index - 1;
    let well_height_6 = 0;
    for (let row = 19; row >= 0; row--) {
        if (board[row][col] == 0) {
            well_height_6 = 20 - row;
            break;
        }
    }

    let well_height = Math.max(well_height_6,well_height_8) + Math.abs(well_height_6-well_height_8) * 2 / 5;
    // incredibl
    // console.log(well_height_8, well_height_6, well_height);

    // now determine stacc height

    let num_minoes = 0;
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (Math.abs(col - well_index) > 2) { // define columns within 2 of the well to be part of well
          if (board[row][col] != 0) num_minoes++;
        }
      }
    }

    let overstacc = num_minoes - well_height * 5;

    // if (game["blockInHold"]!= null && game["blockInHold"].id == 2) overstacc -= 10; // if you still have the T piece in hold

    return overstacc;

  }, { enabledMode: 2 });

  initStat(index,"Score pace", "ENABLE_STAT_SCORE_PACE", game => {
    var score = game["gamedata"]["score"];
    let time = game.ISGAME? game.clock : game.clock / 1000;
    return replaceBadValues(score + score / time * (120 - time)).toFixed(0);
  }, { enabledMode: 5 });

  initStat(index,"PC #", "ENABLE_STAT_PC_NUMBER", game => {
    let suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th'];
    let pcs = game.gamedata.PCs;
    
    if (!game.PCdata)
      return "1st";
    var blocks = game.placedBlocks - game.PCdata.blocks;
    let pcNumber = ((pcs + 1 + 3 * ((10 * pcs - blocks) / 5)) % 7) || 7;
    pcNumber = replaceBadValues(pcNumber, 1);
    if (!Number.isInteger(pcNumber))
      return "";
    return pcNumber + suffixes[pcNumber];
  }, { enabledMode: 8 });

  const statsTable = document.createElement("TABLE");
  statsTable.className = 'stats-table'
  //document.getElementById("stage").appendChild(statsTable);
  stageEle.appendChild(statsTable);

  stats[index].forEach(stat => {
    const row = document.createElement('tr');
    row.style.display = "none";
    const name = document.createElement('td');
    name.innerHTML = stat.name;
    const val = document.createElement('td');
    val.className = 'val';
    val.id = `${stat.name}-val`;
    val.innerHTML = stat.val;
    row.appendChild(name);
    row.appendChild(val);
    statsTable.appendChild(row);
    stat.row = row;
  })
  if (typeof Game == "function") {
    let oldQueueBoxFunc = Game.prototype.updateQueueBox;
    Game.prototype.updateQueueBox = function () {
      updateStats.call(this)
      return oldQueueBoxFunc.apply(this, arguments);
    }
  }
  if (typeof Replayer == "function" && typeof Game != "function") {
    let oldQueueBoxFunc = Replayer.prototype.updateQueueBox;
    Replayer.prototype.updateQueueBox = function () {
      updateStats.call(this)      
      return oldQueueBoxFunc.apply(this, arguments);
    }

    let oldCheckLineClears = Replayer.prototype.checkLineClears;
    Replayer.prototype.checkLineClears = function() {
      let val = oldCheckLineClears.apply(this, arguments);
      if (this.PCdata) {
        // empty matrix check
        if (this.matrix.every(row => row.every(cell => cell == 0))) {
          this.PCdata.blocks = 0;
        } else {
          this.PCdata.blocks++;
        }

      }
      return val;
    }

    var oldInitReplay = Replayer.prototype.initReplay;
    Replayer.prototype.initReplay = function () {
      let val = oldInitReplay.apply(this, arguments);
      this.initialLines = this.linesRemaining;
      if (this.pmode == 8)
        this.PCdata = { blocks : 0 }

      return val;
    }
  }

}