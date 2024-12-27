let mapContainer = document.querySelector('#map');

let servicePopup = document.createElement('div');

let nextQuestion = 0;

servicePopup.style.display = 'none';
servicePopup.style.position = 'absolute',
servicePopup.style.top = 0,
servicePopup.style.background = '#00000080',
servicePopup.style.color = '#fff',
servicePopup.style.padding = '8px 16px',
servicePopup.style.borderRadius = '16px',
servicePopup.style.margin = '8px',
servicePopup.style.opacity = 0,
servicePopup.style.transition = 'opacity .5s';

document.body.append(servicePopup);





let serviceMessage = {
    open: function(text) {
        servicePopup.textContent = text;
        servicePopup.style.display = 'block';
        servicePopup.style.opacity = 0;
        setTimeout(() => {
            servicePopup.style.opacity = 1;
        }, 500)
    },
    close: function() {
        servicePopup.style.opacity = 0;
        setTimeout(() => {
            servicePopup.style.display = 'none';
            servicePopup.textContent = '';
        }, 1000)
    }
}

let game = {
    teams: {
        q: 0,
        all:[]
    },
    whoStep: '',
    whoStepNow: function() {
        return this.whoStep
    },
    nextStepWhoCounter: 0,
    qWasNum: 0,
    set: {
        thisGame: {
            gamers: 'pvc',
            questionsDBNum: 0,
            pvcDifficulty: 'easy'
        },
        pvc: {
            difficulty: {
                easy: {
                    name: 'легко',
                    coef: .65,
                    checked: true
                },
                normal: {
                    name: 'нормально',
                    coef: .8
                }
            }
        },
        questionsDB: [
            {tabName: 'eng-word', id: 0, name: 'English words (B1)', checked: true, q: 200},
            {tabName: 'uk-ua', id: 1, name: 'Питання на загальні теми', q: 78},
        ]
    }
};





let startBlockGenerate = function () {
    let gameSetPlayer = `
            <div class="answer-var">
            <input type="radio" name="game-mode" id="pvp" value="pvp" onclick="document.querySelector('#pvc-difficulty').disabled = true";game.set.thisGame.gamers = 'pvp'>
            <label for="pvp">Грати вдвох</label>
            </div>
            <div class="answer-var">
            <input type="radio" name="game-mode" id="pvc" value="pvc" onclick="document.querySelector('#pvc-difficulty').disabled = false;game.set.thisGame.gamers = 'pvc'" checked>
            <label for="pvc">Гравець проти комп'ютера</label>
            </div>
        `;
    let gameSetPvc = '';
    for (let i in game.set.pvc.difficulty) {
        gameSetPvc += `
            <div class="answer-var">
            <input type="radio" name="game-difficulty" id="${i}" value="${i}"${game.set.pvc.difficulty[i].checked ? ' checked' : ''} onclick="game.set.thisGame.pvcDifficulty = '${i}'">
            <label for="${i}">${game.set.pvc.difficulty[i].name}</label>
            </div>
        `;
    }
    let gameSetData = '';
    for (let i in game.set.questionsDB) {
        gameSetData += `
            <div class="answer-var">
            <input type="radio" name="game-questions" id="${game.set.questionsDB[i].tabName}" value="${game.set.questionsDB[i].id}"${game.set.questionsDB[i].checked ? ' checked' : ''} onclick="game.set.thisGame.questionsDBNum = ${game.set.questionsDB[i].id}">
            <label for="${game.set.questionsDB[i].tabName}">${game.set.questionsDB[i].name}</label>
            </div>
        `;
    }
    let startBlock = document.createElement('div');
    document.body.append(startBlock);
    startBlock.classList.add('start-block', 'popup');
    startBlock.insertAdjacentHTML('beforeend', `
        <div class="wrapper">
        <h1>Колонізація</h1>
        <p>Захоплюйте регіони, збирайте колекції ресурсів. Переможе той, хто отримає найбільше балів впливу.</p>
        <p>Щоб захопити регіон, потрібно правильно відповісти на питання.</p>
        <form>
        <fieldset class="answers">
        <legend>Оберіть кількість гравців:</legend>
        ${gameSetPlayer}
        </fieldset>
        <fieldset id="pvc-difficulty" class="answers">
        <legend>Оберіть складність гри з комп'ютером:</legend>
        ${gameSetPvc}
        </fieldset>
        <fieldset class="answers">
        <legend>Оберіть тематику питань:</legend>
        ${gameSetData}
        </fieldset>
        <button id="start-game">Почати гру</button>
        </form>
        </div>
    `);

    document.body.append(startBlock);

    document.querySelector('#start-game').addEventListener('click', (e) => {
        e.preventDefault();
        startBlock.classList.add('hidden');
        initGame();
        console.log(game);
    });
};

startBlockGenerate();

let initGame = function () {
    let mapSize = {
        x: 8,
        y: 8,
        sizeX: 1000,
        sizeY: 1000,
    };
    
    let mapSet = {
        dotsMidDistX: Math.round(mapSize.sizeX / (mapSize.x), -2),
        dotsMidDistY: Math.round(mapSize.sizeY / (mapSize.y), -2),
        dotsDiffX:  Math.round(mapSize.sizeX / (mapSize.x) * 0.6, -2),
        dotsDiffY: Math.round(mapSize.sizeY / (mapSize.y) * 0.6, -2),
        resources: [
            {name: 'meadow', ico: '', chance: 1},
            {name: 'meadow', ico: '', chance: 1},
            {name: 'wood', ico: 'images/ico/wood.svg', chance: 1, count: true, group: 'plants'},
            {name: 'fish', ico: 'images/ico/fish.svg', chance: .5, count: true, group: 'animal'},
            {name: 'water', ico: '', chance: .5},
            {name: 'water', ico: '', chance: .5},
            {name: 'mountain', ico: '', chance: .5},
            {name: 'choco', ico: 'images/ico/choco.svg', chance: .1, count: true, group: 'plants'},
            {name: 'wheat', ico: 'images/ico/wheat.svg', chance: 1, count: true, group: 'plants'},
            {name: 'cow', ico: 'images/ico/cow.svg', chance: .7, count: true, group: 'animal'},
            {name: 'chicken', ico: 'images/ico/chicken.svg', chance: .7, count: true, group: 'animal'},
            {name: 'diamond', ico: 'images/ico/diamond.svg', chance: .1, count: true, group: 'resource'},
            {name: 'gold', ico: 'images/ico/gold.svg', chance: .1, count: true, group: 'resource'},
            {name: 'stone', ico: 'images/ico/stone.svg', chance: .5, count: true, group: 'resource'}
        ],
        resourcesIcoSize: 60,
        resourcesIcoLink: {}
    }
    
    let resourcesOwnerInner = function() {
        let y = {};
        mapSet.resources.forEach((e) => {
            if (e.count === true) {
                if(Object.keys(y).includes(e.group)) {
                    if(Object.keys(y[e.group]).includes(e.name)) {} else {
                        y[e.group][e.name] = 0;
                        mapSet.resourcesIcoLink[e.name] = e.ico;
                    }
                } else {
                    y[e.group] = {};
                    if(Object.keys(y[e.group]).includes(e.name)) {} else {
                        y[e.group][e.name] = 0;
                        mapSet.resourcesIcoLink[e.name] = e.ico;
                    }
                    
                }
            }
        })
        return y;
    }
    
    
    
    class Team {
        
        constructor (name, styleName, pvc) {
            this.points = 0;
            this.pointsData = {
                resources: 0,
                group: 0,
                regions: 0,
                total: 0
            };
            this.regionOwner = [];
            this.resourcesOwner = resourcesOwnerInner();
            this.regionsCanBuy = 0;
            this.regionsCanBuyAll = [];
            this.regionStyleName = styleName;
            this.name = name;
            this.pvc = false;
            pvc ? this.pvc = pvc: '';
            game.teams.all[game.teams.q] = this;
            game.teams.q++;
        }
    }
    
    
    let teamOne = new Team('Огурчик','team-one');
    let teamTwo = new Team('Помідорчик','team-two');
    
    game.whoStep = game.teams.all[0];
    
    let dots = [];
    
    function randomDist(diff) {
        return Math.random() * diff - diff * 0.5;
    }
    function randomNumber(max) {
        return Math.floor((Math.random() * max));
    }
    
    for(let y = 0; y <= mapSize.y; y++) {
        dots[y] = [];
        for(let x = 0; x <= mapSize.x; x++) {
            let dotX = 0;
            let dotY = 0;
            if (x === 0) {
                dotX  = 0;
            } else if (x === mapSize.x) {
                dotX = mapSize.sizeX;
            } else {
                dotX = Math.round(mapSet.dotsMidDistX * x + randomDist(mapSet.dotsDiffX));
            }
            if (y === 0) {
                dotY = 0;
            } else if (y === mapSize.y) {
                dotY = mapSize.sizeY;
            } else {
                dotY = Math.round(mapSet.dotsMidDistY * y + randomDist(mapSet.dotsDiffY));
            }
            dots[y][x] = [dotX, dotY];
        }
    }
    
    
    let regionCounter = 0;
    class Region {
        constructor() {
            this.id = regionCounter++;
            this.owner;
            this.resources = [];
            this.type = 'earth';
            this.style = ['region'];
            this.regionInteractive;
            this.near = {
                topLeft: null,
                top: null,
                topRight: null,
                centerLeft: null,
                centerRight: null,
                bottomLeft: null,
                bottom: null,
                bottomRight: null
            },
            this.coord = [
                [0,0],[0,0],[0,0],[0,0]
            ],
            this.coordRound = {
                dots: [
                    [0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]
                ],
                dotsState : [
                    0, 0, 0, 0
                ],
                round: {
                    rSet: 20,
                    r: [this.rSet,this.rSet],
                    t: [0, 0, 1],
                    d: [0, 0]
                },
            }
            this.middleCoord = [];
        }
    }
    let regions = [];
    let regionsMatrix = [];
    
    for (let y = 0; y < mapSize.y; y++) {
        regionsMatrix.push([]);
        for (let x = 0; x < mapSize.x; x++) {
            regions.push(new Region());
            let z = [
                dots[y][x],
                dots[y][x+1],
                dots[y+1][x+1],
                dots[y+1][x]
            ];
            regions[regions.length - 1].coord = z;
            regions[regions.length - 1].middleCoord = [
                (z[2][0]+z[0][0]+z[3][0]+z[1][0])/4,(z[2][1]+z[0][1]+z[3][1]+z[1][1])/4
            ]
            regions[regions.length - 1].resources.push(mapSet.resources[randomNumber(mapSet.resources.length)]);
    
    
            if(regions[regions.length - 1].resources[0].name === 'fish'||regions[regions.length - 1].resources[0].name === 'water') {
                regions[regions.length - 1].style.push('water');
                regions[regions.length - 1].type = 'water';
            } else if(regions[regions.length - 1].resources[0].name === 'coal'||regions[regions.length - 1].resources[0].name === 'gold'||regions[regions.length - 1].resources[0].name === 'mountain') {
                regions[regions.length - 1].style.push('mountain');
                regions[regions.length - 1].type = 'mountain';
            } else if(regions[regions.length - 1].resources[0].name === 'diamond'||regions[regions.length - 1].resources[0].name === 'stone') {
                regions[regions.length - 1].style.push('rock');
                regions[regions.length - 1].type = 'mountain';
            } 
    
            regionsMatrix[y][x] = regions[regions.length - 1];
        }
    }
    
    
    for (let y = 0; y < mapSize.y; y++) {
        for (let x = 0; x < mapSize.x; x++) {
            regionsMatrix[y][x].near = getElementsArr(y, x, regionsMatrix);
        }
    }
    
        function getElementsArr(i, j, arr) {
            var yIndexes = getIndexes(arr, i);
            var xIndexes = getIndexes(arr[i], j);
            var thisArr = {
              topLeft: yIndexes.prev === mapSize.y - 1 || xIndexes.prev === mapSize.x - 1 ? false : arr[yIndexes.prev][xIndexes.prev],
              top:  yIndexes.prev === mapSize.y - 1 ? false : arr[yIndexes.prev][xIndexes.curr],
              topRight:  yIndexes.prev === mapSize.y - 1 || xIndexes.next === 0 ? false : arr[yIndexes.prev][xIndexes.next],
              centerLeft:  xIndexes.prev === mapSize.x - 1 ? false : arr[yIndexes.curr][xIndexes.prev],
              centerRight: xIndexes.next === 0 ? false : arr[yIndexes.curr][xIndexes.next],
              bottomLeft:  yIndexes.next === 0 || xIndexes.prev === mapSize.x - 1 ? false : arr[yIndexes.next][xIndexes.prev],
              bottom:  yIndexes.next === 0 ? false : arr[yIndexes.next][xIndexes.curr],
              bottomRight: yIndexes.next === 0 || xIndexes.next === 0 ? false : arr[yIndexes.next][xIndexes.next],
            }
            return thisArr;
        }
        function getIndexes(arr, i) {
            let prev = i - 1;
            let next = i + 1;
    
            if (i == 0) {
              prev = arr.length - 1;
            } else if (i == arr.length - 1) {
              next = 0;
            }
    
            return {
              prev: prev,
              curr: i,
              next: next};
        }
    
        regions.forEach(e => {
            e.coordRound.dots = [
                e.coord[0],
                [(e.coord[0][0]+e.coord[1][0])/2, (e.coord[0][1]+e.coord[1][1])/2],
                e.coord[1],
                [(e.coord[1][0]+e.coord[2][0])/2, (e.coord[1][1]+e.coord[2][1])/2],
                e.coord[2],
                [(e.coord[2][0]+e.coord[3][0])/2, (e.coord[2][1]+e.coord[3][1])/2],
                e.coord[3],
                [(e.coord[3][0]+e.coord[0][0])/2, (e.coord[3][1]+e.coord[0][1])/2]
            ]
            e.coordRound.dotsState = [
                dotStateF(e, e.near.centerLeft, e.near.topLeft, e.near.top, 0),
                dotStateF(e, e.near.top, e.near.topRight, e.near.centerRight, 1),
                dotStateF(e, e.near.centerRight, e.near.bottomRight, e.near.bottom, 2),
                dotStateF(e, e.near.bottom, e.near.bottomLeft, e.near.centerLeft, 3)
            ]
        });
    
    
    function dotStateF(current, firstN, secondN, thirdN, dotNum) {
        let i;
        if (firstN.type != current.type && thirdN.type != current.type && secondN.type) {
            i = 1;
        } else if (dotNum === 0 && secondN.type === current.type) {
            i = 2;
        } else if (dotNum === 1 && secondN.type === current.type) {
            i = 3;
        } else if (dotNum === 2 && secondN.type === current.type) {
            i = 4;
        } else if (dotNum === 3 && secondN.type === current.type) {
            i = 5;
        } else if (thirdN.type === current.type && secondN.type ) {
            i = 6; 
        } else if (firstN.type === current.type && secondN.type ) {
            i = 7; 
        } else if (firstN.type === current.type && thirdN.type === current.type ) {
            i = 0; 
        } else {
            i = 0
        }
    
        if (secondN.type === current.type && current.type === 'water') {
            i = dotNum + 2;
        }
    
        secondN.type === false ? i = 0: '';
    
    
        return i
    }
    
    let polygonInner, icoInner;
    let polygonInnerNew, icoInnerNew;
    
    for(let i = 0; i < regions.length; i++) {
        let pathD = [];
        let counter = 0;
        pathD.push(' M');
        for (let y = 0; y < regions[i].coordRound.dotsState.length; y++) {
            counter === 8 ? counter = 0 : '';
            if (regions[i].coordRound.dotsState[y] === 0) {
                if (y === 0) {
                    pathD.push(regions[i].coordRound.dots[counter]);
                    pathD.push(' L');
                    pathD.push(regions[i].coordRound.dots[counter + 1]);
                    counter += 2;
                } else {
                    pathD.push(' L');
                    pathD.push(regions[i].coordRound.dots[counter]);
                    pathD.push(' L');
                    pathD.push(regions[i].coordRound.dots[counter+1]);
                    counter += 2;
                }
            } else if (regions[i].coordRound.dotsState[y] === 1) {
                if (y === 0) {
                    pathD.push(regions[i].coordRound.dots[7]);
                    pathD.push(' Q');
                    pathD.push(regions[i].coordRound.dots[counter]);
                    pathD.push(' ');
                    pathD.push(regions[i].coordRound.dots[counter + 1]);
                    counter += 2;
                } else {
                    pathD.push(' Q');
                    pathD.push(regions[i].coordRound.dots[counter]);
                    pathD.push(' ');
                    pathD.push(regions[i].coordRound.dots[counter + 1]);
                    counter += 2;
                }
    
            } else if (regions[i].coordRound.dotsState[y] === 2) {
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' L');
                pathD.push(regions[i].near.topLeft.coordRound.dots[3]);
                pathD.push(' Q');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' ');
                pathD.push(regions[i].coordRound.dots[counter + 1]);
                counter += 2;
            } else if (regions[i].coordRound.dotsState[y] === 3) {
                pathD.push(' Q');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' ');
                pathD.push(regions[i].near.top.coordRound.dots[3]);
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter + 1]);
                counter += 2;
    
            } else if (regions[i].coordRound.dotsState[y] === 4) {
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' L');
                pathD.push(regions[i].near.bottom.coordRound.dots[3]);
                pathD.push(' Q');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' ');
                pathD.push(regions[i].coordRound.dots[counter + 1]);
                counter += 2;
            } else if (regions[i].coordRound.dotsState[y] === 5) {
                pathD.push(' Q');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' ');
                pathD.push(regions[i].near.bottom.coordRound.dots[7]);
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter+1]);
                counter += 2;
            } else if (regions[i].coordRound.dotsState[y] === 6) {
                if (y === 0) {
                    pathD.push(regions[i].coordRound.dots[7])
                    pathD.push(' Q');
                    pathD.push(regions[i].coordRound.dots[counter]);
                    pathD.push(' ');
                    pathD.push(regions[i].near.top.coordRound.dots[7]);
                } else if (y === 1) {
                    pathD.push(' Q');
                    pathD.push(regions[i].coordRound.dots[counter]);
                    pathD.push(' ');
                    pathD.push(regions[i].near.centerRight.coordRound.dots[1]);
                } else if (y === 2) {
                    pathD.push(' Q');
                    pathD.push(regions[i].coordRound.dots[counter]);
                    pathD.push(' ');
                    pathD.push(regions[i].near.bottom.coordRound.dots[3])
                } else if (y === 3) {
                    pathD.push(' Q');
                    pathD.push(regions[i].coordRound.dots[counter]);
                    pathD.push(' ');
                    pathD.push(regions[i].near.centerLeft.coordRound.dots[5])
                }
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter+1]);
                counter += 2;
            } else if (regions[i].coordRound.dotsState[y] === 7) {
                if (y === 0) {
                    pathD.push(regions[i].near.centerLeft.coordRound.dots[1])
                } else if (y === 1) {
                    pathD.push(' L');
                    pathD.push(regions[i].near.top.coordRound.dots[3])
                } else if (y === 2) {
                    pathD.push(' L');
                    pathD.push(regions[i].near.centerRight.coordRound.dots[5])
                } else if (y === 3) {
                    pathD.push(' L');
                    pathD.push(regions[i].near.bottom.coordRound.dots[7])
                }
                
                pathD.push(' Q');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' ');
                pathD.push(regions[i].coordRound.dots[counter+1]);
                counter += 2;
            }
           
            
        }
    
        polygonInnerNew += `<path d = " ${pathD.join('')} Z" class="${regions[i].style.join(' ')}"/>`;
        icoInnerNew += `<image xlink:href="${regions[i].resources[0].ico}" x="${regions[i].middleCoord[0]-mapSet.resourcesIcoSize/2}" y="${regions[i].middleCoord[1]-mapSet.resourcesIcoSize/2}px" height="${mapSet.resourcesIcoSize}px" width="${mapSet.resourcesIcoSize}px" class="resource-ico-visible"/>`;
        pathD = [];
    
    }
    
    document.querySelector('#map').innerHTML = polygonInnerNew + icoInnerNew;
    
    for(let i = 0; i < regions.length; i++) {
        let pathD = [];
        for (let y = 0; y < regions[i].coord.length; y++){
            y === 0 ? '': pathD.push(' L') ;
            pathD.push(regions[i].coord[y]);
        }
        polygonInner += `<path d = "M ${pathD.join('')} Z"  class="${regions[i].style.join(' ')} region-interactive"/>`;
        icoInner += `<image xlink:href="images/ico/plus.svg" x="${regions[i].middleCoord[0]-mapSet.resourcesIcoSize/2}" y="${regions[i].middleCoord[1]-mapSet.resourcesIcoSize/2}px" class="region_plus hidden region-ico-interactive" height="${mapSet.resourcesIcoSize}px" width="${mapSet.resourcesIcoSize}px"/>`;
        pathD = [];
    }
    
    document.querySelector('#map_regions').innerHTML = icoInner + polygonInner ;
    
    
    
    let regionInteractive = document.querySelectorAll('.region-interactive');
    let regionIcoInteractive = document.querySelectorAll('.region-ico-interactive');
    let regionInteractiveCounter = 0;
    
    regionInteractive.forEach((e) => {
        e.ico = regionIcoInteractive[regionInteractiveCounter];
        e.region = regions[regionInteractiveCounter];
        regions[regionInteractiveCounter].regionInteractive = e;
        e.resources =  regions[regionInteractiveCounter].resources;
        e.active = false;
        e.owner = false;
        e.near = {
            top: e.region.near.top ? e.region.near.top.id : null,
            right: e.region.near.centerRight ? e.region.near.centerRight.id : null,
            bottom: e.region.near.bottom ? e.region.near.bottom.id : null,
            left: e.region.near.centerLeft ? e.region.near.centerLeft.id : null
        };
        e.whoCanBuy = [];
        e.id = e.region.id
        e.changeActive = function(team) {
            e.active === false ? e.active = true: e.active = false;
            e.owner === false ?  e.owner = team : e.owner = false;
            e.region.owner = team;
            if (e.near.left != null && regionInteractive[e.near.left].active == false) {
                regionIcoInteractive[e.near.left].classList.remove('hidden');
                regionInteractive[e.near.left].classList.add('active');
                regionInteractive[e.near.left].classList.add(e.region.owner.regionStyleName);
                regionIcoInteractive[e.near.left].classList.add(e.region.owner.regionStyleName);
                regionInteractive[e.near.left].whoCanBuy.push(e.region.owner);
                if(e.region.owner.regionsCanBuyAll.includes(regionInteractive[e.near.left]) === false) {
                    e.region.owner.regionsCanBuyAll.push(regionInteractive[e.near.left])
                };
            }
            if (e.near.top != null && regionInteractive[e.near.top].active == false) {
                regionIcoInteractive[e.near.top].classList.remove('hidden');
                regionInteractive[e.near.top].classList.add('active');
                regionInteractive[e.near.top].classList.add(e.region.owner.regionStyleName);
                regionIcoInteractive[e.near.top].classList.add(e.region.owner.regionStyleName);
                regionInteractive[e.near.top].whoCanBuy.push(e.region.owner);
                if(e.region.owner.regionsCanBuyAll.includes(regionInteractive[e.near.top]) === false) {
                    e.region.owner.regionsCanBuyAll.push(regionInteractive[e.near.top])
                };
            }
            if (e.near.right != null && regionInteractive[e.near.right].active == false) {
                regionIcoInteractive[e.near.right].classList.remove('hidden');
                regionInteractive[e.near.right].classList.add('active');
                regionInteractive[e.near.right].classList.add(e.region.owner.regionStyleName);
                regionIcoInteractive[e.near.right].classList.add(e.region.owner.regionStyleName);
                regionInteractive[e.near.right].whoCanBuy.push(e.region.owner);
                if(e.region.owner.regionsCanBuyAll.includes(regionInteractive[e.near.right]) === false) {
                    e.region.owner.regionsCanBuyAll.push(regionInteractive[e.near.right])
                };
            }
            if (e.near.bottom != null && regionInteractive[e.near.bottom].active == false) {
                regionIcoInteractive[e.near.bottom].classList.remove('hidden');
                regionInteractive[e.near.bottom].classList.add('active');
                regionInteractive[e.near.bottom].classList.add(e.region.owner.regionStyleName);
                regionIcoInteractive[e.near.bottom].classList.add(e.region.owner.regionStyleName);
                regionInteractive[e.near.bottom].whoCanBuy.push(e.region.owner);
                if(e.region.owner.regionsCanBuyAll.includes(regionInteractive[e.near.bottom]) === false) {
                    e.region.owner.regionsCanBuyAll.push(regionInteractive[e.near.bottom])
                };
            }
            team.regionOwner.includes(e.region) ? team.regionOwner.splice(e.region) : team.regionOwner.push(e.region);
            game.teams.all.forEach((t) => {
                e.classList.remove(t.regionStyleName);
            })
            if(team.regionsCanBuyAll.includes(e)) {
                team.regionsCanBuyAll = team.regionsCanBuyAll.filter((i) => i !== e);
            };
            e.classList.add(team.regionStyleName);
            e.ico.classList.add('hidden');
            
            
            
        };
        e.addEventListener('mouseover', () => {
            e.classList.toggle('hover');
        })
        e.addEventListener('mouseout', () => {
            e.classList.toggle('hover');
        })
    
        e.addEventListener('click', () => {
            if(e.classList.contains('active') && e.whoCanBuy.includes(game.whoStep)) {
                newQuestion(e);
            };
        });
    
        regionInteractiveCounter++;
    })
    
    
    regionInteractive[0].changeActive(game.teams.all[0]);
    regionInteractive[regionInteractive.length - 1].changeActive(game.teams.all[1]);
    
    document.querySelector('#map_regions').classList.add(game.teams.all[game.nextStepWhoCounter].regionStyleName);
    
    
    // calc points per step
    let calcPoints = function (status) {
        game.teams.all.forEach((t) => {
            t.regionsCanBuy = 0;
            t.resourcesOwner = resourcesOwnerInner();
        })
    
        regionInteractive.forEach((e) => {
            e.whoCanBuy.forEach((i) => {
                game.teams.all.forEach((t) => {
                    if(t === i) {
                        t.regionsCanBuy ++;
                    }
                })
    
            })
            game.teams.all.forEach((t) => {
                if(e.resources[0].count === true && t === e.owner) {
                    t.resourcesOwner[e.resources[0].group][e.resources[0].name] ++;
                }
            })
        })
    
    
        game.teams.all.forEach((t) => {
            let p = {
                regions: 0,
                resources: 0,
                group: 0,
            };
            for (let group in t.resourcesOwner) {
                let pMin = 100;
                for (let resource in t.resourcesOwner[group]) {
                    p.resources += t.resourcesOwner[group][resource];
                    pMin > t.resourcesOwner[group][resource] ? pMin = t.resourcesOwner[group][resource] : '';
                }
                p.group += pMin;
            }
            p.regions = t.regionOwner.length;
            if (status === 'preLoad' ) {
    
            } else {
                t.points += p.resources + p.group + p.regions;
            } 
            t.pointsData = p;
            t.pointsData.total = p.resources + p.group + p.regions;
        });
    
        
        
    }
    
    // render available steps for team
    
    function renderStep () {
    
    }
    // step choice
    
    function nextStep() {
    
        
        game.nextStepWhoCounter++;
    
        document.querySelector('#map_regions').classList.remove(game.teams.all[game.nextStepWhoCounter - 1].regionStyleName);
        
        if(game.nextStepWhoCounter === game.teams.all.length) {
            game.nextStepWhoCounter = 0;
            calcPoints();
        } else {
            calcPoints('preLoad')
        }
        game.whoStep = game.teams.all[game.nextStepWhoCounter];
    
        
        document.querySelector('#map_regions').classList.add(game.teams.all[game.nextStepWhoCounter].regionStyleName);
    
        if(nextQuestion > questionData.length - 5) {
            loadNewQuestions();
        }
    }
    
    
    
    // question
    let popup = document.createElement('div'),
        wrapper = document.createElement('div'),
        answersWrapper = document.createElement('fieldset'),
        service = document.createElement('div'),
        question = document.createElement('div'),
        questionsQuantity = 10;
    
        document.querySelector('body').append(popup);
        popup.classList.add('popup', 'hidden');
        popup.append(wrapper);
        wrapper.classList.add('wrapper');
        wrapper.append(question);
        question.classList.add('question');
        wrapper.append(answersWrapper);
        answersWrapper.classList.add('answers');
        wrapper.append(service);
        service.classList.add('service');
    
        let questionData = [],
            questionDataQ = game.set.questionsDB[game.set.thisGame.questionsDBNum].q,
            questionNumberData = '',
            questionNumberRandomAll = [];
    
        let loadNewQuestions = function(firstly) {
            if (firstly === 'firstly') {
                let blockDisplay = document.createElement('div');
                blockDisplay.classList.add('popup', 'block-display');
                document.body.append(blockDisplay);
            }
            let questionNumberRandom = [];
    
            for(let i = 0; i < questionsQuantity; i++) {
                let y = Math.floor(Math.random() * questionDataQ);
                if (questionNumberRandomAll.includes(y)) {
                    i--;
                } else {
                    questionNumberRandom.push(y);
                    questionNumberRandomAll.push(y);
                }
            }
        
            questionNumberData = questionNumberRandom.join(',');
            
            fetch (`https://script.google.com/macros/s/AKfycby4ieWE4JGyFkMNx4L5w3ctrOo2Grg9qfrBvKW9NL8VGyTbTWkBQwYH8daraVlYsiij/exec?tab=${game.set.questionsDB[game.set.thisGame.questionsDBNum].tabName}&id=` + questionNumberRandom,  {
                mode: 'cors'
            }).then(serviceMessage.open('Завантажуємо питання'))
            .then((response) => response.json())
            .then((data) => {
                if (data.goods.length > 0) {
                    data.goods.forEach(e => {
                        questionData.push(e[0]);
                    })
                } ;
            })
            .finally(()=>{
                serviceMessage.close();
                if (firstly === 'firstly') {
                    document.querySelector('.block-display').remove();
                }
            })
            
        }
    
    
    
    
        
    
    
        let newQuestion = function (newQuestionRegion) {
            question.textContent = questionData[nextQuestion].Q;
            answersWrapper.innerHTML = '';
            for(let i = 0; i < 4; i++) {
                let variant = document.createElement('div');
                let input = document.createElement('input');
                let label = document.createElement('label');
                answersWrapper.append(variant);
                variant.classList.add('answer-var');
                variant.append(input);
                input.type = 'radio';
                variant.append(label);
                let varData = 'V' + (i + 1);
                label.textContent = questionData[nextQuestion][varData];
                input.name = 'answer';
                input.id = varData;
                label.htmlFor = varData;
                label.addEventListener('click', (e) => {
                    if (input.checked === true) {
                        answersWrapper.disabled = true;
                        if (input.id === ('V' + questionData[nextQuestion].A)) {
                            service.classList.add('success');
                            service.textContent = "відповідь правильна, ви захопили новий регіон";
                            newQuestionRegion.changeActive(game.whoStepNow());
                            newQuestionRegion.classList.remove('active');
                            newQuestionRegion.ico.classList.add('hidden');
                            newQuestionRegion.whoCanBuy = [];
                        } else {
                            service.classList.add('wrong');
                            service.textContent = `ви помилились, відповідь: ${questionData[nextQuestion][('V' + questionData[nextQuestion].A)]}`;
                        };
                        setTimeout(() => {
                            service.classList.remove('success', 'wrong');
                            service.textContent = "";
                            popup.classList.add('hidden');
                            nextStep();
                            nextQuestion++;
                            dashboardGenerate();
                            answersWrapper.disabled = false;
                        },2000)
                    } else{
                        service.textContent = "натисніть ще раз для підтвердження";
                    }
                })
            }
    
            popup.classList.remove('hidden');
    
        }
    
    
    // DASHBOARD
    
    let dashboardContainer = document.querySelector('.dashboard');
    
    let dashboardGenerate = function() {
        dashboardContainer.querySelectorAll('.team').forEach((e) => {
            e.classList.add('hidden');
        });
        game.teams.all.forEach((e) => {
            let resourcesInner = '';
            for(let prop in e.resourcesOwner) {
                resourcesInner += `<div class="group">`;
                for(let res in e.resourcesOwner[prop]) {
                    resourcesInner += `<div class="item">
                        <img src="${mapSet.resourcesIcoLink[res]}" alt="${res}">
                        <span class="number">${e.resourcesOwner[prop][res]}</span>
                    </div>`;
                };
                resourcesInner += `</div>`;
            }
    
    
            dashboardContainer.insertAdjacentHTML('beforeend', 
                `
                <div class="team ${e.regionStyleName}">
                    <div class="header">
                        <div class="name">
                            ${e.name}
                        </div>
                        <div class="total">
                            ${e.points}
                        </div>
                    </div>
                    <div class="resources">
                        ${resourcesInner}
                        <div class="group total">
                            <div class="item">
                                <span>Колекцій</span>
                                <span class="number">${e.pointsData.group}</span>
                            </div>
                            <div class="item">
                                <span>Регіонів</span>
                                <span class="number">${e.pointsData.regions}</span>
                            </div>
                        </div>
                    </div>
                    <div class="addition">
                        <div class="name">
                            За наступний хід
                        </div>
                        <div class="total">
                            ${e.pointsData.total}
                        </div>
                    </div>
                </div>
            `
        
            )
            dashboardContainer.querySelectorAll('.hidden').forEach((e) => {
                e.remove();
            }) 
        })
        
    }
    
    
    // let teamOne = new Team('Огурчик','team-one');
    // let teamTwo = new Team('Помідорчик','team-two');
    
    // game.whoStep = game.teams.all[0];
    
    
    console.log(game.teams);
    calcPoints('preLoad');
    dashboardGenerate();
    loadNewQuestions('firstly');
    
    
    
    
    
    
    
    
};


