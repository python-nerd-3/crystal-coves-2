
// hi before you dig into my code watch https://www.youtube.com/watch?v=EAOxlNiDWt0

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
let buttons = []
let yOffset = 0
let bgImage = document.querySelector("#whywontchangebgimageworkbruh")
let debug = window.location.href.includes("file")
let invVisible = false 
let invScroll = 0
let rarityColors = {"base": "#7f7f7f", "common": "#d9d9d9", "uncommon": "#93c47d", "rare": "#4a86e8", "epic": "#ffd966", "mythic": "#46bdc6", "unseen": "#9900ff", "beyond": "#000000"}
let settingsVisible = false
let menuOpen = false
let parsToLoad = ["placeholder", "char", "dust", "sparkle"]
let parTextures = {}
let particles = []
let deadIds = []
let parSum = 0
let parTime = 0
const dtrConstant = Math.PI / 180

ctx.imageSmoothingEnabled = false

let music = new Audio("./assets/audio/music.mp3")
music.loop = true

function tick() {
    if (loadProg >= allOres.length + layerOres.length + buttons.length + parsToLoad.length && loaded == false) {
        console.log("Loaded textures in " + performance.now() + "ms")
        loaded = true
        startGame()
    }
    areaPars()
    render()
}

function render() {
    let bg = ctx.createPattern(voidOre.texture, "repeat");
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1600, 920)
    if (yOffset === 0) {
        ctx.fillStyle = "#77aaff"
        ctx.fillRect(0, 0, 1600, 280)
        let skyEase = ctx.createLinearGradient(0, 280, 0, 320)
        skyEase.addColorStop(0, "#77aaff")
        skyEase.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = skyEase
        ctx.fillRect(0, 280, 1600, 40)
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
    buttons.filter((i) => {return !i.aboveMenu && !i.hidden}).forEach( (i) => {
        ctx.beginPath()
        if (i.sidebar && invVisible) {
            ctx.drawImage(i.texture, i.pos[0] - 370, i.pos[1], i.size, i.size)
        } else {
            ctx.drawImage(i.texture, i.pos[0], i.pos[1], i.size, i.size)
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

        discoveredOres.forEach((i) => {
            ctx.drawImage(i.texture, 1300, 80 + (discoveredOres.indexOf(i) * 100) + invScroll, 60, 60)
            ctx.fillText(i.properties?.display || capitalizeFirstLetter(i.name), 1370, 100 + (discoveredOres.indexOf(i) * 100) + invScroll)
            if (i.rarity == 0) {
                ctx.fillText("Misc", 1370, 120 + (discoveredOres.indexOf(i) * 100) + invScroll)
            } else if (i.rarity == 1) {
                ctx.fillText("Layer ore", 1370, 120 + (discoveredOres.indexOf(i) * 100) + invScroll)
            } else {
                ctx.fillText("1/" + i.rarity.toLocaleString(), 1370, 120 + (discoveredOres.indexOf(i) * 100) + invScroll);
            }
            ctx.fillText(i.amt.toLocaleString(), 1370, 140 + (discoveredOres.indexOf(i) * 100) + invScroll);
            ctx.strokeStyle = i.rarityColor
            ctx.lineWidth = 5
            ctx.strokeRect(1297.5, 77.5 + (discoveredOres.indexOf(i) * 100) + invScroll, 62.5, 62.5);
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
        
    }
    if (menuOpen) {
        ctx.beginPath()
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(0, 0, 1600, 920)
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
        ctx.font = "50px sans-serif"
        ctx.fillText("SETTINGS", 670, 120)
        ctx.closePath()
    }

    buttons.filter((i) => {return i.aboveMenu && !i.hidden}).forEach((i) => {
        ctx.beginPath()
        if (i.sidebar && invVisible) {
            ctx.drawImage(i.texture, i.pos[0] - 370, i.pos[1], i.size, i.size)
        } else {
            ctx.drawImage(i.texture, i.pos[0], i.pos[1], i.size, i.size)
        }
        ctx.closePath()
    })
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

// stack overflow is th​e best website for developers

function startGame() {
    for (let i of Array(40).keys()) {
        oreDisplays.push(new OreDisplay(grass, i * 40, 160, false))
        oreDisplays.push(new OreDisplay(dirt, i * 40, 200, false))
        oreDisplays.push(new OreDisplay(dirt, i * 40, 240, false))
        oreDisplays.push(new OreDisplay(stone, i * 40, 280, false))
        oreDisplays.push(new OreDisplay(stone, i * 40, 320, true))
    }
}

function destroy(target) {
    console.log(target.type)
    addOre(oreDict[target.type], target.deposit ? selectEven([5, 6, 7]) : 1)
    if (target.spawn) {
        oreDisplays.splice(oreDisplays.indexOf(target), 1, new OreDisplay(voidOre, target.pos[0], target.pos[1], true))
        generateOre(target.pos[0] - 40, target.pos[1])
        generateOre(target.pos[0] + 40, target.pos[1])
        generateOre(target.pos[0], target.pos[1] - 40)
        generateOre(target.pos[0], target.pos[1] + 40)
    } else {
        oreDisplays.splice(oreDisplays.indexOf(target), 1)
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
    
    if (!oreExists && !(y <= 280 && yOffset == 0) && 0 <= x && x <= 1600) {
        oreDisplays.push(newOre)
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
    let foundButton = buttons.find((i) => ((i.pos[0] - (i.sidebar && invVisible ? 370 : 0)) <= clickPos[0] && (i.cornerPos[0] - (i.sidebar && invVisible ? 370 : 0)) >= clickPos[0] && i.pos[1] <= clickPos[1] && i.cornerPos[1] >= clickPos[1] && !buttons.hidden))
    if (foundButton && (!menuOpen || foundButton.aboveMenu)) {
        console.log(foundButton)
        foundButton.func()
        return // documentation is for noobs ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; < dedicated semicolon area
    }
    if (!menuOpen) {
        let foundOre = oreDisplays.find((i) => (i.pos[0] <= clickPos[0] && i.cornerPos[0] >= clickPos[0] && i.pos[1] <= clickPos[1] && i.cornerPos[1] >= clickPos[1] && i.type != "voidOre" && i.yOffset == yOffset))
        if (foundOre) {
            destroy(foundOre)
        }
    }
}

function select(list) {
    let percent = Math.random() * 100
    for (let i of list) {
        if (i.percentChunk[0] <= percent && i.percentChunk[1] > percent) {
            return i//;
        }
    }
}

function selectEven(list) {
    return list[~~(Math.random() * list.length)]
}

// one of these comments has a zero width space you will never know which one haha

function generateSave() {
    let oreSave = objMap(oreDict, (i) => {return [!i.discovered, (i.amt * (i.name.charCodeAt(0) - 96))]})
    let save = {ores: oreSave}
    let encryptedSave = btoa(JSON.stringify(save))
    localStorage.setItem("save", encryptedSave)
    // screwing around with this because sc3d said not to
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
        
        this.particles = null

        allOres.push(this)
        if (rarity != 0) {
            layerOres[this.layerNum].push(this)
        }
        oreDict[name] = this
        // AGHGHAGHGAGGAHGAHGGHA!????????!?!?!
    }
}

class OreDisplay {
    constructor(parent, x, y, spawn = true) {
        this.texture = parent.texture
        this.type = parent.name
        this.pos = [x, y]
        this.spawn = spawn
        this.cornerPos = [x + 40, y + 40]
        this.yOffset = yOffset
        this.literalY = y + yOffset
        this.deposit = Math.random() > 0.95 && parent.rarity > 1
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
        buttons.push(this) 
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
let pyrite = new Ore("pyrite", 80, "stone")
let gold = new Ore("gold", 650, "stone")
gold.particles = {frequency: 8, texture: "sparkle", speed: 3, lifetime: 20}
let roseGold = new Ore("roseGold", 1111, "stone", {"display": "Rose Gold"})
roseGold.particles = {frequency: 8, texture: "sparkle", speed: 3, lifetime: 20}

let emerald = new Ore("emerald", 1500, "stone")
stone.percentChunk = [percentsUsed[0], 100]

let denseStone = new Ore("denseStone", 1, "denseStone", {"display": "Dense Stone"})
let denseIron = new Ore("denseIron", 20, "denseStone", {"display": "Dense Iron"})
let denseCoal = new Ore("denseCoal", 20, "denseStone", {"display": "Dense Coal"})
let amethyst = new Ore("amethyst", 200, "denseStone")
amethyst.particles = {frequency: 20, texture: "sparkle", speed: 3, lifetime: 20}
denseStone.percentChunk = [percentsUsed[1], 100]

let basalt = new Ore("basalt", 1, "basalt")
let basalticQuartz = new Ore("basalticQuartz", 30, "basalt", {"display": "Basaltic Quartz"})
let roseQuartz = new Ore("roseQuartz", 100, "basalt", {"display": "Rose Quartz"})
basalt.percentChunk = [percentsUsed[2], 100]

let magma = new Ore("magma", 1, "magma")
magma.percentChunk = [percentsUsed[3], 100]
// all above is redonculuous
// no.
let inv = new Button("inv", [1525, 10], 64, 32, () => {invVisible = !invVisible})
let save = new Button("save", [1525, 85], 64, 32, generateSave)
let settings = new Button("settings", [1525, 160], 64, 32, () => {settingsVisible = true; menuOpen = true; closeSettings.hidden = false}, true, false)
let closeSettings = new Button("closeSettings", [1025, 70], 64, 32, () => {settingsVisible = false; menuOpen = false; closeSettings.hidden = true}, false, true)
closeSettings.hidden = true

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

canvas.addEventListener("click", click) // spaghet
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
        generateOre(100, 120)
    } else if (e.key == "[") {
        invVisible = !invVisible
    } else if (e.key == "s" && e.ctrlKey) {
        e.preventDefault()
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
    - read issues
    refactor nothing good job !!!! i think
    - listen to sc3d
    - add smurf cat ore description: (we die, we hate, we truth)
    - remove the ideas below refactor nothing good job !!! (jk) :o i'm so offended
*/