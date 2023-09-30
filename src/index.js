
// YO WHATS UP before you dig into my code watch https://www.youtube.com/watch?v=EAOxlNiDWt0

let canvas = document.querySelector("#gameCanvas")
let ctx = canvas.getContext("2d")
let loadProg = 0
let loaded = false
let percentsUsed = [0, 0, 0, 0]
let layers = ["stone", "denseStone", "basalt", "magma"]
let oreDisplays = []
let allOres = []
let layerOres = [[], [], [], []]
let discoveredOres = []
let voidTextures = []
let oreDict = {}
let yOffset = 0
let bgImage = document.querySelector("#whywontchangebgimageworkbruh")
let debug = window.location.href.includes("file")
let invVisible = false 
let invScroll = 0
let rarityColors = {"base": "#7f7f7f", "common": "#d9d9d9", "uncommon": "#93c47d", "rare": "#4a86e8", "epic": "#ffd966", "mythic": "#46bdc6", "unseen": "#9900ff", "beyond": "#000000"}

ctx.imageSmoothingEnabled = false;

let music = new Audio("./assets/audio/music.mp3")
music.loop = true

function tick() {
    if (loadProg == allOres.length + layerOres.length && loaded == false) {
        console.log("Loaded textures in " + performance.now() + "ms")
        loaded = true
        startGame()
    }
}

function render() {
    ctx.clearRect(0, 0, 2000, 920)
    oreDisplays.filter((i) => (i.yOffset == yOffset)).forEach((i) => {
        ctx.beginPath()
        ctx.drawImage(i.texture, i.pos[0], i.pos[1], 40, 40)
        if (i.deposit) {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 4;
            ctx.strokeRect(i.pos[0], i.pos[1], 40, 40)
        }
        ctx.closePath()
    })
    if (debug) {
        ctx.beginPath();
        ctx.font = "20px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText("Debug enabled", 10, 880)
        ctx.fillText("yOffset: " + yOffset, 10, 905)
        ctx.closePath();
    }
    if (invVisible) {
        ctx.beginPath();
        ctx.fillStyle = "#331144"
        ctx.rect(1550, 0, 350, 920)
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(1530, 0, 20, 920)
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.font = "20px sans-serif"
        ctx.fillStyle == "#9966cc"

        discoveredOres.forEach((i) => {
            ctx.drawImage(i.texture, 1600, 80 + (discoveredOres.indexOf(i) * 100) + invScroll, 60, 60)
            ctx.fillText(i.properties?.display || capitalizeFirstLetter(i.name), 1670, 100 + (discoveredOres.indexOf(i) * 100) + invScroll)
            ctx.fillText("1/" + i.rarity.toLocaleString(), 1670, 120 + (discoveredOres.indexOf(i) * 100) + invScroll)
            ctx.fillText(i.amt.toLocaleString(), 1670, 140 + (discoveredOres.indexOf(i) * 100) + invScroll)
            ctx.strokeStyle = i.rarityColor
            ctx.lineWidth = 5
            ctx.strokeRect(1597.5, 77.5 + (discoveredOres.indexOf(i) * 100) + invScroll, 62.5, 62.5)
        })

        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "#331144"
        ctx.rect(1550, 0, 350, 60)
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "#9966cc"
        ctx.rect(1550, 0, 350, 10)
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.font = "30px sans-serif";
        ctx.fillText("INVENTORY", 1635, 50)
        ctx.closePath();
        
    }
} 

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} // thank you 121k rep stack overflow guy

function objMap(obj, func) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v)]));
} // thank you 49.2k rep stack overflow guy

// stack overflow is the best website for developers

function startGame() {
    oreDisplays.push(new OreDisplay(stone, 100, 80, true))
}

function destroy(target) {
    oreDisplays.splice(oreDisplays.indexOf(target), 1, new OreDisplay(voidOre, target.pos[0], target.pos[1], true))
    addOre(oreDict[target.type], target.deposit ? selectEven([5, 6, 7]) : 1)
    if (target.spawn) {
        generateOre(target.pos[0] - 40, target.pos[1])
        generateOre(target.pos[0] + 40, target.pos[1])
        generateOre(target.pos[0], target.pos[1] - 40)
        generateOre(target.pos[0], target.pos[1] + 40)
    }
    if (music.paused) {
        music.play()
    }
}

function generateOre(x, y) {
    let currentLayer = ~~(yOffset / 9200)
    let newOre = new OreDisplay(select(layerOres[currentLayer]), x, y, true)
    if (newOre.pos[1] == 920) {
        newOre.yOffset = newOre.literalY
        newOre.pos[1] = 0
        newOre.cornerPos[1] = 40 
        newOre.type = oreDict[layers[currentLayer]].name
        if (~~(newOre.yOffset / 920) % 10 == 0) {
            newOre.texture = oreDict[layers[currentLayer + 1]].texture
            newOre.type = layers[currentLayer + 1].name
        }
    }
    if (newOre.pos[1] == -40) {
        newOre.yOffset -= 920 
        newOre.pos[1] = 880
        newOre.cornerPos[1] = 920
        newOre.type = layers[currentLayer]
        if (~~(newOre.yOffset / 920) % 10 == 9) {
            newOre.texture = oreDict[layers[currentLayer - 1]].texture
            newOre.type = layers[currentLayer - 1].name
        }
    } else {
    }
    let oreExists = oreDisplays.find((i) => (i.pos[0] == newOre.pos[0] && i.pos[1] == newOre.pos[1] && i.yOffset == newOre.yOffset))
    if (!oreExists) {
        oreDisplays.push(newOre)
    }
}

function addOre(type, num) {
    type.amt += num
    type.discovered = true
    if (!discoveredOres.includes(type)) {
        discoveredOres.push(type)
        discoveredOres.sort((a, b) => {
            return a.rarity - b.rarity
        })
    }
}

function click(e) {
    let clickPos = [e.layerX - 40, e.layerY - 40]
    let foundOre = oreDisplays.find((i) => (i.pos[0] <= clickPos[0] && i.cornerPos[0] >= clickPos[0] && i.pos[1] <= clickPos[1] && i.cornerPos[1] >= clickPos[1] && i.type != "voidOre" && i.yOffset == yOffset))
    if (foundOre) {
        destroy(foundOre)
    }
}

function select(list) {
    let percent = Math.random() * 100
    for (i of list) {
        if (i.percentChunk[0] <= percent && i.percentChunk[1] > percent) {
            return i
        }
    }
}

function selectEven(list) {
    return list[~~(Math.random() * list.length)]
}

function generateSave() {
    let oreSave = objMap(oreDict, (i) => {return [!i.discovered, (i.amt * (i.name.charCodeAt(0) - 96))]})
    let save = {ores: oreSave}
    let encryptedSave = btoa(JSON.stringify(save))
    localStorage.setItem("save", encryptedSave)
}

function loadSave() {
    let decryptedSave = JSON.parse(atob(localStorage.getItem("save")))
    console.log(decryptedSave)
    for (i in decryptedSave.ores) {
        console.log(i)
        oreDict[i].amt = decryptedSave.ores[i][1] / (oreDict[i].name.charCodeAt(0) - 96)
        if (~~(oreDict[i].amt) != oreDict[i].amt || (oreDict[i].amt != 0 && decryptedSave.ores[i][0])) {
            localStorage.removeItem("save")
            window.location = "https://youtu.be/NNv2RHR62Rs?t=9"
        }
        oreDict[i].discovered = !decryptedSave.ores[i][0]
        if (!discoveredOres.includes(oreDict[i]) && !decryptedSave.ores[i][0]) {
            discoveredOres.push(oreDict[i])
            discoveredOres.sort((a, b) => {
                return a.rarity - b.rarity
            })
        }
    }
}

class Ore {
    constructor(name, rarity, layer, properties = {}) {
        this.name = name
        this.rarity = rarity
        this.layer = layer

        this.layerNum = layers.indexOf(layer)
        if (rarity > 1) {
            this.percentChunk = [percentsUsed[this.layerNum], percentsUsed[this.layerNum] + (100/rarity)]
            percentsUsed[this.layerNum] += (100 / this.rarity)
        }

        this.texture = new Image(32, 32)
        this.texture.src = `assets/ores/${name}.png`
        this.texture.onload = () => {loadProg += 1}

        this.properties = properties
        this.discovered = false
        this.amt = 0

        this.rarityLevel = rarity >= 2 ? rarity >= 75 ? rarity >= 250 ? rarity >= 1000 ? rarity >= 7500 ? rarity >= 25000 ? rarity >= 125000 ? "beyond" : "unseen" : "mythic" : "epic" : "rare" : "uncommon" : "common" : "base"
        this.rarityColor = rarityColors[this.rarityLevel]
        
        allOres.push(this)
        layerOres[this.layerNum].push(this)
        oreDict[name] = this

    }
}

class OreDisplay {
    constructor(parent, x, y, spawn) {
        this.texture = parent.texture
        this.type = parent.name
        this.pos = [x, y]
        this.spawn = spawn
        this.cornerPos = [x + 40, y + 40]
        this.yOffset = yOffset
        this.literalY = y + yOffset
        this.deposit = Math.random() > 0.95 && parent.rarity > 1
    }
}

let voidOre = new Ore("voidOre", 0, "stone", {"display": "stop breaking my game"})

let stone = new Ore("stone", 1, "stone")
let copper = new Ore("copper", 15, "stone")
let iron = new Ore("iron", 20, "stone")
let coal = new Ore("coal", 25, "stone")
let quartz = new Ore("quartz", 30, "stone")
let pyrite = new Ore("pyrite", 80, "stone")
let gold = new Ore("gold", 650, "stone")
let roseGold = new Ore("roseGold", 1111, "stone", {"display": "Rose Gold"})

let emerald = new Ore("emerald", 1500, "stone")
stone.percentChunk = [percentsUsed[0], 100]

let denseStone = new Ore("denseStone", 1, "denseStone", {"display": "Dense Stone"})
let denseIron = new Ore("denseIron", 20, "denseStone", {"display": "Dense Iron"})
let denseCoal = new Ore("denseCoal", 20, "denseStone", {"display": "Dense Coal"})
let amethyst = new Ore("amethyst", 200, "denseStone")
denseStone.percentChunk = [percentsUsed[1], 100]

let basalt = new Ore("basalt", 1, "basalt")
let basalticQuartz = new Ore("basalticQuartz", 30, "basalt", {"display": "Basaltic Quartz"})
let roseQuartz = new Ore("roseQuartz", 100, "basalt", {"display": "Rose Quartz"})
basalt.percentChunk = [percentsUsed[2], 100]

let magma = new Ore("magma", 1, "magma")
magma.percentChunk = [percentsUsed[3], 100]

voidOre.percentChunk = [-1, -1]

for (i of layers) {
    let tx = new Image(16, 16)
    tx.src = `assets/bgs/${i}-bg.png`
    voidTextures.push(tx)
    loadProg += 1
}

voidOre.texture = voidTextures[0]

setInterval(tick, 10)
setInterval(render, 16)
setInterval(generateSave, 10000)

canvas.addEventListener("click", click)
document.addEventListener("keydown", (e) => {
    if (e.key == "ArrowDown" && yOffset < 36800) {
        yOffset += 920
        if (~~(yOffset / 920) % 10 == 0) { // weird code bc floats dont wanna work
            bgImage.src = `assets/bgs/${layers[~~(yOffset / 9200)]}-bg-tile.png`
            voidOre.texture = voidTextures[~~(yOffset / 9200)]
        }
    } else if (e.key == "ArrowUp" && yOffset > 0) {
        yOffset -= 920
        if (~~(yOffset / 920) % 10 == 9) {
            bgImage.src = `assets/bgs/${layers[~~(yOffset / 9200)]}-bg-tile.png`
            voidOre.texture = voidTextures[~~(yOffset / 9200)]
        } else {
            console.log((yOffset / 920) % 10)
        }
    } else if (e.key == "g" && debug) {
        generateOre(100, 120)
    } else if (e.key == "[") {
        invVisible = !invVisible
    } else if (e.key == "s" && e.ctrlKey) {
        generateSave()
    }
})
canvas.addEventListener("wheel", (e) => {
    console.log(invScroll)
    if (invVisible) {
        invScroll += e.wheelDeltaY / 2.5
        invScroll = Math.min(invScroll, 0)
    }
})

if (localStorage.getItem("save")) {
    loadSave()
}

/*
    TODO LIST 
    - get font work
    refactor nothing good job !!!! i think
*/