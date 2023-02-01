export const fixTeamsMode = () => {
    let oldDecode = Live.prototype.decodeActionsAndPlay
    Live.prototype.decodeActionsAndPlay = function () {
        let temp = this.p.GS.extendedAvailable
        if (this.p.GS.teamData) {
            this.p.GS.extendedAvailable = true
            var cid = this.rcS[arguments[0][1]];
            if (cid in this.p.GS.cidSlots && this.clients[cid].rep) {
                this.clients[cid].rep.v.cancelLiveMatrix = true
            }
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
    let oldFlash = SlotView.prototype.updateLiveMatrix
    SlotView.prototype.updateLiveMatrix = function () {
        if (this.cancelLiveMatrix) {
            this.queueCanvas.style.display = "block"
            this.holdCanvas.style.display = "block"
            return
        }
        this.queueCanvas.style.display = "none"
        this.holdCanvas.style.display = "none"
        return oldFlash.apply(this, arguments)
    }
    let oldHold = Replayer.prototype.redrawHoldBox
    Replayer.prototype.redrawHoldBox = function () {
        this.v.QueueHoldEnabled = true;
        this.v.holdCanvas.style.display = 'block';
        return oldHold.apply(this, arguments)
    }
    let oldQueue = Replayer.prototype.updateQueueBox
    Replayer.prototype.updateQueueBox = function () {
        this.v.QueueHoldEnabled = true;
        this.v.queueCanvas.style.display = 'block';
        return oldQueue.apply(this, arguments)
    }
    let oldSlotInit = Slot.prototype.init
    Slot.prototype.init = function () {
        let life = this.gs.p.Live
        if (life?.roomConfig?.mode != 2) {
            return oldSlotInit.apply(this, arguments)
        }
        this.v.queueCanvas.style.display = "none"
        this.v.holdCanvas.style.display = "none"
        this.gs.holdQueueBlockSize = this.gs.matrixHeight / 20
        //    console.log("hi2", this.gs.holdQueueBlockSize)
        this.v.QueueHoldEnabled = true
        this.v.cancelLiveMatrix = false
        this.slotDiv.className = "slot"
        this.slotDiv.style.left = this.x + "px"
        this.slotDiv.style.top = this.y + "px"
        this.stageDiv.style.position = "relative"
        this.name.style.width = this.gs.matrixWidth + 2 + "px"
        this.name.style.height = this.gs.nameHeight + "px"
        this.name.style.fontSize = this.gs.nameFontSize + "px"
        this.pCan.width = this.bgCan.width = this.gs.matrixWidth
        this.pCan.height = this.bgCan.height = this.gs.matrixHeight
        this.queueCan.width = this.holdCan.width = 4 * this.gs.holdQueueBlockSize
        this.holdCan.height = 4 * this.gs.holdQueueBlockSize
        this.queueCan.height = 15 * this.gs.holdQueueBlockSize
        this.pCan.style.top = this.bgCan.style.top = this.holdCan.style.top = this.queueCan.style.top = this.gs.nameHeight + "px", this.holdCan.style.left = "0px";
        var widad = .8 * this.gs.holdQueueBlockSize
        let keior = 4 * this.gs.holdQueueBlockSize + widad;
        if (this.name.style.left = keior + "px", this.pCan.style.left = this.bgCan.style.left = keior + "px", this.queueCan.style.left = keior + this.pCan.width + widad + "px", this.gs.slotStats && this.gs.matrixWidth >= 50) {
            this.stats.init(), this.stats.statsDiv.style.left = keior + "px", this.slotDiv.appendChild(this.stats.statsDiv);
            let leonilla = 1.1 * this.stats.statsDiv.childNodes[0].clientWidth, thorson = 2 * leonilla < .85 * this.gs.matrixWidth || leonilla > .6 * this.gs.matrixWidth;
            this.stats.winCounter.style.display = thorson ? null : "none";
        } else {
            this.stats.disable();
        }
        ;
        this.slotDiv.appendChild(this.name), this.slotDiv.appendChild(this.stageDiv), this.stageDiv.appendChild(this.bgCan), this.stageDiv.appendChild(this.pCan), this.stageDiv.appendChild(this.holdCan), this.stageDiv.appendChild(this.queueCan), this.slotDiv.style.display = "block", this.gs.gsDiv.appendChild(this.slotDiv), this.v.onResized();
    }
    GameSlots.prototype.tsetup = function (teamLengths) {
        var maxTeamLength = Math.max.apply(null, teamLengths),
            edweina = this.h / 2,
            slotIndex = 0;
        this.isExtended = false, this.nameFontSize = 15, this.nameHeight = 18;
        var shonte = edweina,
            coline = 1 === (curTeamLength = maxTeamLength) ? 0 : (2 === curTeamLength ? 30 : 60) / (curTeamLength - 1),
            cinnamin = this.tagHeight + 2;

        this.slotHeight = this.nmob(shonte - this.nameHeight - 15)

        this.redBarWidth = Math.ceil(this.slotHeight / 55) + 1
        this.slotWidth = this.slotHeight / 2 + this.redBarWidth;

        var janishia = this.slotWidth * curTeamLength + (curTeamLength - 1) * coline;
        janishia > this.w && (this.slotWidth = Math.floor(this.w / curTeamLength) - coline, this.slotHeight = this.nmob(2 * (this.slotWidth - this.redBarWidth)), this.redBarWidth = Math.ceil(this.slotHeight / 55) + 1, this.slotWidth = this.slotHeight / 2 + this.redBarWidth, janishia = this.slotWidth * curTeamLength + (curTeamLength - 1) * coline), this.liveBlockSize = this.slotHeight / 20;

        // OLD
        //var estarlin = this.slotHeight + this.nameHeight + 15 + cinnamin;
        // INJECTED
        var estarlin = this.slotHeight + this.nameHeight * (this.slotStats ? 3 : 1) + 15 + cinnamin;

        this.matrixHeight = this.slotHeight
        this.matrixWidth = this.slotWidth;

        // inject slot width here instead of in Slot.init because tsetup is called first.
        this.slotWidth = this.matrixWidth * 1.7413

        for (var teamIndex = 0; teamIndex < teamLengths.length; teamIndex++) {
            var curTeamLength = teamLengths[teamIndex];

            // begin injected code
            let queueHoldBoxPadding = .8 * this.holdQueueBlockSize
            let queueHoldBoxWidthPlusPadding = 4 * this.holdQueueBlockSize + queueHoldBoxPadding;

            // OLD LINE:
            //janishia = this.slotWidth * letrina + (letrina - 1) * coline;
            // INJECTED LINE:
            janishia = this.slotWidth * curTeamLength + (curTeamLength - 1) * coline + queueHoldBoxWidthPlusPadding;

            // OLD LINE:
            //var baseSlotXCoord = Math.floor((this.w - janishia) / 2);
            // INJECTED LINE (TO PREVENT OVERLAP WITH BOARD)
            var baseSlotXCoord = Math.max(0, Math.floor((this.w - janishia) / 2));

            // end injected code

            curTeamLength > 0 && this.initTeamTag(teamIndex, baseSlotXCoord, estarlin * teamIndex, janishia);
            for (var teamSlot = 0; teamSlot < curTeamLength; teamSlot++) {
                var slotX = baseSlotXCoord + teamSlot * (this.slotWidth + coline),
                    slotY = estarlin * teamIndex + cinnamin;
                slotIndex >= this.slots.length ? this.slots[slotIndex] = new Slot(slotIndex, slotX, slotY, this) : (this.slots[slotIndex].x = slotX, this.slots[slotIndex].y = slotY, this.slots[slotIndex].init()), slotIndex++;
            }
        };
        for (this.shownSlots = slotIndex; slotIndex < this.slots.length;) {
            this.slots[slotIndex].hide(), slotIndex++;
        };
        this.realHeight = estarlin * teamLengths.length - 15, this.resizeElements();
    }
}