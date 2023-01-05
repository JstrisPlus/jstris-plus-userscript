import { encoder, decoder, Field } from 'tetris-fumen'
import { SaveState } from './practiceUndo'
const clone = function (x) { return JSON.parse(JSON.stringify(x)); }

const reverseMatrix = ['_', 'Z', 'L', 'O', 'S', 'I', 'J', 'T', 'X', 'X', 'I', 'O', 'T', 'L', 'J', 'S', 'Z', 'I', 'O', 'T', 'L', 'J', 'S', 'Z']
const jstrisToCenterX = [[1, 2, 2, 1], [1, 1, 2, 2], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]
const jstrisToCenterY = [[1, 1, 2, 2], [2, 1, 1, 2], [2, 2, 2, 2], [2, 2, 2, 2], [2, 2, 2, 2], [2, 2, 2, 2], [2, 2, 2, 2]]
const pIndex = ['I', 'O', 'T', 'L', 'J', 'S', 'Z']
const rIndex = ["spawn", "right", "reverse", "left"]
const quizFilter = new RegExp('[^' + 'IOTLJSZ' + ']', 'g');

function downloadText(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const generateFumenQueue = function (lim = null) {
    if (!lim) lim = this.queue.length
    let bs = this.blockSets[this.activeBlock.set]
    lim = Math.min(lim, this.queue.length)
    let r1 = ""
    if (this.activeBlock) {
        r1 = bs.blocks[this.activeBlock.id].name
    }
    let r2 = ""
    if (this.blockInHold) {
        r2 = bs.blocks[this.blockInHold.id].name
    }
    let qq = `#Q=[${r2}](${r1})`
    for (let i = 0; i < lim; i++) {
        qq += bs.blocks[this.queue[i].id].name
    }
    return qq
}
const generateFumenMatrix = function () {
    let fieldStr = ''
    for (let i in this.deadline) {
        fieldStr += reverseMatrix[this.deadline[i]]
    }
    for (let row in this.matrix) {
        for (let col in this.matrix[row]) {
            fieldStr += reverseMatrix[this.matrix[row][col]]
        }
    }
    return fieldStr
}
export const initPracticeFumen = () => {
    const oldstartPractice = Game.prototype.restart;
    Game.prototype.restart = function () {
        const urlParams = new URLSearchParams(window.location.search);
        const snapshot = urlParams.get("snapshotPlus")

        if (this.pmode === 2 && snapshot != null) {
            let val = oldstartPractice.apply(this, arguments)
            let game = LZString.decompressFromEncodedURIComponent(snapshot)
            game = JSON.parse(game)
            console.log(game)
            this.blockSeed = game.seed
            this.blockRNG = alea(this.blockSeed)
            this.RNG = alea(this.blockSeed)
            this.initRandomizer(game.rnd)
            this.generateQueue();
            for (let i = 0; i <= game.placedBlocks; i++) {
                this.activeBlock = this.getBlockFromQueue()
            }
            if (game.holdID != null) {
                this.blockInHold = new Block(game.holdID)
                this.activeBlock = this.getBlockFromQueue()
            }
            this.matrix = clone(game.matrix)
            this.deadline = clone(game.deadline)
            this.setCurrentPieceToDefaultPos();
            this.updateGhostPiece(true);
            this.redrawAll();
            this.invalidFromSnapshot = true
            return val
        } else {
            this.fumenPages = null
            if (this.pmode === 2) this.fumenPages = []
            return oldstartPractice.apply(this, arguments);

        }

    }
    Game.prototype.generateFumenQueue = generateFumenQueue
    Game.prototype.generateFumenMatrix = generateFumenMatrix
    const onGarbageAdded = Game.prototype.addGarbage
    Game.prototype.addGarbage = function () {
        this.fumenMatrixRoll = true //matrix modulated, need to update fumen matrix
        return onGarbageAdded.apply(this, arguments)
    }
    const onHardDrop = Game.prototype.beforeHardDrop

    Game.prototype.beforeHardDrop = function () {
        let val = onHardDrop.apply(this, arguments)
        if (!this.fumenPages) return val
        if (this.altBlocks) {
            this.pages.push({ field: Field.create(this.generateFumenMatrix()) })
            return
        }
        let ss = this.activeBlock

        let x = jstrisToCenterX[ss.id][ss.rot] + this.activeBlock.pos.x
        let y = 19 - (jstrisToCenterY[ss.id][ss.rot] + this.ghostPiece.pos.y)
        let msg = {
            operation: { type: this.blockSets[ss.set].blocks[ss.id].name, rotation: rIndex[ss.rot], x: x, y: y }
        }
        if (this.fumenMatrixRoll) {
            msg.field = Field.create(this.generateFumenMatrix())
            this.fumenMatrixRoll = false
        }
        msg.comment = this.generateFumenQueue()
        msg.flags = { quiz: true }
        this.fumenPages.push(msg)
        //   console.log(encoder.encode(this.fumenPages))
        return val
    }

    const chatListener = Live.prototype.sendChat
    Live.prototype.sendChat = function (rawmsg) {
        var msg = "string" != typeof rawmsg ? this.chatInput.value.replace(/"/g, '\\"') : rawmsg;
        if (msg == "/fumen") {
            if (this.p.pmode != 2) {
                this.showInChat("Jstris+", "Live fumen export only supported in practice mode")
                this.chatInput.value = "";
                return
            }
            if (!this.p.fumenPages) {
                this.showInChat("Jstris+", "No fumen data available")
                this.chatInput.value = "";
                return
            }
            let fumen = encoder.encode(this.p.fumenPages)
            var coderro = "<span class='wFirstLine'><span class='wTitle'>!" + i18n.warning2 + "!</span> <b>" + i18n.repFail + "</b> (<em>" + "Jstris+ Fumen Export" + "</em>)</span>";

            coderro += "<p>" + "Fumen code dumped into the chat." + "</p>"
            coderro += `<a href="https://harddrop.com/fumen/?${fumen}" target="_blank">Link</a>`
            coderro += '<textarea readonly cols="30" onclick="this.focus();this.select()">'
            coderro += fumen + "</textarea>"
            this.chatMajorWarning(coderro);
            this.chatInput.value = "";
            return
        } else if ("/fumen" === msg.substring(0, 6)) {
            if (this.p.pmode != 2) {
                this.showInChat("Jstris+", "Fumen import only supported in practce mode")
                this.chatInput.value = "";
                return
            }
            let pages = null
            try {
                pages = decoder.decode(msg.substring(5))
            } catch (error) {
                console.log(error)
                this.showInChat("Jstris+", error.message)
                this.chatInput.value = "";
                return
            }
            let gamestates = loadFumen(pages)
            this.p.loadSaveState(gamestates)
            for (let i = this.p.queue.length; i < 7; i++) {
                this.p.refillQueue()
            }
            this.p.redrawAll();
            this.p.saveStates = []
            this.p.addSaveState()
            this.p.fumenPages = []
            this.chatInput.value = "";
            this.p.invalidFromSnapshot = true
            return
        }
        const val = chatListener.apply(this, [rawmsg])
        return val
    }
}
export const initReplayerSnapshot = () => {

    let repControls = document.getElementById("repControls")
    let skipButton = document.createElement("button")
    skipButton.className = "replay-btn"
    skipButton.textContent = "snapshot"
    let fumenButton = document.createElement("button")
    fumenButton.className = "replay-btn"
    fumenButton.textContent = "fumen"
    let pcButton = document.createElement("button")
    pcButton.className = "replay-btn"
    pcButton.textContent = "pc solver"
    let wellRow1 = document.createElement("div")
    wellRow1.className = "replay-btn-group"
    let injected = false
    const lR = ReplayController.prototype.loadReplay
    ReplayController.prototype.loadReplay = function () {
        if (!injected && this.g.length == 1) {
            //  let well = document.createElement("div")
            //  well.className = 'well'


            //    well.appendChild(wellRow1)
            Replayer.prototype.generateFumenQueue = generateFumenQueue.bind(this.g[0])
            Replayer.prototype.generateFumenMatrix = generateFumenMatrix.bind(this.g[0])
            repControls.appendChild(wellRow1)
            wellRow1.appendChild(skipButton)
            wellRow1.appendChild(fumenButton)

            skipButton.onclick = () => {
                let code = this.g[0].snapshotPlus()
                window.open(`https://jstris.jezevec10.com/?play=2&snapshotPlus=${code}`, '_blank')
            }
            pcButton.onclick = () => {
                let code = this.g[0].snapshotFumen()
                window.open(`https://wirelyre.github.io/tetra-tools/pc-solver.html?fumen=${encodeURIComponent(code)}`, '_blank')
            }
            fumenButton.onclick = () => {
                let rep = document.getElementById('rep0').value
                fumenButton.disabled = true
                fumenButton.textContent = "loading"
                fetch(`https://fumen.tstman.net/jstris`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: `replay=${rep}`
                }).then((response) => response.json())
                    .then((data) => {
                        navigator.clipboard.writeText(data.fumen).then(() => {
                            fumenButton.textContent = "copied"
                        }).catch((err) => {
                            fumenButton.textContent = `err ${err}`
                        }).finally(() => {
                            if (data.fumen.length < 8168) {
                                let newWin = window.open(`https://harddrop.com/fumen/?${data.fumen}`, '_blank')
                            }
                            let textArea = document.createElement('textarea')
                            textArea.className = "repArea"
                            textArea.rows = 1
                            textArea.textContent = data.fumen
                            let dlButton = document.createElement("button")
                            dlButton.textContent = "download"
                            dlButton.className = "replay-btn"
                            dlButton.onclick = () => {
                                downloadText('jstrisFumen.txt', data.fumen)
                            }
                            let openButton = document.createElement("button")
                            openButton.textContent = "open"
                            let fumenLink = `https://harddrop.com/fumen/?${data.fumen}`
                            if (data.fumen.length >= 8168) {
                                alert("fumen code too long for url, you'll need to paste the code in manually")
                                fumenLink = `https://harddrop.com/fumen/?`
                            }

                            openButton.className = "replay-btn"
                            openButton.onclick = () => {
                                window.open(fumenLink, '_blank')
                            }
                            repControls.appendChild(textArea)
                            repControls.appendChild(dlButton)
                            repControls.appendChild(openButton)
                        });

                    });
            }
            injected = true
        }
        let val = lR.apply(this, arguments)
        if (this.g[0].pmode == 8) {
            wellRow1.appendChild(pcButton)
        }
        return val
    }
    Replayer.prototype.snapshotFumen = function () {


        /*
        let ss = this.activeBlock
        let x = jstrisToCenterX[ss.id][ss.rot] + this.activeBlock.pos.x
        let y = 19 - (jstrisToCenterY[ss.id][ss.rot] + this.ghostPiece.pos.y)
           let msg = {
               operation: { type: this.blockSets[ss.set].blocks[ss.id].name, rotation: rIndex[ss.rot], x: x, y: y }
           }*/
        let msg = {}
        let fieldStr = this.generateFumenMatrix().substring(170)
        let airCount = fieldStr.split('_').length - 1
        msg.field = Field.create(fieldStr)
        msg.comment = this.generateFumenQueue().replace(quizFilter, '')
        msg.comment = msg.comment.substring(0, Math.floor(airCount / 4) + 1)
        console.log(msg)
        let code = encoder.encode([msg])
        console.log(code)
        return code
    }
    Replayer.prototype.snapshotPlus = function () {
        let matrix = clone(this.matrix)
        let deadline = clone(this.deadline)
        let placedBlocks = this.placedBlocks
        let seed = this.r.c.seed
        let holdID = null
        if (this.blockInHold) {
            holdID = this.blockInHold.id
        }
        let rnd = this.R.rnd
        return LZString.compressToEncodedURIComponent(JSON.stringify({
            matrix, deadline, placedBlocks, seed, holdID, rnd
        }))
    }
}
export const loadFumen = (pages) => {

    const page = pages[pages.length - 1]
    const field = page.field
    let matrix = Array(20).fill().map(() => Array(10).fill(0))
    let deadline = Array(10).fill(0)
    let activeBlock = new Block(0)
    let hold = null, queue = []
    if (page.flags.quiz) {
        let match = /^#Q=\[([LOJSTZI]?)\]?\(([LOJSTZI]?)\)([LOJSTZI]*)$/.exec(page.comment);
        console.log(match)
        if (match[1]) {
            hold = new Block(pIndex.indexOf(match[1]))
        }
        if (match[2]) {
            activeBlock = new Block(pIndex.indexOf(match[2]))
        }
        if (match[3]) {
            for (let char of match[3]) {
                queue.push(new Block(pIndex.indexOf(char)))
            }
        }
    }


    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 20; y++) {
            let v = reverseMatrix.indexOf(field.at(x, y))
            if (v > 0) matrix[19 - y][x] = v
        }
    }
    for (let x = 0; x < 10; x++) {
        let v = reverseMatrix.indexOf(field.at(x, 20))
        if (v > 0) deadline[x] = v
    }
    let game = {
        matrix: matrix,
        deadline: deadline,
        activeBlock: activeBlock,
        blockInHold: hold,
        queue: queue,
        b2b: 0,
        combo: 0,
        placedBlocks: 0,
        totalFinesse: 0,
        totalKeyPresses: 0,
        incomingGarbage: [],
        redBar: 0,
        gamedata: {
            "lines": 0,
            "singles": 0,
            "doubles": 0,
            "triples": 0,
            "tetrises": 0,
            "maxCombo": 0,
            "linesSent": 0,
            "linesReceived": 9,
            "PCs": 0,
            "lastPC": 0,
            "TSD": 0,
            "TSD20": 0,
            "B2B": 0,
            "attack": 0,
            "score": 0,
            "holds": 0,
            "garbageCleared": 0,
            "wasted": 1,
            "tpieces": 1,
            "tspins": 0
        }
    }
    return game
}