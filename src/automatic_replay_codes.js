import { Config } from "./config";

export const initAutomaticReplayCodes = () => {
  window.copyReplayText = function (number) {
    var copyText = document.getElementById(`replay${number}`);
    var copyButton = document.getElementById(`replayButton${number}`);
    navigator.clipboard
      .writeText(copyText.value)
      .then(() => {
        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1000);
      })
      .catch((error) => {
        console.error(`An error occured while copying text:
      ${error.message}`);
      });
  };

  const oldStartPractice = Game.prototype.startPractice;

  Game.prototype.startPractice = function () {
    //how many pieces should the replay at least have
    let piecesPlacedCutoff = 1;

    if (typeof this.replayCounter == "undefined") {
      this.replayCounter = 1;
    }

    this.Replay.getData();

    if (this.GameStats.stats.BLOCKS.value > piecesPlacedCutoff && Config().ENABLE_AUTOMATIC_REPLAY_CODES) {
      let replayHTML = `
        <div style='font-size:14px;'>
            Userscript Generated Replay <b>#${this.replayCounter}</b>
        </div>
        <div style="font-size:16px;">
            Time: <b>${this.GameStats.stats.CLOCK.value}</b> 
            Blocks: <b>${this.GameStats.stats.BLOCKS.value}</b> 
            Waste: <b>${this.GameStats.stats.WASTE.value}</b>
        </div>
        <textarea id="replay${this.replayCounter}" readonly style="width:75%;" onclick="this.focus();this.select()">${this.Replay.string}</textarea>
        <button id="replayButton${this.replayCounter}" onclick="window.copyReplayText(${this.replayCounter})">Copy</button>
        `;
      this.Live.chatMajorWarning(replayHTML);
      this.replayCounter++;
    }

    let val = oldStartPractice.apply(this, arguments);

    return val;
  };
};
