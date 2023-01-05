export let isReplayerReversing = false

export const initReplayManager = () => {
    let skipping = false


    let repControls = document.getElementById("repControls")
    let skipButton = document.createElement("button")
    skipButton.textContent = "skip"
    skipButton.onclick = function () {
        if (skipping) {
            skipButton.textContent = "skip"
        } else {
            skipButton.textContent = "step"
        }
        skipping = !skipping
    }
    if (repControls) repControls.appendChild(skipButton)
    let nextFrame = ReplayController.prototype.nextFrame
    ReplayController.prototype.nextFrame = function () {
        if (!skipping) {
            return nextFrame.apply(this, arguments)
        }

        // find the next upcoming hard drop
        let nextHdTime = -1;
        this.g.forEach((r, _) => {
            for (let i = r.ptr; i < r.actions.length; i++) {
                let action = r.actions[i].a;
                let time = r.actions[i].t;

                if (action == Action.HARD_DROP) {
                    if (nextHdTime == -1 || time < nextHdTime)
                        nextHdTime = time;
                    break;
                }
            }
        });

        // play all replayers until that time
        if (nextHdTime < 0) return;
        this.g.forEach((r, _) => r.playUntilTime(nextHdTime));
    }
    let prevFrame = ReplayController.prototype.prevFrame
    ReplayController.prototype.prevFrame = function () {
        isReplayerReversing = true
        if (!skipping) {
            let v = prevFrame.apply(this, arguments)
            isReplayerReversing = false
            return v
        }
        let skipBack = 0
        let passed = false
        this.g.forEach((r, _) => {
            for (let i = r.ptr - 1; i >= 0; i--) {
                let action = r.actions[i].a;
                skipBack += 1

                if (action == Action.HARD_DROP) {
                    if (passed) {
                        skipBack -= 1
                        break
                    }
                    passed = true
                }
            }
        });
        for (let i = 0; i < skipBack; i++) {
            isReplayerReversing = true
            prevFrame.apply(this, arguments)
            isReplayerReversing = false
        }
        isReplayerReversing = false
    }
    let lR = ReplayController.prototype.loadReplay
    ReplayController.prototype.loadReplay = function () {
        let v = lR.apply(this, arguments)
        document.getElementById("next").onclick = this.nextFrame.bind(this)
        document.getElementById("prev").onclick = this.prevFrame.bind(this)
        return v
    }
}