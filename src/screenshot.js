const overlayCanvases = (canvases) => {
    let tempCanvas = document.createElement("canvas")
    let ctx = tempCanvas.getContext("2d");
    tempCanvas.width = canvases[0].width
    tempCanvas.height = canvases[0].height
    for (let canvas of canvases) {
        ctx.drawImage(canvas, 0, 0);
    };
    return tempCanvas
}
const combineCanvases = (canvases) => {
    let maxHeight = 0
    let width = 0
    for (let canvas of canvases) {
        if (canvas.height > maxHeight) maxHeight = canvas.height
        width += canvas.width
    }
    let tempCanvas = document.createElement("canvas")
    let ctx = tempCanvas.getContext("2d")

    tempCanvas.width = width //+ 200
    tempCanvas.height = maxHeight
    let dx = 0
    for (let i = 0; i < canvases.length; i++) {
        ctx.drawImage(canvases[i], dx, 0)
        dx += canvases[i].width
    }
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, tempCanvas.width + 30, tempCanvas.height);
    ctx.font = "15px serif"
    ctx.fillStyle = "white"
    ctx.globalCompositeOperation = 'source-over'
    /* let dy = 20
     for (let key in gamedata) {
         ctx.fillText(`${key}: ${gamedata[key]}`, width, dy)
         dy += 20
     }*/

    return tempCanvas
}
const downloadUri = (uri) => {
    let link = document.createElement("a");
    link.download = "screenshot";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export const initScreenshot = () => {
    let screenShotting = false
    Game.prototype.screenshot = function (apiLink) {
        if (screenShotting) return
        let oldTitle = document.title
        document.title = "Screenshotting..."
        screenShotting = true
        this.redrawAll()
        let main = overlayCanvases([document.getElementById("bgLayer"), document.getElementById("myCanvas")])
        let queue = overlayCanvases([document.getElementById("queueCanvas")])
        let hold = overlayCanvases([document.getElementById("holdCanvas")])
        let combined = combineCanvases([hold, main, queue])
        this.Replay.getData()
        let rep = this.Replay.string
        const formData = new FormData();
        combined.toBlob((blob) => {
            formData.append('screenshot', blob);
            formData.append('replay', rep)
            const options = {
                method: 'POST',
                body: formData,
                // If you add this, upload won't work
                // headers: {
                //   'Content-Type': 'multipart/form-data',
                // }
            };
            //    console.log(`${apiLink}uploadScreenshot`)
            fetch(`${apiLink}uploadScreenshot`, options).then(response => {
                response.text().then(val => {
                    if (response.status != 200) {
                        return alert(`err: ${val}`)
                    }
                    let dom = new URL(apiLink)
                    window.open(`https://${dom.hostname}/s/${val}.png`, '_blank')
                })
            }).finally(() => {
                screenShotting = false
                document.title = oldTitle
            });
        })

        //  console.log(combined.toDataURL())
        //     downloadUri(combined.toDataURL())
    }
}

