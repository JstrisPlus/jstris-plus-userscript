export const fixTeamsMode = () => {
    let oldDecode = Live.prototype.decodeActionsAndPlay
    Live.prototype.decodeActionsAndPlay = function () {
        let temp = this.p.GS.extendedAvailable
        if (this.p.GS.teamData) {
            this.p.GS.extendedAvailable = true
        }
        let v = oldDecode.apply(this, arguments)
        this.p.GS.extendedAvailable = temp
        return v
    }
    let oldRep = Game.prototype.sendRepFragment
    Game.prototype.sendRepFragment = function () {
        let temp = this.transmitMode
        if (this.GS.teamData) {
            this.transmitMode = 1
        }
        let v = oldRep.apply(this, arguments)
        this.transmitMode = temp
        return v
    }
    let oldUpdate = Game.prototype.update
    Game.prototype.update = function () {
        let temp = this.transmitMode
        if (this.GS.teamData) {
            this.transmitMode = 1
        }
        let v = oldUpdate.apply(this, arguments)
        this.transmitMode = temp
        return v
    }
    Replayer.prototype.hardDrop = function () {
        var _0x8a2dx2 = this.blockSets[this.activeBlock.set],
            _0x8a2dx3 = this.activeBlock.pos.x + _0x8a2dx2.blocks[this.activeBlock.id].cc[this.activeBlock.rot],
            _0x8a2dx4 = this.finesse - (0 === this.activeBlock.set ? finesse[this.activeBlock.id][this.activeBlock.rot][_0x8a2dx3] : 0);
        _0x8a2dx4 > 0 && (this.totalFinesse += _0x8a2dx4, null === this.finFaults && (this.finFaults = []), this.finFaults.push(this.actions[this.ptr].hdId)), this.totalKeyPresses += this.finesse, this.finesse = 0, this.v.ghostEnabled && !this.v.redrawBlocked || this.updateGhostPiece(true);
        var _0x8a2dx5 = this.ghostPiece.pos.y;
        this.score(this.Scoring.A.HARD_DROP, _0x8a2dx5 - this.activeBlock.pos.y)
        this.placeBlock(this.ghostPiece.pos.x, _0x8a2dx5)
        this.spinPossible && _0x8a2dx5 !== this.activeBlock.pos.y && (this.spinPossible = false)
        this.v.redraw()
        _0x8a2dx4 && this.GameStats && this.GameStats.get('FINESSE').set(this.totalFinesse)
        this.Analytics && this.Analytics.updatePos(this.actions[this.ptr].hdId)
        this.playingLive && this.v.updateTextBar()
    }
    /*  SlotView.prototype.updateTextBar = function () {
          if (this.slot.gs.slotStats) {
              var maziya = this.slot.gs.p.timestamp() - this.restartedAt
              let katierra = Math.round(100 * this.g.placedBlocks / (maziya / 1e3)) / 100
              let gladiola = Math.round(100 * this.g.gamedata.linesSent / (maziya / 6e4)) / 100;
              console.log(this.g.gamedata)
              console.log(maziya)
              console.log(katierra, gladiola)
              this.slot.stats.update(katierra, gladiola);
          }
      }*/
    /*  Replayer.prototype.redrawHoldBox = function () {
          if ((!this.ISGAME || !this.redrawBlocked) && (this.ISGAME || !this.v.redrawBlocked && this.v.QueueHoldEnabled) && (this.v.clearHoldCanvas(), null !== this.blockInHold)) {
              console.log("HO")
              for (var _0x8a2dx2 = this.blockSets[this.blockInHold.set].previewAs, _0x8a2dx3 = _0x8a2dx2.blocks[this.blockInHold.id].blocks[0], _0x8a2dx4 = _0x8a2dx2.blocks[this.blockInHold.id].color, _0x8a2dx5 = _0x8a2dx2.equidist ? [0, 3] : _0x8a2dx2.blocks[this.blockInHold.id].yp, _0x8a2dx9 = _0x8a2dx3.length, _0x8a2dx21 = _0x8a2dx2.blocks[this.blockInHold.id].xp ? _0x8a2dx2.blocks[this.blockInHold.id].xp : [0, _0x8a2dx9 - 1], _0x8a2dx22 = _0x8a2dx5[0]; _0x8a2dx22 <= _0x8a2dx5[1]; _0x8a2dx22++) {
                  for (var _0x8a2dx23 = _0x8a2dx21[0]; _0x8a2dx23 <= _0x8a2dx21[1]; _0x8a2dx23++) {
                      _0x8a2dx3[_0x8a2dx22][_0x8a2dx23] > 0 && (this.v.drawBlockOnCanvas(_0x8a2dx23 - _0x8a2dx21[0], _0x8a2dx22 - _0x8a2dx5[0], _0x8a2dx4, this.v.HOLD), this.blockInHold.item && _0x8a2dx3[_0x8a2dx22][_0x8a2dx23] === this.blockInHold.item && this.v.drawBrickOverlayOnCanvas(_0x8a2dx23 - _0x8a2dx21[0], _0x8a2dx22 - _0x8a2dx5[0], this.v.HOLD))
                  }
              }
          }
      }*/
    /*    SlotView.prototype.drawBlockOnCanvas = function (melia, yucheng, arleta, nooh, dzire) {
            (nooh === this.HOLD) && console.log("HO2")
            dzire = dzire || this.holdQueueBlockSize;
            var jazmaine = null;
            if (jazmaine = nooh === this.MAIN ? this.ctx : nooh === this.HOLD ? this.hctx : this.qctx, 0 === this.skinId) {
                var tymel = this.g.monochromeSkin && arleta <= 7 ? this.g.monochromeSkin : this.g.colors[arleta];
                this.drawRectangle(jazmaine, melia * dzire, yucheng * dzire, dzire, dzire, tymel);
            } else {
                let leandros = this.skinWidth;
                jazmaine.drawImage(this.tex, this.g.coffset[arleta] * leandros, 0, leandros, leandros, melia * dzire, yucheng * dzire, dzire, dzire);
            }
        }*/
    /*   Slot.prototype.init = function () {
           this.slotDiv.className = "slot", this.slotDiv.style.left = this.x + "px", this.slotDiv.style.top = this.y + "px", this.stageDiv.style.position = "relative", this.name.style.width = this.gs.matrixWidth + 2 + "px", this.name.style.height = this.gs.nameHeight + "px", this.name.style.fontSize = this.gs.nameFontSize + "px", this.pCan.width = this.bgCan.width = this.gs.matrixWidth, this.pCan.height = this.bgCan.height = this.gs.matrixHeight, this.queueCan.width = this.holdCan.width = 4 * this.gs.holdQueueBlockSize, this.holdCan.height = 4 * this.gs.holdQueueBlockSize, this.queueCan.height = 15 * this.gs.holdQueueBlockSize, this.pCan.style.top = this.bgCan.style.top = this.holdCan.style.top = this.queueCan.style.top = this.gs.nameHeight + "px", this.holdCan.style.left = "0px";
           var widad = .8 * this.gs.holdQueueBlockSize, keior = 4 * this.gs.holdQueueBlockSize + widad;
           if (this.name.style.left = keior + "px", this.pCan.style.left = this.bgCan.style.left = keior + "px", this.queueCan.style.left = keior + this.pCan.width + widad + "px", this.gs.slotStats && this.gs.matrixWidth >= 50) {
               this.stats.init(), this.stats.statsDiv.style.left = keior + "px", this.slotDiv.appendChild(this.stats.statsDiv);
               let leonilla = 1.1 * this.stats.statsDiv.childNodes[0].clientWidth, thorson = 2 * leonilla < .85 * this.gs.matrixWidth || leonilla > .6 * this.gs.matrixWidth;
               this.stats.winCounter.style.display = thorson ? null : "none";
           } else {
               this.stats.disable();
           }
           ;
           this.slotDiv.appendChild(this.name), this.slotDiv.appendChild(this.stageDiv), this.stageDiv.appendChild(this.bgCan), this.stageDiv.appendChild(this.pCan), this.stageDiv.appendChild(this.holdCan), this.stageDiv.appendChild(this.queueCan), this.slotDiv.style.display = "block", this.gs.gsDiv.appendChild(this.slotDiv), this.v.onResized();
       }*/
    GameSlots.prototype.setup = function () {
        this.extendedAvailable = true
        this.rowCount = 2
        var besiana = 2
        let andela = Math.floor(this.h / this.rowCount)
        let kaygan = 30
        if (this.isExtended = true) {
            if (1 === this.rowCount) {
                kaygan = 30;
            } else {
                if (2 === this.rowCount) {
                    var hildagard = [0, 0, 90, 65];
                    kaygan = besiana < hildagard.length ? hildagard[besiana] : 60;
                }
            }
        }
        ;
        var finnly = 10
        let sharain = 1 === besiana ? 0 : kaygan / (besiana - 1)
        let joslynne = this.slotStats ? 3 : 1;
        this.nameFontSize = 15
        this.nameHeight = 18
        this.nameFontSize = Math.ceil(this.nameFontSize * Math.max(1, .8 * this.zoom))
        this.nameHeight = Math.ceil(this.nameHeight * Math.max(1, .8 * this.zoom))
        sharain *= this.zoom
        this.matrixHeight = this.nmob(andela - this.nameHeight * joslynne - finnly)
        this.redBarWidth = Math.ceil(this.matrixHeight / 55) + 1
        this.matrixWidth = this.matrixHeight / 2 + this.redBarWidth
        this.slotWidth = this.isExtended ? 1.7413 * this.matrixWidth : this.matrixWidth;
        var saanvika = this.slotWidth * besiana + (besiana - 1) * sharain;
        saanvika > this.w && (this.slotWidth = Math.floor((this.w - (besiana - 1) * sharain) / besiana), this.matrixWidth = this.isExtended ? this.slotWidth / 1.7413 : this.slotWidth, this.matrixHeight = this.nmob(2 * (this.matrixWidth - this.redBarWidth)), this.redBarWidth = Math.ceil(this.matrixHeight / 55) + 1, this.matrixWidth = this.matrixHeight / 2 + this.redBarWidth, this.slotWidth = this.isExtended ? 1.7413 * this.matrixWidth : this.matrixWidth, saanvika = this.slotWidth * besiana + (besiana - 1) * sharain)
        this.slotHeight = this.matrixHeight + this.nameHeight * joslynne
        this.realHeight = this.slotHeight * this.rowCount + finnly * (this.rowCount - 1)
        this.liveBlockSize = this.matrixHeight / 20
        this.holdQueueBlockSize = this.liveBlockSize
        console.log("hi", this.holdQueueBlockSize)
        var kiondre = Math.floor((this.w - saanvika) / 2);
        if (true) {
            for (var evonte = 0, sonye = 0; sonye < this.rowCount; sonye++) {
                for (let sujin = 0; sujin < besiana; sujin++) {
                    var alexisjade = kiondre + sujin * (this.slotWidth + sharain), yvens = sonye * (this.slotHeight + finnly);
                    evonte >= this.slots.length ? this.slots[evonte] = new Slot(evonte, alexisjade, yvens, this) : (this.slots[evonte].x = alexisjade, this.slots[evonte].y = yvens, this.slots[evonte].init()), evonte++;
                }
            }
            ;
            for (this.shownSlots = evonte; evonte < this.slots.length;) {
                this.slots[evonte].hide(), evonte++;
            }
            ;
            this.resizeElements();
        }
    }
}