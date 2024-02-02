let dynamitePattern = [
    [0, 2],
    [-1, 1],[0, 1],[1, 1],
    [-2, 0],[-1, 0],[0, 0],[1, 0],[2, 0], 
    [-1, -1],[0, -1],[1, -1],
    [0, -2]
].map((i) => i.map(j => j * 40)).sort((i) => {return (Math.abs(i[0]) + Math.abs(i[1]))/40}).sort((i) => {return (Math.abs(i[0]) + Math.abs(i[1]))/40 - 1})
// why spend 2 minutes manually doing it when you can spend 5 minutes making the most ungodly code known to man?
