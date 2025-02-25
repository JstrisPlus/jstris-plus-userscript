export const initPracticeSurvivalMode = () => {
  // 60 apm cycle from rivi's usermode
  const baseCycle = [
    { time: 4, attack: 4 },
    { time: 4, attack: 5 },
    { time: 4, attack: 2 },
    { time: 3, attack: 1 },
    { time: 4, attack: 4 },
    { time: 4, attack: 4 },
    { time: 3, attack: 5 },
    { time: 3, attack: 5 },
  ];

  let isCycling = false;
  let shouldStartCycle = false;
  let shouldCancel = true;
  let timeFactor = 1;
  let hangingTimeout = 0;

  const INIT_MESS = 20;
  let setMess = (m) => null;
  const changeAPM = (apm) => (timeFactor = 60 / apm);

  let hasInit = false;

  const doCycle = (game, i) => {
    const cycleStep = baseCycle[i];
    if (!isCycling) return;
    if (game.pmode != 2) return stopCycle();
    console.log(game.pmode);
    hangingTimeout = setTimeout(() => {
      if (!isCycling) return;
      if (game.pmode != 2) return stopCycle();
      game.addIntoGarbageQueue(cycleStep.attack);
      doCycle(game, (i + 1) % baseCycle.length);
    }, cycleStep.time * timeFactor * 1000);
  };
  const startCycle = (game) => {
    if (!isCycling) {
      isCycling = true;
      doCycle(game, 0);
    }
  };
  const stopCycle = () => {
    clearTimeout(hangingTimeout);
    isCycling = false;
  };
  if (typeof Game == "function") {
    const oldQueueBoxFunc = Game.prototype.updateQueueBox;
    Game.prototype.updateQueueBox = function () {
      if (this.pmode != 2) return oldQueueBoxFunc.apply(this, arguments);
      return oldQueueBoxFunc.apply(this, arguments);
    };
    const oldLineClears = GameCore.prototype.checkLineClears;
    GameCore.prototype.checkLineClears = function (x) {
      let oldAttack = this.gamedata.attack;
      let val = oldLineClears.apply(this, arguments);
      let curAttack = this.gamedata.attack - oldAttack;
      if (this.pmode == 2 && curAttack > 0) {
        this.gamedata.attack -= curAttack; // block or send attack also adds to the attack, so just subtracting to make stat accurate
        if (shouldCancel) {
          this.blockOrSendAttack(curAttack, x);
        }
      }
      return val;
    };

    const oldReadyGo = Game.prototype.readyGo;
    Game.prototype.readyGo = function () {
      if (this.pmode == 2) {
        settingsDiv.classList.add("show-practice-mode-settings");
      } else {
        settingsDiv.classList.remove("show-practice-mode-settings");
      }

      if (shouldStartCycle) startCycle(this);

      if (!hasInit) {
        let oldOnGameEnd = Settings.prototype.onGameEnd;
        if (this.pmode == 2) {
          this.R.mess = INIT_MESS;
        }
        window.game = this;
        setMess = (m) => {
          if (this.pmode == 2) {
            this.R.mess = m;
          }
        };
        this.Settings.onGameEnd = function () {
          if (this.p.pmode == 2) {
            stopCycle();
          }
          return oldOnGameEnd.apply(this, arguments);
        };
        startStopButton.addEventListener("click", () => {
          shouldStartCycle = !shouldStartCycle;

          if (shouldStartCycle) {
            startCycle(this);
            startStopButton.textContent = "Stop APM Cycle";
          } else {
            stopCycle(this);
            startStopButton.textContent = "Start APM Cycle";
          }
        });
        startStopButton.disabled = false;
        hasInit = true;
      }
      return oldReadyGo.apply(this, arguments);
    };
  }

  const stage = document.getElementById("stage");
  const settingsDiv = document.createElement("DIV");
  settingsDiv.id = "customPracticeSettings";

  var slider = document.createElement("input");
  slider.type = "range";
  slider.min = 5;
  slider.max = 200;
  slider.step = 5;
  slider.id = "customApmSlider";
  slider.value = 60;
  var valueLabel = document.createElement("input");
  valueLabel.type = "number";
  valueLabel.min = 5;
  valueLabel.max = 200;
  valueLabel.id = "customApmInput";
  slider.addEventListener("mousemove", () => {
    valueLabel.value = Number.parseFloat(slider.value).toFixed(0);
    changeAPM(Number.parseFloat(slider.value));
  });
  valueLabel.value = Number.parseFloat(slider.value).toFixed(0);

  valueLabel.addEventListener("change", () => {
    var num = Number.parseFloat(valueLabel.value);
    num = Math.max(5, Math.min(num, 200));
    slider.value = num.toFixed(0);
    valueLabel.value = num;
    changeAPM(num);
  });

  valueLabel.addEventListener("click", () => {
    $(window).trigger("modal-opened");
  });

  var label = document.createElement("label");
  label.htmlFor = "customApmSlider";
  label.textContent = "APM";

  var sliderDiv = document.createElement("div");
  sliderDiv.appendChild(label);
  sliderDiv.appendChild(slider);
  sliderDiv.appendChild(valueLabel);

  var messSlider = document.createElement("input");
  messSlider.type = "range";
  messSlider.min = 0;
  messSlider.max = 100;
  messSlider.step = 1;
  messSlider.id = "customApmSlider";
  messSlider.value = INIT_MESS;
  var messValueLabel = document.createElement("input");
  messValueLabel.type = "number";
  messValueLabel.min = 0;
  messValueLabel.max = 100;
  messValueLabel.id = "customApmInput";
  messSlider.addEventListener("mousemove", () => {
    messValueLabel.value = Number.parseFloat(messSlider.value).toFixed(0);
    setMess(Number.parseFloat(messSlider.value));
  });
  messValueLabel.value = Number.parseFloat(messSlider.value).toFixed(0);

  messValueLabel.addEventListener("change", () => {
    var num = Number.parseFloat(messValueLabel.value);
    num = Math.max(0, Math.min(num, 100));
    messSlider.value = num.toFixed(0);
    messValueLabel.value = num;
    setMess(num);
  });

  messValueLabel.addEventListener("click", () => {
    $(window).trigger("modal-opened");
  });

  var messLabel = document.createElement("label");
  messLabel.htmlFor = "customApmSlider";
  messLabel.textContent = "🧀%";

  var messSliderDiv = document.createElement("div");
  messSliderDiv.appendChild(messLabel);
  messSliderDiv.appendChild(messSlider);
  messSliderDiv.appendChild(messValueLabel);

  var cancelLabel = document.createElement("label");
  cancelLabel.htmlFor = "cancelCheckbox";
  cancelLabel.textContent = "Allow cancel";

  var cancelCheckbox = document.createElement("input");
  cancelCheckbox.type = "checkbox";
  cancelCheckbox.id = "cancelCheckbox";
  cancelCheckbox.checked = true;

  cancelCheckbox.addEventListener("change", () => {
    shouldCancel = cancelCheckbox.checked;
  });

  var cancelDiv = document.createElement("div");
  cancelDiv.appendChild(cancelLabel);
  cancelDiv.appendChild(cancelCheckbox);

  var startStopButton = document.createElement("button");
  startStopButton.textContent = "Start APM Cycle";
  startStopButton.disabled = true;
  settingsDiv.innerHTML += "<b>Downstack Practice</b><br/>";
  settingsDiv.appendChild(sliderDiv);
  settingsDiv.appendChild(messSliderDiv);
  settingsDiv.appendChild(cancelDiv);
  settingsDiv.appendChild(startStopButton);
  stage.appendChild(settingsDiv);
};
