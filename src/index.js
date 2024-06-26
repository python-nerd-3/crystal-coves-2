
// hi before you dig into my code watch https://www.youtube.com/watch?v=EAOxlNiDWt0

let canvas = document.querySelector("#gameCanvas")
let ctx = canvas.getContext("2d")
let loadProg = 0
let loaded = false
let percentsUsed = [0, 0, 0, 0]
let poolPercs = {"meteor": 0}
let layers = ["stone", "denseStone", "basalt", "magma"]
let oreDisplays = []
let allOres = []
let layerOres = [[], [], [], []]
let poolOres = {"meteor": []}
let discoveredOres = []
let voidTextures = []
let oreDict = {}
let buttons = []
let yOffset = 0
let bgImage = document.querySelector("#whywontchangebgimageworkbruh")
let debug = window.location.href.includes("file")
let invVisible = false 
let invScroll = 0
let rarityColors = {"base": "#7f7f7f", "common": "#d9d9d9", "uncommon": "#93c47d", "rare": "#4a86e8", "epic": "#ffd966", "mythic": "#46bdc6", "unreal": "#9900ff", "beyond": "#000000"}
let settingsVisible = false
let creditsVisible = false
let menuOpen = false
let parsToLoad = ["placeholder", "char", "dust", "sparkle", "stoneShard", "snowflake", "darkle", "heyguysquandaledinglehere"]
let parTextures = {}
let particles = []
let deadIds = []
let parSum = 0
let parTime = 0
const dtrConstant = Math.PI / 180
let soundOn = true
let notinfo = []
let money = 0
let sellAmt = 1
let shopVisible = 0 * !"Is this the egg?"
let items = []
let itemDict = {}
let hotbarLoc = false
let loading = true
let zoomWarn = false
let scrollDelta = 0
let version = "2.1.1"
let ingameEvents = []
let meteorLocs = []
let infoVisible = false
let staticImages = []
let lastLarrow = -1000

ctx.imageSmoothingEnabled = false

let music = new Audio("./assets/audio/music.mp3")
music.loop = true
let epicSfx = new Audio("./assets/audio/epicSfx.mp3")
let mythicSfx = new Audio("./assets/audio/mythicSfx.mp3")
let unrealSfx = new Audio("./assets/audio/unrealSfx.mp3")

let dynamiteSfx = new Audio("./assets/audio/boom.mp3")

let breakSfx = new Audio("./assets/audio/break.mp3")
breakSfx.volume = 0.1
let depositSfx = new Audio("./assets/audio/deposit.mp3")

let eventSfx = new Audio("./assets/audio/event.mp3")

function tick() {
    if (loadProg >= allOres.length + layerOres.length + buttons.length + parsToLoad.length + items.length + ingameEvents.length + staticImages.length && loaded == false) {
        console.log("Loaded textures in " + performance.now() + "ms")
        loaded = true
        startGame()
    }
    areaPars()
    render()
    if (document.getElementsByTagName("div")[0].offsetLeft >= 0 && zoomWarn) {
        zoomWarn = false
        document.getElementsByTagName("span")[0].style.visibility = "hidden"
    }
    if (!document.getElementsByTagName("div")[0].offsetLeft >= 0 && !zoomWarn) {
        zoomWarn = true
        document.getElementsByTagName("span")[0].style.visibility = "shown"
    }
    invScroll = Math.min(invScroll + scrollDelta * 20, 0)
}

function render() {
    let bg = ctx.createPattern(voidOre.texture, "repeat");
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1600, 920)
    if (yOffset === 0) {
        let skyGradient = ctx.createLinearGradient(0, 0, 0, 280)
        skyGradient.addColorStop(0.1, "#0060fe")
        skyGradient.addColorStop(1, "#77aaff")
        ctx.fillStyle = skyGradient
        ctx.fillRect(0, 0, 1600, 280)
        let skyEase = ctx.createLinearGradient(0, 280, 0, 320)
        skyEase.addColorStop(0, "#77aaff")
        skyEase.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = skyEase
        ctx.fillRect(0, 280, 1600, 40)
        ctx.drawImage(tree.img, 32, 32, 128, 128)
    }
    ctx.fillStyle = `rgba(0,0,0,${yOffset / (layers.length * 9200 * 2)}`
    ctx.fillRect(0, 0, 1600, 920)
    oreDisplays.filter((i) => (i.yOffset == yOffset)).forEach((i) => {
        ctx.beginPath()
        ctx.drawImage(i.texture, i.pos[0], i.pos[1], 40, 40)
        if (i.deposit) {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 5;
            ctx.strokeRect(i.pos[0] - 0.5, i.pos[1] + 0.5, 40, 40)
        }
        if (i.particles && (parTime + i.spawnTime) % i.particles.frequency == 0) {
            new Particle(i.particles.texture, "decay", "offset", i.pos[0] + 20, i.pos[1] + 20, Math.random() * 360, i.particles.speed, i.particles.lifetime)
        }
        ctx.closePath()
    })
    particles = particles.filter((i) => !deadIds.includes(i.id))
    particles.forEach((i) => {
        ctx.drawImage(i.tx, i.pos[0] - 4, i.pos[1] - 4, 8, 8)
        i.tick()
    })
    buttons.filter((i) => {return !i.aboveMenu && !i.hidden && i.dependency()}).forEach( (i) => {
        ctx.beginPath()
        if (i.sidebar && invVisible) {
            ctx.drawImage(i.texture, i.pos[0] - 370, i.pos[1], i.size, i.size)
        } else {
            ctx.drawImage(i.texture, i.pos[0], i.pos[1], i.size, i.size)
        }
        ctx.closePath()
    })
    if (debug) {
        ctx.beginPath()
        ctx.font = "20px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText("Debug enabled", 10, 880)
        ctx.fillText("yOffset: " + yOffset, 10, 905)
        ctx.closePath();
    }
    if (hotbarLoc) {
        ctx.beginPath()
        let hotbarLeft = hotbarLoc[0] - (items.length * 24) + 20
        for (i of items) {
            ctx.fillStyle = "rgba(0.7,0.7,0.7,0.5)" 
            ctx.fillRect(hotbarLeft, hotbarLoc[1] + 48, 48, 48)
            ctx.drawImage(i.tx, hotbarLeft, hotbarLoc[1] + 48, 48, 48)
            ctx.fillStyle = "#ffffff"
            ctx.font = "16px sans-serif"
            ctx.fillText(i.amt, hotbarLeft, hotbarLoc[1] + 96, 48, 48)
            hotbarLeft += 48
        }
        ctx.closePath()
    }
    if (notinfo[2] > 0) {
        notinfo[2] -= 1
        ctx.beginPath();
        ctx.font = "bold 40px sans-serif"
        ctx.strokeStyle = notinfo[1] == "#000000" ? "#ffffff" : shadeColor(notinfo[1], -40)
        ctx.lineWidth = 5
        ctx.miterLimit = 2
        ctx.fillStyle = notinfo[1]
        ctx.strokeText(notinfo[0], 15, 45)
        ctx.fillText(notinfo[0], 15, 45)
        ctx.closePath()
    } else {
        ctx.beginPath()
        ctx.fillStyle = "#00ff7f"
        ctx.font = "30px sans-serif"
        ctx.strokeStyle = "#00994c"
        ctx.lineWidth = 5
        ctx.miterLimit = 2
        ctx.strokeText(`$${money.toLocaleString()}`, 15, 45)
        ctx.fillText(`$${money.toLocaleString()}`, 15, 45)
        ctx.closePath()
    }
    if (invVisible) {
        ctx.beginPath();
        ctx.fillStyle = "#331144"
        ctx.rect(1250, 0, 350, 920)
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(1230, 0, 20, 920)
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.font = "20px sans-serif"
        ctx.fillStyle == "#9966cc"

        discoveredOres.forEach((i, ind) => {
            ctx.drawImage(i.texture, 1300, 80 + (ind * 100) + invScroll, 60, 60)
            ctx.fillText(i.properties?.display || capitalizeFirstLetter(i.name), 1370, 100 + (discoveredOres.indexOf(i) * 100) + invScroll)
            if (i.rarity == 0) {
                ctx.fillText("Misc", 1370, 120 + (ind * 100) + invScroll)
            } else if (i.rarity == 1) {
                ctx.fillText("Layer ore", 1370, 120 + (ind * 100) + invScroll)
            } else {
                ctx.fillText("1/" + i.dispRarity.toLocaleString() + " | $" + i.sellPrice.toLocaleString(), 1370, 120 + (ind * 100) + invScroll );
            }
            ctx.fillText(i.amt.toLocaleString(), 1370, 140 + (ind * 100) + invScroll);
            ctx.strokeStyle = i.rarityColor
            ctx.lineWidth = 5
            ctx.strokeRect(1297.5, 77.5 + (ind * 100) + invScroll, 62.5, 62.5);
        })

        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "#331144";
        ctx.rect(1250, 0, 350, 60);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(1250, 0, 350, 10)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath();
        ctx.font = "30px sans-serif"
        ctx.fillText("INVENTORY", 1335, 50)
        ctx.closePath();

        ctx.beginPath();
        ctx.font = "20px sans-serif"
        ctx.fillText("Right click to sell", 1295, discoveredOres.length * 100 + 80 + invScroll)
        ctx.fillText("Sell: ", 1295, discoveredOres.length * 100 + 110 + invScroll)
        ctx.closePath()
        
    } else {
        ctx.beginPath();
        x = 1600
        for (i of ingameEvents) {
            if (i.active) {
                x -= 80
                ctx.fillStyle = "rgba(0.7,0.7,0.7,0.2)" 
                ctx.roundRect(x - 5, 837, 74, 74, 10)
                ctx.fill()
                ctx.drawImage(i.icon, x, 842, 64, 64)
            }
        }
    }
    if (menuOpen) {
        ctx.beginPath()
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(0, 0, 1600, 920)
        ctx.closePath()
    }
    if (creditsVisible) {
        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(480, 40, 640, 840)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#331144"
        ctx.rect(500, 60, 600, 800)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#9966cc"
        ctx.font = "bold 50px sans-serif"
        ctx.fillText("CREDITS", 680, 120)
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#9966cc"
        ctx.font = "20px sans-serif"
        ctx.fillText(`This game was mostly coded by sc3d`, 520, 160)
        ctx.fillText(`My friend made/revamped a lot of the textures`, 520, 190)
        ctx.fillText(`Compound-codes did like nothing but he has permission so`, 520, 220)
        ctx.fillText(`Music is Solar Fractals by Waterflame`, 520, 250)
        ctx.fillText(`Inspired by REx: Reincarnated on Roblox`, 520, 280)
        ctx.fillText(`This project does not use any JS libraries`, 520, 310)
        ctx.fillText(`Shoutout to Tim-Berners Lee for inventing the Internet`, 520, 340)
        ctx.closePath()
    }
    if (settingsVisible) {
        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(480, 40, 640, 840)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#331144"
        ctx.rect(500, 60, 600, 800)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#9966cc"
        ctx.font = "bold 50px sans-serif"
        ctx.fillText("SETTINGS", 670, 120)
        ctx.closePath()
    }
    if (infoVisible) {
        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(480, 40, 640, 840)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#331144"
        ctx.rect(500, 60, 600, 800)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#9966cc"
        ctx.font = "bold 50px sans-serif"
        ctx.fillText("CONTROLS", 680, 120)
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#9966cc"
        ctx.font = "30px sans-serif"
        ctx.fillText(`↕`, 520, 160)
        ctx.fillText(`[`, 520, 200)
        ctx.fillText(`↔`, 520, 240)
        ctx.fillText(`🖰`, 520, 300)
        ctx.font = "20px sans-serif"
        ctx.fillText(`Change layer`, 560, 160)
        ctx.fillText(`Toggle inventory`, 560, 200)
        ctx.fillText(`Scroll in inventory`, 560, 240)
        ctx.fillText(`Left click: Break block`, 560, 280)
        ctx.fillText(`Right click: Use item, sell ore`, 560, 320)
        ctx.closePath()
    }
    if (settingsVisible) {
        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(480, 40, 640, 840)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#331144"
        ctx.rect(500, 60, 600, 800)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#9966cc"
        ctx.font = "bold 50px sans-serif"
        ctx.fillText("SETTINGS", 670, 120)
        ctx.closePath()
    }
    if (shopVisible) {
        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(280, 40, 1040, 840)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#331144"
        ctx.rect(300, 60, 1000, 800)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#9966cc"
        ctx.font = "bold 60px sans-serif"
        ctx.fillText("SHOP", 715, 130)
        ctx.closePath()

        ctx.beginPath()
        ctx.drawImage(dynamite.tx, 320, 200, 128, 128)
        ctx.fillStyle = "#9966cc"
        ctx.font = "40px sans-serif"
        ctx.fillText("Dynamite - $" + dynamite.price.toLocaleString(), 448, 240) // 800th line of code
        ctx.font = "24px sans-serif"
        ctx.fillText("Blows up a small area collecting any materials in its way, doubling", 448, 270)
        ctx.fillText("gain from common resources. As a wise penguin once said,", 448, 304)
        ctx.fillText("\"Yes Rico, kaboom.\"", 448, 338)
        ctx.closePath()

        // ctx.beginPath()
        // ctx.drawImage(tunnelBore.tx, 320, 388, 128, 128)
        // ctx.fillStyle = "#9966cc"
        // ctx.font = "40px sans-serif"
        // ctx.fillText("Tunnel Bore - $1,000", 448, 428) // 800thn't line of code
        // ctx.font = "24px sans-serif"
        // ctx.fillText("Digs down 5 layers quickly. ", 448, 458)
        // ctx.font = "14px sans-serif"
        // ctx.fillText("that's all, what else do you want?", 448, 475)
        // ctx.fillText("something funny? do you really expect that from me?", 448, 487)
        // ctx.fillText("fine, what did the football coach say to the broken vending machine?", 448, 499)
        // ctx.fillText("give me my quarter back", 448, 511)
        // ctx.font = "bold 14px sans-serif"
        // ctx.fillText("AHAHAHAHAH", 607, 511)
        // ctx.closePath()
        // delayed due to many bugs

        ctx.beginPath()
        ctx.drawImage(pocket.tx, 320, 388, 128, 128)
        ctx.fillStyle = "#9966cc"
        ctx.font = "40px sans-serif"
        ctx.fillText("Remote Air Bubble - $" + pocket.price.toLocaleString(), 448, 428) // 800thn'tn'tn't line of code
        ctx.font = "24px sans-serif"
        ctx.fillText("Creates a small bubble of air on the layer below you. Ores adjacent", 448, 458)
        ctx.fillText("to the bubble will become pumice. You must pronounce it \"poomis\"", 448, 492)
        ctx.fillText("by law.", 448, 526)
        ctx.closePath()
    }

    buttons.filter((i) => {return i.aboveMenu && !i.hidden && i.dependency()}).forEach((i) => {
        ctx.beginPath()
        if (i.sidebar && invVisible) {
            ctx.drawImage(i.texture, i.pos[0] - 370, i.pos[1], i.size, i.size)
        } else {
            ctx.drawImage(i.texture, i.pos[0], i.pos[1], i.size, i.size)
        }
        ctx.closePath()
    })

    if (loading) {
        ctx.beginPath()
        ctx.fillStyle = "#331144"
        ctx.fillRect(0, 0, 1600, 920)
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "#9966cc"
        ctx.font = "40px sans-serif"
        ctx.fillText(`Loading... ${loadProg}/${allOres.length + layerOres.length + buttons.length + parsToLoad.length + items.length + ingameEvents.length + staticImages.length}`, 80, 410)
        ctx.closePath()
    }
} 

function areaPars() {
    parTime += 1
    if (yOffset >= 27600) {
        for (i of Array(5).keys()) {
            new Particle("char", "gravity", "layer",  Math.random() * 1600, 940, (Math.random() - 0.5) * 12, (Math.random() * 10) + 10, 2)
        }
        if (parTime % 15 == 0) { // refactor this to use intervals but not break
            new Particle("char", "sts", "layer", (Math.random() * 600), 6, Math.random() * 5 + 70)
        }
    } else if (yOffset >= 18400) {
        for (i of Array(8).keys()) {
            new Particle("dust", "sts", "layer", Math.random() * 920, 8, Math.random() * 10 + 85)
        }
    } else if (yOffset >= 9200) {
        for (i of Array(4).keys()) {
            new Particle("dust", "sts", "layer", Math.random() * 920, 8, Math.random() * 10 + 85)
        }
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} // thank you 121k rep stack overflow guy

function objMap(obj, func) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v)]));
} // thank you 49.2k rep stack overflow guy

function playsfx() {
    let newAudio = this.cloneNode(true)
    newAudio.volume = this.volume
    newAudio.play()
}

function checkVisible(elm) { // haha i love copy from stack overflow
    let rect = elm.getBoundingClientRect();
    let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    R = Math.round(R)
    G = Math.round(G)
    B = Math.round(B)

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
} // stac overflowing

Audio.prototype.playsfx = playsfx

// stack overflow is th​e best website for developers

function startGame() {
    loading = false
    for (let i of Array(40).keys()) {
        oreDisplays.push(new OreDisplay(grass, i * 40, 160, false))
        oreDisplays.push(new OreDisplay(dirt, i * 40, 200, false))
        oreDisplays.push(new OreDisplay(dirt, i * 40, 240, false))
        oreDisplays.push(new OreDisplay(stone, i * 40, 280, false))
        oreDisplays.push(new OreDisplay(stone, i * 40, 320, true))
    }
}

function destroy(target, src = "default") {
    let dynaplier = src == "dynamite" && (oreDict[target.type].rarityLevel == "common" || oreDict[target.type].rarityLevel == "base") ? 2 : 1
    if (["40,160", "80,160", "120,160"].includes(String(target.pos)) && yOffset == 0) {
        return
    }
    addOre(oreDict[target.type], target.deposit ? selectEven([5, 6, 7]) * dynaplier : dynaplier)
    // for (let i of Array(3).keys()) {
    //     new Particle("stoneShard", "gravity", "yOffset", target.pos[0] + 20, target.pos[1], (Math.random() - 0.5) * 20, (Math.random() * 5) + 5, 2)
    // } delayed 
    if (target.spawn) {
        oreDisplays.splice(oreDisplays.indexOf(target), 1, new OreDisplay(voidOre, target.pos[0], target.pos[1], true))
        generateOre(target.pos[0] - 40, target.pos[1], target.yOffset)
        generateOre(target.pos[0] + 40, target.pos[1], target.yOffset)
        generateOre(target.pos[0], target.pos[1] - 40, target.yOffset)
        generateOre(target.pos[0], target.pos[1] + 40, target.yOffset)
    } else {
        oreDisplays.splice(oreDisplays.indexOf(target), 1)
    }
    if (music.paused) {
        music.play()
    }
}

function generateOre(x, y, yOff = yOffset) {
    let currentLayer = ~~(yOff / 9200)
    let oreType = select(layerOres[currentLayer])
    console.log([x, y + yOff])
    if (meteorLocs.some((i) => {return JSON.stringify(i) == JSON.stringify([x, y + yOff])})) {
        oreType = select(poolOres["meteor"])
    }
    let newOre = new OreDisplay(oreType, x, y, true, yOff)
    if (newOre.pos[1] == 920) {
        newOre.yOffset = newOre.literalY
        newOre.pos[1] = 0
        newOre.cornerPos[1] = 40 
        newOre.type = oreDict[layers[currentLayer]].name
        if (~~(newOre.yOffset / 920) % 10 == 0) {
            newOre.texture = oreDict[layers[currentLayer + 1]].texture
            newOre.type = oreDict[layers[currentLayer + 1]].name
        }
    }
    if (newOre.pos[1] == -40) {
        newOre.yOffset -= 920 
        newOre.pos[1] = 880
        newOre.cornerPos[1] = 920
        newOre.type = layers[currentLayer]
        if (~~(newOre.yOffset / 920) % 10 == 9) {
            newOre.texture = oreDict[layers[currentLayer - 1]].texture
            newOre.type = oreDict[layers[currentLayer - 1]].name
        }
    }
    let oreExists = oreDisplays.find((i) => (i.pos[0] == newOre.pos[0] && i.pos[1] == newOre.pos[1] && i.yOffset == newOre.yOffset))
    let parent = oreDict[newOre.type]

    if (!oreExists && !(y <= 280 && yOffset == 0) && 0 <= x && x <= 1600) {
        oreDisplays.push(newOre)
        if (parent.dispRarity >= 1000) {
            if (parent.rarityLevel == "epic" && soundOn) {
                epicSfx.playsfx()
            }
            if (parent.rarityLevel == "mythic" && soundOn) {
                mythicSfx.playsfx()
            }
            if (["unreal", "beyond"].includes(parent.rarityLevel) && soundOn) {
                unrealSfx.playsfx()
            }
            let dispName = parent.properties?.display || capitalizeFirstLetter(parent.name)
            notinfo = [`${parent.rarityLevel.toUpperCase()} ORE: ${dispName}${newOre.deposit ? " Deposit" : ""} has spawned!${newOre.deposit ? "!" : ""}${newOre.rarityLevel == "unreal" || newOre.rarityLevel == "beyond" ? "!" : ""} (1/${(parent.dispRarity * (newOre.deposit ? 20 : 1)).toLocaleString()})`, parent.rarityColor, 300]
        }
    }
}

function buy(item) {
    if (money > itemDict[item].price) {
        itemDict[item].amt += 1
        money -= itemDict[item].price
    } else {
        console.log("not enuff")
    }
}

function addOre(type, num) {
    type.amt += num
    type.discovered = true
    if (!discoveredOres.includes(type)) {
        discoveredOres.push(type);
        discoveredOres.sort((a, b) => {
            return a.rarity - b.rarity;
        })
    }
}

function click(e) {
    let clickPos = [e.layerX - 40, e.layerY - 40]
    if (hotbarLoc) {
        let hotbarLeft = hotbarLoc[0] - (items.length * 24) + 20
        let foundItem = items.find((i, index) => {
            return hotbarLeft + (index) * 48 <= clickPos[0] && clickPos[0] <= hotbarLeft + (index + 1) * 48 && hotbarLoc[1] + 48 <= clickPos[1] &&  clickPos[1] <= hotbarLoc[1] + 96
        })
        if (foundItem && foundItem.amt >= 1) {
            foundItem.use()
            hotbarLoc = false
            return
        }
    }
    let foundButton = buttons.find((i) => (i.pos[0] - (i.sidebar && invVisible ? 370 : 0) <= clickPos[0] && (i.cornerPos[0] - (i.sidebar && invVisible ? 370 : 0)) >= clickPos[0] && i.pos[1] <= clickPos[1] && i.cornerPos[1] >= clickPos[1] && !i.hidden && i.dependency()))
    if (foundButton && (!menuOpen || foundButton.aboveMenu)) {
        console.log(foundButton)
        foundButton.func()
        return // documentation is for noobs ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; < dedicated semicolon area
    }
    if (!menuOpen) {
        let foundOre = oreDisplays.find((i) => (i.pos[0] <= clickPos[0] && i.cornerPos[0] >= clickPos[0] && i.pos[1] <= clickPos[1] && i.cornerPos[1] >= clickPos[1] && i.type != "voidOre" && i.yOffset == yOffset))
        if (foundOre) {
            if (soundOn) {
                breakSfx.playsfx()
            }
            destroy(foundOre)
        }
    }
}

function rclick(e) {
    e.preventDefault()
    let clickPos = [e.layerX - 40, e.layerY - 40]
    let tp = (a) => {return a * 100 + invScroll + 80}
    if (invVisible && !menuOpen) {
        let foundOre = discoveredOres.find((i, ind) => {return (1300 <= clickPos[0] && clickPos[0] <= 1360 && tp(ind) <= clickPos[1] && clickPos[1] <= tp(ind) + 60)})
        if (foundOre) {
            if (sellAmt == "max" && foundOre.sellPrice != 0) {
                money += foundOre.amt * foundOre.sellPrice
                foundOre.amt = 0
            } else {
                if (foundOre.amt >= sellAmt && foundOre.sellPrice != 0) {
                    foundOre.amt -= sellAmt
                    money += foundOre.sellPrice * sellAmt
                }
            }  
        }      
    }
    if (!menuOpen) {
        let foundOre = oreDisplays.find((i) => (i.pos[0] <= clickPos[0] && i.cornerPos[0] >= clickPos[0] && i.pos[1] <= clickPos[1] && i.cornerPos[1] >= clickPos[1] && i.type != "voidOre" && i.yOffset == yOffset))
        if (foundOre) {
            if (!hotbarLoc) {
                hotbarLoc = foundOre.pos
            } else {
                hotbarLoc = false
            }
        }
    }
    e.preventDefault()
}

function select(list) {
    let percent = Math.random() * 100
    for (let i of list) {
        if (i.percentChunk[0] <= percent && i.percentChunk[1] > percent) {
            return i//; //; //; //; //; //;
        }
    }
}

function selectEven(list) {
    return list[~~(Math.random() * list.length)]
}

// one of these comments has a zero width space you will never know which one haha
// its not the one above me OR this one i swear to giggles

function generateSave() {
    let oreSave = objMap(oreDict, (i) => {return [!i.discovered, (i.amt * (i.name.charCodeAt(0) - 96))]})
    let itemSave = objMap(itemDict, (i) => {return i.amt * (i.name.charCodeAt(0) - 96)})
    let save = {"ores": oreSave, "money": money, "items": itemSave, "version": version}
    let encryptedSave = btoa(JSON.stringify(save))
    localStorage.setItem("save", encryptedSave)
}

function loadSave() {
    let decryptedSave = JSON.parse(atob(localStorage.getItem("save")))
    console.log(decryptedSave)
    for (let i in decryptedSave.ores) {
        console.log(i)
        oreDict[i].amt = decryptedSave.ores[i][1] / (oreDict[i].name.charCodeAt(0) - 96)
        if (~~(oreDict[i].amt) != oreDict[i].amt || (oreDict[i].amt != 0 && decryptedSave.ores[i][0])) {
            localStorage.removeItem("save")
            window.write("rip bozo 💀💀💀💀")
        }
        oreDict[i].discovered = !decryptedSave.ores[i][0]
        if (!discoveredOres.includes(oreDict[i]) && !decryptedSave.ores[i][0]) {
            discoveredOres.push(oreDict[i])
            discoveredOres.sort((a, b) => {
                return a.rarity - b.rarity
            })
        }
    }
    if ([decryptedSave.version, version].sort()[0] == decryptedSave.version && decryptedSave.version != version) {
        notinfo = [`New update ${version}!`, "#00FF00", 150]
    }
    if (decryptedSave.version) {
        for (let i in decryptedSave.items) {
            itemDict[i].amt = decryptedSave.items[i] / (itemDict[i].name.charCodeAt(0) - 96)
            if (~~(itemDict[i].amt) != itemDict[i].amt) {
                localStorage.removeItem("save")
                window.write("rip bozo 💀💀💀💀")
            }
        }
        money = decryptedSave.money
    } else {
        notinfo = ["Your money and items have been wiped due to an economy revamp.", "#FF0000", 150]
    }
}

function recalcChunks(l) {
    percentsUsed[l] = 0
    for (i of layerOres[l]) {
        if (i.rarity > 1) {
            i.percentChunk = [percentsUsed[l], percentsUsed[l] + (100/i.rarity)]
            percentsUsed[l] += (100 / i.rarity)
        }
    }
    oreDict[layers[l]].percentChunk = [percentsUsed[l], 100]
}

class Ore {
    constructor(name, rarity, layer, properties = {}) {
        this.name = name
        this.rarity = rarity
        this.layer = layer

        if (!this.layer.includes("pool:")) {
            this.layerNum = layers.indexOf(layer)
            if (rarity > 1) {
                this.percentChunk = [percentsUsed[this.layerNum], percentsUsed[this.layerNum] + (100/rarity)]
                percentsUsed[this.layerNum] += (100 / this.rarity)
            }
        } else {
            this.pool = this.layer.substring(5)
            if (rarity > 1) {
                this.percentChunk = [poolPercs[this.pool], poolPercs[this.pool] + (100/rarity)]
                poolPercs[this.pool] += (100 / this.rarity)
            } 
        }

        this.texture = new Image(32, 32)
        this.texture.src = `assets/ores/${name}.png`
        this.texture.onload = () => {loadProg += 1}

        this.properties = properties
        this.discovered = false
        this.amt = 0

        this.rarityLevel = rarity >= 2 ? rarity >= 75 ? rarity >= 250 ? rarity >= 1000 ? rarity >= 7500 ? rarity >= 25000 ? rarity >= 125000 ? "beyond" : "unreal" : "mythic" : "epic" : "rare" : "uncommon" : "common" : "base"
        this.rarityColor = rarityColors[this.rarityLevel]
        this.sellPrice = ~~(this.rarity / (4 * Math.log10(this.rarity)))
        this.dispRarity = rarity
        
        this.particles = null

        allOres.push(this)
        if (rarity != 0 && !this.layer.includes("pool:")) {
            console.log(this)
            layerOres[this.layerNum].push(this)
        } else if (rarity != 0) {
            poolOres[this.pool].push(this)
        }
        oreDict[name] = this
        // AGHGHAGHGAGGAHGAHGGHA!????????!?!?!
    }
}

class OreDisplay {
    constructor(parent, x, y, spawn = true, yOff = yOffset) {
        this.texture = parent.texture
        this.type = parent.name
        this.pos = [x, y]
        this.spawn = spawn
        this.cornerPos = [x + 40, y + 40]
        this.yOffset = yOff
        this.literalY = y + yOff
        this.deposit = Math.random() > 0.95 && parent.rarity > 1
        if (this.deposit && soundOn) {
            depositSfx.playsfx()
        }
        this.particles = parent.particles
        this.spawnTime = parTime
    }
}

class Button {
    // java has done something to me
    constructor(name, pos, size, txSize, func, sidebar = true, aboveMenu = false) {
        this.name = name
        this.pos = pos
        this.size = size
        this.func = func
        this.sidebar = sidebar
        this.aboveMenu = aboveMenu

        this.cornerPos = [pos[0] + size, pos[1] + size]
        this.texture = new Image(txSize, txSize)
        this.texture.src = `assets/gui/${name}.png`
        this.texture.onload = () => {loadProg += 1}

        this.hidden = false
        this.dependency = () => {return true}
        buttons.push(this) 
    }
}

class Item {
    constructor(name, price, use) {
        this.name = name
        this.price = price
        this.use = use

        this.tx = new Image(16, 16)
        this.tx.src = `assets/items/${name}.png`
        this.tx.onload = () => {loadProg += 1}
        this.amt = 0

        items.push(this)
        itemDict[name] = this
    }
}

parsToLoad.forEach((i) => {
    img = new Image(8, 8)
    img.src = `assets/particles/${i}.png`
    img.onload = () => {loadProg += 1}
    parTextures[i] = img // would use map but no worky

})

class Particle {
    constructor(tx, mov, cullType) {
        let args = arguments
        this.mov = mov
        this.tx = parTextures[tx]
        this.id = parSum
        parSum += 1
        this.yOffset = yOffset
        this.cullType = cullType
        this.layer = ~~(yOffset / 9200)
        this.dead = false
        if (mov == "sts") {
            /* 
            side to side
            args: tx, mov, sy (start y), speed, angle
            */
           this.sx = args[6] || 0
           this.sy = args[3]
           this.speed = args[4]
           this.angle = args[5]
           this.pos = [this.sx, 900 - this.sy]
           this.dangle = dtrConstant * this.angle // i cant name variables
           this.tmove = [Math.sin(this.dangle) * this.speed, -Math.cos(this.dangle) * this.speed]
        }
        if (mov == "decay") {
            this.x = args[3]
            this.y = args[4]
            this.angle = args[5]
            this.speed = args[6]
            this.lifetime = args[7]
            this.pos = [this.x, this.y]
            this.dangle = dtrConstant * this.angle // i cant name variables
            this.tmove = [Math.sin(this.dangle) * this.speed, -Math.cos(this.dangle) * this.speed]
            this.life = 0
        }
        if (mov == "gravity") {
            this.x = args[3]
            this.y = args[4]
            this.dx = args[5]
            this.dy = args[6]
            this.grav = args[7]
            this.pos = [this.x, this.y]
        }
        particles.push(this)
    }

    tick() {
        if (deadIds.includes(this.id) || this.dead) {
            this.dead = true
            return
        }
        if (this.mov == "sts") {
            this.pos[0] += this.tmove[0]
            this.pos[1] += this.tmove[1]
            // almost all languages have double inequalities
            if (!(0 < this.pos[0] && this.pos[0] < 1600 && 0 < this.pos[1] && this.pos[1] < 900)) {
                deadIds.push(this.id)
                console.log("rip")
            } else if (yOffset != this.yOffset && this.cullType == "offset") {
                deadIds.push(this.id)
            } else if (~~(yOffset / 9200) != this.layer && this.cullType == "layer") {
                deadIds.push(this.id)
            }
        }
        if (this.mov == "decay") {
            this.pos[0] += this.tmove[0]
            this.pos[1] += this.tmove[1]
            this.life += 1
            if (this.life >= this.lifetime) {
                deadIds.push(this.id)
                console.log("rip")
            } else if (yOffset != this.yOffset && this.cullType == "offset") {
                deadIds.push(this.id)
            } else if (~~(yOffset / 9200) != this.layer && this.cullType == "layer") {
                deadIds.push(this.id)
            }
        }
        if (this.mov == "gravity") {
            this.pos[0] += this.dx
            this.pos[1] -= this.dy
            this.dy -= this.grav
            if (this.pos[1] >= 950) {
                deadIds.push(this.id)
            } else if (yOffset != this.yOffset && this.cullType == "offset") {
                deadIds.push(this.id)
            } else if (~~(yOffset / 9200) != this.layer && this.cullType == "layer") {
                deadIds.push(this.id)
            }
        }
    }
}

class IngameEvent {
    constructor(start, dur, del, sf, ef, name) {
        this.start = start
        this.dur = dur
        this.del = del
        this.sf = sf
        this.ef = ef
        this.active = false
        this.interval = dur + del
        this.name = name
        this.icon = new Image(32, 32)
        this.icon.src = `./assets/eventIcons/${name}.png`
        this.icon.onload = () => {loadProg += 1}

        ingameEvents.push(this)
    }
    tick() {
        let date = new Date()
        let mins = date.getMinutes() + 60 * date.getHours() + this.start
        if (mins % (this.interval) <= this.dur && !this.active) {
            this.active = true
            this.sf()
            notinfo = [eventDescs[this.name], "#FFD700", 300]
            eventSfx.playsfx()
        } else if (this.active && mins % (this.interval) > this.dur) {
            this.active = false
            this.ef()
        }
    }
}

class StaticImage {
    constructor(name, w, h) {
        this.img = new Image(w, h)
        this.img.src = `./assets/static/${name}.png`
        this.img.onload = () => {loadProg += 1}
        staticImages.push(this)
    }
}

let voidOre = new Ore("voidOre", 0, "stone", {"display": "stop breaking my game"})
let grass = new Ore("grass", 0, "stone")
let dirt = new Ore("dirt", 0, "stone")
/* above do not spawn randomly
they are fixed layers
AMOGUS! - sc3d*/

let stone = new Ore("stone", 1, "stone")
let copper = new Ore("copper", 15, "stone")
let iron = new Ore("iron", 20, "stone")
let coal = new Ore("coal", 25, "stone")
let quartz = new Ore("quartz", 30, "stone")
let chromeOre = new Ore("chrome", 75, "stone", {"display": "Chrome"})
chromeOre.particles = {frequency: 20, texture: "sparkle", speed: 2, lifetime: 15}
let pyrite = new Ore("pyrite", 80, "stone")
let potteryShard = new Ore("potteryShard", 250, "stone", {"display": "Pottery Shard"})
potteryShard.particles = {frequency: 25, texture: "dust", speed: 5, lifetime: 30}
let bronzeRelic = new Ore("bronzeRelic", 400, "stone", {"display": "Bronze Relic"})
bronzeRelic.particles = {frequency: 25, texture: "dust", speed: 5, lifetime: 30}
let gold = new Ore("gold", 650, "stone")
gold.particles = {frequency: 8, texture: "sparkle", speed: 3, lifetime: 20}
let roseGold = new Ore("roseGold", 1111, "stone", {"display": "Rose Gold"})
roseGold.particles = {frequency: 7, texture: "sparkle", speed: 3, lifetime: 25}
let platinum = new Ore("platinum", 1200, "stone")
platinum.particles = {frequency: 4, texture: "sparkle", speed: 3, lifetime: 40}
let emerald = new Ore("emerald", 1500, "stone")
emerald.particles = {frequency: 5, texture: "sparkle", speed: 3, lifteime: 20}
let vyvyxyn = new Ore("vyvyxyn", 3333, "stone")
vyvyxyn.particles = {frequency: 1, texture: "sparkle", speed: 2, lifetime: 40}
let crysor = new Ore("crysor", 11000, "stone")
crysor.particles = {frequency: 2, texture: "snowflake", speed: 3, lifetime: 35}
let crystalResonance = new Ore("crystalResonance", 60000, "stone", {"display": "Crystal of Resonance"})
stone.percentChunk = [percentsUsed[0], 100]

let denseStone = new Ore("denseStone", 1, "denseStone", {"display": "Dense Stone"})
let denseIron = new Ore("denseIron", 20, "denseStone", {"display": "Dense Iron"})
let denseCoal = new Ore("denseCoal", 20, "denseStone", {"display": "Dense Coal"})
let lead = new Ore("lead", 50, "denseStone")
let titanium = new Ore("titanium", 70, "denseStone")
let tungsten = new Ore("tungsten", 130, "denseStone")
let feldspar = new Ore("feldspar", 180, "denseStone")
feldspar.particles = {frequency: 20, texture: "sparkle", speed: 3, lifetime: 20}
let amethyst = new Ore("amethyst", 200, "denseStone")
amethyst.particles = {frequency: 15, texture: "sparkle", speed: 3, lifetime: 20}
let scrapMetal = new Ore("scrapMetal", 300, "denseStone", {"display": "Scrap Metal"})
scrapMetal.particles = {frequency: 25, texture: "dust", speed: 5, lifetime: 30}
let tigersEye = new Ore("tigersEye", 750, "denseStone", {"display": "Tiger's Eye"})
tigersEye.particles = {frequency: 19, texture: "sparkle", speed: 2, lifetime: 25}
let diamond = new Ore("diamond", 1000, "denseStone")
diamond.particles = {frequency: 5, texture: "sparkle", speed: 4, lifetime: 30}
let foliatite = new Ore("foliatite", 4916, "denseStone")
let blackDiamond = new Ore("blackDiamond", 5000, "denseStone", {"display": "Black Diamond"})
blackDiamond.particles = {frequency: 3, texture: "sparkle", speed: 3, lifetime: 35}
let paralyte = new Ore("paralyte", 19191, "denseStone")
let astralonDivinis = new Ore("astralonDivinis", 160000, "denseStone", {"display": "🌙 Astralon Divinis 🔆"})
denseStone.percentChunk = [percentsUsed[1], 100]

let basalt = new Ore("basalt", 1, "basalt")
let halite = new Ore("halite", 25, "basalt")
let fluorite = new Ore("fluorite", 25, "basalt")
let basalticQuartz = new Ore("basalticQuartz", 30, "basalt", {"display": "Basaltic Quartz"})
let redGarnet = new Ore("redGarnet", 30, "basalt", {"display": "Red Garnet"})
redGarnet.particles = {frequency: 25, texture: "sparkle", speed: 2, lifetime: 20}
let roseQuartz = new Ore("roseQuartz", 100, "basalt", {"display": "Rose Quartz"})
let doodooQuartz = new Ore("doodooQuartz", 150, "basalt", {"display": "Smoky Quartz...?"})
let silver = new Ore("silver", 350, "basalt")
let mandarinGarnet = new Ore("mandarinGarnet", 900, "basalt", {"display": "Mandarin Garnet"})
mandarinGarnet.particles = {frequency: 15, texture: "sparkle", speed: 3, lifetime: 30}
let uranium = new Ore("uranium", 3000, "basalt", {"display": "Uranium"})
let citrine = new Ore("citrine", 4000, "basalt", {"display": "Citrine"})
let greenGarnet = new Ore("greenGarnet", 5500, "basalt", {"display": "Green Garnet"})
greenGarnet.particles = {frequency: 10, texture: "sparkle", speed: 4, lifetime: 40}
let bvylyvyncv = new Ore("bvylyvyncv", 13331, "basalt")
bvylyvyncv.particles = {frequency: 1, texture: "heyguysquandaledinglehere", speed: 4, lifetime: 40}
let porvileon = new Ore("porvileon", 17643, "basalt")
let missingSignal = new Ore("missingSignal", 65536, "basalt", {"display": "Missing Signal"})
basalt.percentChunk = [percentsUsed[2], 100]

let magma = new Ore("magma", 1, "magma")
let conglomerate = new Ore("conglomerate", 80, "magma")
let breccia = new Ore("breccia", 100, "magma")
let xyxyvylyn = new Ore("xyxyvylyn", 3333, "magma")
xyxyvylyn.particles = {frequency: 1, texture: "darkle", speed: 2, lifetime: 40}
let infernalGold = new Ore("infernalGold", 4000, "magma", {"display": "Infernal Gold"})
infernalGold.particles = {frequency: 3, texture: "char", speed: 3, lifetime: 40}
let vulkani = new Ore("vulkani", 50000, "magma", {"display": "Vulkanï"})
vulkani.particles = {frequency: 1, texture: "char", speed: 5, lifetime: 50}
magma.percentChunk = [percentsUsed[3], 100]
// all above is redonculuous
// no.

let meteorite = new Ore("meteorite", 1, "pool:meteor")
let meteoricFeldspar = new Ore("meteoricFeldspar", 90, "pool:meteor", {"display": "Meteoric Feldpsar"})
let biovessel = new Ore("biovessel", 6000, "pool:meteor")
meteorite.percentChunk = [poolPercs["meteor"], 100]

let inv = new Button("inv", [1525, 10], 64, 32, () => {invVisible = !invVisible})
let save = new Button("save", [1525, 85], 64, 32, generateSave)

let settings = new Button("settings", [1525, 160], 64, 32, () => {settingsVisible = true; menuOpen = true})
let closeSettings = new Button("closeSettings", [1025, 70], 64, 32, () => {settingsVisible = false; menuOpen = false}, false, true)
closeSettings.dependency = () => {return settingsVisible}

let musicOnBtn = new Button("musicOn", [550, 160], 128, 32, () => {music.playbackRate = 0}, false, true)
musicOnBtn.dependency = () => {return music.playbackRate && settingsVisible}
let musicOff = new Button("musicOff", [550, 160], 128, 32, () => {music.playbackRate = 1}, false, true)
musicOff.dependency = () => {return !music.playbackRate && settingsVisible}

let soundOnBtn = new Button("soundOn", [925, 160], 128, 32, () => {soundOn = !soundOn}, false, true)
soundOnBtn.dependency = () => {return soundOn && settingsVisible}
let soundOff = new Button("soundOff", [925, 160], 128, 32, () => {soundOn = !soundOn}, false, true)
soundOff.dependency = () => {return !soundOn && settingsVisible}

let credits = new Button("credits", [1525, 305], 32, 32, () => {creditsVisible = true; menuOpen = true})
let closeCredits = new Button("closeCredits", [1025, 70], 64, 32, () => {creditsVisible = false; menuOpen = false}, false, true)
closeCredits.dependency = () => {return creditsVisible}
let info = new Button("info", [1557, 305], 32, 32, () => {infoVisible = true; menuOpen = true})
let closeInfo = new Button("closeInfo", [1025, 70], 64, 32, () => {infoVisible = false; menuOpen = false}, false, true)
closeInfo.dependency = () => {return creditsVisible}

let sellOne = new Button("sellOne", [1340, 0], 32, 16, () => {sellAmt = 1}, false, true)
sellOne.dependency = sellDependency(sellOne, 1)
let sellTen = new Button("sellTen", [1380, 0], 32, 16, () => {sellAmt = 10}, false, true)
sellTen.dependency = sellDependency(sellTen, 10)
let sellMax = new Button("sellMax", [1420, 0], 32, 16, () => {sellAmt = "max"}, false, true)
sellMax.dependency = sellDependency(sellMax, "max")

let shop = new Button("shop", [1525, 235], 64, 32, () => {shopVisible = true, menuOpen = true}, true, false)
let closeShop = new Button("closeShop", [1225, 70], 64, 32, () => {shopVisible = false, menuOpen = false}, false, true)
closeShop.dependency = () => {return shopVisible}
let buyDynamite = new Button("buyDynamite", [320, 200], 32, 16, () => {buy("dynamite")}, false, true)
buyDynamite.dependency = () => {return shopVisible}
let buyPocket = new Button("buyDynamite", [320, 400], 32, 16, () => {buy("pocket")}, false, true)
buyPocket.dependency = () => {return shopVisible}
// let buyTunnelBore = new Button("buyTunnelBore", [320, 400], 32, 16, () => {buy("tunnelBore")}, false, true)
// buyTunnelBore.dependency = () => {return shopVisible}
// Delayed hee hee!


let dynamite = new Item("dynamite", 200, dynamiteUse)
function dynamiteUse() {
    for (i of dynamitePattern) {
        foundOre = oreDisplays.filter(j => j.yOffset == yOffset && j.type != "voidOre").find((j) => {return j.pos[0] == i[0] + hotbarLoc[0] && j.pos[1] == i[1] + hotbarLoc[1]})
        if (foundOre) {
            destroy(foundOre, "dynamite")
        }
    }
    if (soundOn) {
        dynamiteSfx.playsfx()
    }
    dynamite.amt -= 1
}

let pocket = new Item("pocket", 600, pocketUse)
function pocketUse() {
    let currentLayer = ~~(yOffset / 9200)
    if (currentLayer == 3) {
        return
    }
    yOffset = (currentLayer + 1) * 9200
    voidOre.texture = voidTextures[~~(yOffset / 9200)]
    generateOre(240, 240)
    destroy(oreDisplays.at(-1, "pocket"))
    pocket.amt -= 1
}

let meteorShower = new IngameEvent(0, 10, debug ? 0 : 50, () => {
    for (i of layerOres[1]) {
        if (i.rarity != 1) {
            i.rarity *= 0.95
        }
    }
    feldspar.rarity = 120
    recalcChunks(1)
    let meteorOff = 9200
    for (i of Array(10).keys()) {
        for (i of Array(3).keys()) {
            let loc = [~~(Math.random() * 1600 / 40) * 40, ~~(Math.random() * 920 / 40) * 40 + meteorOff]
            let posMap = meteorPattern.map((i) => {return [i[0] + loc[0], i[1] + loc[1]]})
            posMap.forEach((i) => {meteorLocs.push(i)})
        }
        meteorOff += 920
    }
    
}, () => {
    for (i of layerOres[1]) {
        if (i.rarity != 1) {
            i.rarity /= 0.95
        }
    }
    feldspar.rarity = 180
    recalcChunks(1)

    meteorLocs = []
}, "meteorShower")

let tree = new StaticImage("tree", 64, 64)

function sellDependency(button, amt) {
    return () => { // functions returning functions which return wowie
        button.pos[1] = discoveredOres.length * 100 + 90 + invScroll
        button.cornerPos[1] = discoveredOres.length * 100 + 122 + invScroll
        if (sellAmt == amt && invVisible) {
            ctx.beginPath()
            ctx.strokeStyle = "#ffffff"
            ctx.strokeRect(button.pos[0], button.pos[1], 32, 32)
            ctx.closePath()
        }
        return invVisible
    } // like using the more interesting features in languages like this
}

for (let i of layers) {
    let tx = new Image(16, 16)
    tx.src = `assets/bgs/${i}-bg.png`
    voidTextures.push(tx)
    loadProg += 1
}

voidOre.texture = voidTextures[0]

setInterval(tick, 16)
setInterval(generateSave, 10000)
setInterval(() => {
    deadIds = []
}, 100) // setting it directly after no worky for some reason
setInterval(() => {
    ingameEvents.forEach(i => i.tick())
}, 1000)

canvas.addEventListener("click", click) // spaghet
canvas.addEventListener("contextmenu", rclick)
document.addEventListener("keydown", (e) => {
    if (e.key == "ArrowDown" && yOffset < 36800) {
        yOffset += 920
        if (~~(yOffset / 920) % 10 == 0) { // weird code bc floats dont wanna work
            voidOre.texture = voidTextures[~~(yOffset / 9200)]
        }
    } else if (e.key == "ArrowUp" && yOffset > 0) {
        yOffset -= 920
        if (~~(yOffset / 920) % 10 == 9) {
            voidOre.texture = voidTextures[~~(yOffset / 9200)]
        }
    } else if (e.key == "g" && debug) {
        generateOre(120, 120)
    } else if (e.key == "[") {
        invVisible = !invVisible
    } else if (e.key == "s" && e.ctrlKey) {
        e.preventDefault()
        generateSave()
    } else if (e.key == "ArrowLeft") {
        scrollDelta = 1
    }
    else if (e.key == "ArrowRight") {
        scrollDelta = -1
    }
})
document.addEventListener("keyup", (e) => {
    if ((e.key == "ArrowRight" || e.key == "ArrowLeft") && invVisible) {
        scrollDelta = 0
        if (e.key == "ArrowLeft") {
            if (performance.now() - lastLarrow < 500) {
                invScroll = 0
            }
            lastLarrow = performance.now()
        }
    }
})
canvas.addEventListener("wheel", (e) => {
    if (invVisible) {
        invScroll += e.wheelDeltaY / 2.5
        invScroll = Math.min(invScroll, 0)
    }
})

if (localStorage.getItem("save")) {
    loadSave()
}
