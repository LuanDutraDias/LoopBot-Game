const body = document.querySelector('body');
const grid = document.querySelector('#grid');

const robot = document.createElement('i');
robot.classList.add('bi', 'bi-android2');
robot.classList.add('robot-style');

const resultOverlay = document.querySelector('#resultOverlay');
const feedback = document.querySelector('#feedback');
const tryAgainButton = document.querySelector('#tryAgainBtn');
const nextLevelButton = document.querySelector('#nextLevel');

const player = {
    alive: true,
    angle: 0,
    row: 0,
    column: 0,
    high: 0,
    direction: 'down',
};

const squaresArray = [];
let timeouts = [];
let gameRunning = false;
let completedLevels = [false, false, false, false, false, false];
let level = 1; 
const maxLevel = 6;

//a= chao baixo| b= chao medio| c= chao alto| d= chao da luz | e= chao vazio
const maps = [
    //level 1
    [
        'aaeee',
        'eaeee',
        'eaead',
        'eaeae',
        'eaaae',
    ],
    //level 2
    [
        'aaeee',
        'ebabe',
        'eeeae',
        'eeeae',
        'eeede',
    ],
    //level 3
    [
        'aaeee',    
        'ebbbe',
        'eeece',
        'debbe',
        'cbaee',
    ],
];

function createBoard(){
    const currentMap = maps[level - 1];
    grid.innerHTML = "";

    for (let i = 0; i < currentMap.length; i++){
        for (let j = 0; j < currentMap[i].length; j++){
            const square = document.createElement('div');
            square.setAttribute('id', `square-${i}-${j}`);
            square.classList.add('square');
            const char = currentMap[i][j];
            addMapElement(square, char, i, j);
            grid.appendChild(square);
            squaresArray.push(square);
        }
    }
    renderPlayer();
}
createBoard();

function addMapElement(square, char){
    switch(char){
        case 'a':
            square.classList.add('ground-low');
            square.style.background = 'linear-gradient(to top, green, mediumseagreen)';
            break;
        case 'b':
            square.classList.add('ground-medium');
            square.style.background = 'linear-gradient(to top, mediumseagreen, mediumspringgreen)';
            break;
        case 'c':
            square.classList.add('ground-high');
            square.style.background = 'linear-gradient(to top, limegreen, lime)';
            break;  
        case 'd':
            square.classList.add('ground-light');
            square.style.backgroundColor = 'white';
            break;      
        case 'e':
            square.classList.add('ground-empty');
            break;      
    }
}

function renderPlayer() { 
    const square = document.getElementById(`square-${player.row}-${player.column}`); 
    square.appendChild(robot);
}

function movePlayer() { 
    if (isTheNextSquareOnTheMap() == false) return;
    const oldSquare = document.getElementById(`square-${player.row}-${player.column}`); 
    oldSquare.innerHTML = ''; 
    
    if (player.direction === 'up'){
        player.row--;
    }    
    if (player.direction === 'down'){
        player.row++; 
    } 
    if (player.direction === 'left'){
        player.column--;  
    } 
    if (player.direction === 'right'){
        player.column++; 
    } 
    renderPlayer();
    updateCurrentPlayerHigh();
}

function turnLeft() {
    robot.style.transition = 'transform 1s ease';
    if (player.direction === 'up'){
        player.direction = 'left';
        player.angle -= 90;
    }    
    else if (player.direction === 'left'){
        player.direction = 'down';
        player.angle -= 90;
    }
    else if (player.direction === 'down'){
        player.direction = 'right';
        player.angle -= 90;
    }
    else if (player.direction === 'right'){
        player.direction = 'up';
        player.angle -= 90;
    } 
    robot.style.transform = `rotate(${player.angle}deg)`;
}

function turnRight() {
    robot.style.transition = 'transform 1s ease';
    if (player.direction === 'up'){
        player.direction = 'right';
        player.angle += 90;
    } 
    else if (player.direction === 'right'){
        player.direction = 'down';
        player.angle += 90;
    } 
    else if (player.direction === 'down'){
        player.direction = 'left';
        player.angle += 90;
    } 
    else if (player.direction === 'left'){
        player.direction = 'up';
        player.angle += 90;
    } 
    robot.style.transform = `rotate(${player.angle}deg)`;
}

function executeCommands() {
    if (gameRunning || player.alive == false){
        return;
    } 
    gameRunning = true; 
    let delay = 0;

    for (let cmd of commandsToExecuteOnMain){
        if (cmd === 'p1'){ 
            for (let subCmd of commandsToExecuteOnP1){ 
                const id = setTimeout(() => runCommand(subCmd), delay);
                timeouts.push(id); 
                delay += (subCmd === 'forward' || subCmd === 'jump') ? 600 : 1200;
            } 
        } 
        else if (cmd === 'p2'){ 
            for (let subCmd of commandsToExecuteOnP2){ 
                const id = setTimeout(() => runCommand(subCmd), delay);
                timeouts.push(id); 
                delay += (subCmd === 'forward' || subCmd === 'jump') ? 600 : 1200;
            } 
        } 
        else{ 
            const id = setTimeout(() => runCommand(cmd), delay);
            timeouts.push(id); 
            delay += (cmd === 'forward' || cmd === 'jump') ? 600 : 1200;
        } 
    }
    setTimeout(() => {
        gameRunning = false;
        if (player.alive){
            levelResult();
        }    
    }, delay + 1200);
} 

function handleDeath() {
    player.alive = false;
    gameRunning = false;
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    setTimeout(() => {
        robot.style.transition = 'transform 1.5s ease';
        robot.style.transform = 'scale(0) rotate(360deg)';
    }, 650);
    setTimeout(() => levelResult(), 1800);
}

function runCommand(cmd) { 
    if (player.alive == false){
        return;
    }
    else if (cmd === 'forward' && isTheNextSquareOnTheMap()){ 
        if (isTheNextSquareLowerOrEqualPlayerHigh()){ 
        movePlayer(); 
        updateCurrentPlayerHigh(); 
            if (isTheSquareSafe() == false){
            handleDeath(); 
            } 
        } 
    } 
    else if (cmd === 'jump' && isTheNextSquareOnTheMap()){ 
        const nextHigh = nextSquareHigh();
        if (player.high != nextHigh){ 
            movePlayer(); 
        } 
        updateCurrentPlayerHigh(); 
        if (isTheSquareSafe() == false){
            handleDeath(); 
        }    
    }
    else if (cmd === 'left'){
        turnLeft(); 
    }
    else if (cmd === 'right'){
        turnRight(); 
    } 
    else if (cmd === 'light'){ 
        const currentSquare = document.getElementById(`square-${player.row}-${player.column}`); 
        if (currentSquare.style.backgroundColor == 'yellow' && currentSquare.classList.contains('ground-low')){ 
            currentSquare.style.background = 'linear-gradient(to top, green, mediumseagreen)'; 
        }
        else if (currentSquare.style.backgroundColor == 'yellow' && currentSquare.classList.contains('ground-medium')){ 
            currentSquare.style.background = 'linear-gradient(to top, mediumseagreen, mediumspringgreen)'; 
        }
        else if (currentSquare.style.backgroundColor == 'yellow' && currentSquare.classList.contains('ground-high')){ 
            currentSquare.style.background = 'linear-gradient(to top, limegreen, lime)'; 
        }
        else if (currentSquare.style.backgroundColor == 'yellow' && currentSquare.classList.contains('ground-light')){ 
            currentSquare.style.backgroundColor = 'gray'; 
        }   
        else { 
            currentSquare.style.backgroundColor = 'yellow'; 
        } 
    } 
}

function isTheSquareSafe(){
    const currentSquare = document.getElementById(`square-${player.row}-${player.column}`);
    if (currentSquare.classList.contains('ground-empty')){
        return false;
    }
    else {
        return true;
    }
}

function updateCurrentPlayerHigh(){
    const currentSquare = document.getElementById(`square-${player.row}-${player.column}`);
    if (currentSquare.classList.contains('ground-empty') || currentSquare.classList.contains('ground-low')){
        player.high = 0;
    }
    else if (currentSquare.classList.contains('ground-medium')){
        player.high = 1;
    }
    else if (currentSquare.classList.contains('ground-high')){
        player.high = 2;
    }
}

function nextSquareHigh(){
    if (player.direction === 'up'){
        if (document.getElementById(`square-${player.row - 1}-${player.column}`).classList.contains('ground-empty') || document.getElementById(`square-${player.row - 1}-${player.column}`).classList.contains('ground-low')){
            return 0;
        }
        else if (document.getElementById(`square-${player.row - 1}-${player.column}`).classList.contains('ground-medium')){
            return 1;
        }
        else if (document.getElementById(`square-${player.row - 1}-${player.column}`).classList.contains('ground-high')){
            return 2;
        }
    }
    else if (player.direction === 'down'){
        if (document.getElementById(`square-${player.row + 1}-${player.column}`).classList.contains('ground-empty') || document.getElementById(`square-${player.row + 1}-${player.column}`).classList.contains('ground-low')){
            return 0;
        }
        else if (document.getElementById(`square-${player.row + 1}-${player.column}`).classList.contains('ground-medium')){
            return 1;
        }
        else if (document.getElementById(`square-${player.row + 1}-${player.column}`).classList.contains('ground-high')){
            return 2;
        } 
    } 
    else if (player.direction === 'left'){
        if (document.getElementById(`square-${player.row}-${player.column - 1}`).classList.contains('ground-empty') || document.getElementById(`square-${player.row}-${player.column - 1}`).classList.contains('ground-low')){
            return 0;
        }
        else if (document.getElementById(`square-${player.row}-${player.column - 1}`).classList.contains('ground-medium')){
            return 1;
        }
        else if (document.getElementById(`square-${player.row}-${player.column - 1}`).classList.contains('ground-high')){
            return 2;
        } 
    } 
    else if (player.direction === 'right'){
        if (document.getElementById(`square-${player.row}-${player.column + 1}`).classList.contains('ground-empty') || document.getElementById(`square-${player.row}-${player.column + 1}`).classList.contains('ground-low')){
            return 0;
        }
        else if (document.getElementById(`square-${player.row}-${player.column + 1}`).classList.contains('ground-medium')){
            return 1;
        }
        else if (document.getElementById(`square-${player.row}-${player.column + 1}`).classList.contains('ground-high')){
            return 2;
        } 
    } 
}

function getNextSquare() {
    if (player.direction === 'up') {
        return document.getElementById(`square-${player.row - 1}-${player.column}`);
    }
    if (player.direction === 'down') {
        return document.getElementById(`square-${player.row + 1}-${player.column}`);
    }
    if (player.direction === 'left') {
        return document.getElementById(`square-${player.row}-${player.column - 1}`);
    }
    if (player.direction === 'right') {
        return document.getElementById(`square-${player.row}-${player.column + 1}`);
    }
    return null;
}


function isTheNextSquareLowerOrEqualPlayerHigh(){
    updateCurrentPlayerHigh();
    const nextSquare = getNextSquare();
    if (player.high >= nextSquareHigh()){
        return true;
    }
    else if (nextSquare && nextSquare.classList.contains('ground-light')) { 
        return true; 
    }
    else {
        return false;
    }
}

function isTheNextSquareOnTheMap(){
    if (player.direction === 'up'){
        if (player.row - 1 < 0){
            return false;
        }
        else {
            return true;
        }
    }     
    else if (player.direction === 'down'){
        if (player.row + 1 > 4){
            return false;
        }
        else {
            return true;
        }
    } 
    else if (player.direction === 'left'){
        if (player.column - 1 < 0){
            return false;
        }
        else {
            return true;
        } 
    } 
    else if (player.direction === 'right'){
        if (player.column + 1 > 4){
            return false;
        }
        else {
            return true;
        } 
    } 
}

document.querySelector('#executeBtn').addEventListener('click', executeCommands);

let commandsToExecuteOnMain = [];
let commandsToAppearOnMain = [];
let commandsToExecuteOnP1 = [];
let commandsToAppearOnP1 = [];
let commandsToExecuteOnP2 = [];
let commandsToAppearOnP2 = [];
let counter = 0;
let counterP1 = 0;
let counterP2 = 0;
const displayMain = document.querySelector('#displayMain');
const displayP1 = document.querySelector('#displayP1');
const displayP2 = document.querySelector('#displayP2');

function transformCommands(command){
    switch (command){
        case 'forward':
            return '<i class="bi bi-arrow-up"></i>';
        case 'right':
            return '<i class="bi bi-arrow-clockwise"></i>';
        case 'left':
            return '<i class="bi bi-arrow-counterclockwise"></i>';       
        case 'light':
            return '<i class="bi bi-lightbulb-fill"></i>';
        case 'jump':
            return '<i class="bi bi-capslock-fill"></i>';    
        case 'p1':
            return '<span>P1<span>'; 
        case 'p2':
            return '<span>P2<span>';
        case 'main':
            return '<span>MAIN</span>';
        default:
            return '';        
    }
}

let p1Exists = false;
let p2Exists = false;
function getCommand(command){
    if (command == 'main'){
        p1Exists = false;
        p2Exists = false;
    }
    else if (command == 'p1' || p1Exists == true){
        addP1Commands(command);
        p1Exists = true;
    }
    else if (command == 'p2' || p2Exists == true){
        addP2Commands(command);
        p2Exists = true;
    }
    else {
        addMainCommands(command);
    }
}

function addMainCommands(command){
    if (command == 'undo' && counter == 0){
        return;
    } 
    else if (command == 'undo'){ 
        commandsToAppearOnMain.pop();
        commandsToExecuteOnMain.pop();
        displayMain.innerHTML = commandsToAppearOnMain.join(''); 
        counter--;
    } else if (command == 'reset'){
        commandsToAppearOnMain = [];
        commandsToExecuteOnMain = [];
        displayMain.innerHTML = commandsToAppearOnMain.join('');
        counter = 0;
    } 
    else { 
        commandsToAppearOnMain.push(transformCommands(command));
        commandsToExecuteOnMain.push(command);
        displayMain.innerHTML = commandsToAppearOnMain.join('');
        counter++; 
    }
}

function addP1Commands(command){
    if (command == 'p1' || command == 'p2'){
        addMainCommands(command);
        return;
    }
    if (command == 'undo' && counterP1 == 0){
        return;
    } 
    else if (command == 'undo'){ 
        commandsToAppearOnP1.pop();
        commandsToExecuteOnP1.pop();
        displayP1.innerHTML = commandsToAppearOnP1.join(''); 
        counterP1--;
    } else if (command == 'reset'){
        commandsToAppearOnP1 = [];
        commandsToExecuteOnP1 = [];
        displayP1.innerHTML = commandsToAppearOnP1.join('');
        counterP1 = 0;
    } 
    else { 
        commandsToAppearOnP1.push(transformCommands(command));
        commandsToExecuteOnP1.push(command);
        displayP1.innerHTML = commandsToAppearOnP1.join('');
        counterP1++; 
    }
}

function addP2Commands(command){
    if (command == 'p1' || command == 'p2'){
        addMainCommands(command);
        return;
    }
    else if (command == 'undo' && counterP2 == 0){
        return;
    } 
    else if (command == 'undo'){ 
        commandsToAppearOnP2.pop();
        commandsToExecuteOnP2.pop();
        displayP2.innerHTML = commandsToAppearOnP2.join(''); 
        counterP2--;
    } else if (command == 'reset'){
        commandsToAppearOnP2 = [];
        commandsToExecuteOnP2 = [];
        displayP2.innerHTML = commandsToAppearOnP2.join('');
        counterP2 = 0;
    } 
    else { 
        commandsToAppearOnP2.push(transformCommands(command));
        commandsToExecuteOnP2.push(command);
        displayP2.innerHTML = commandsToAppearOnP2.join('');
        counterP2++; 
    }
}

function resetPlayerPosition(){
    player.row = 0;
    player.column = 0;
    player.direction = 'down';
    player.angle = 0;
    robot.style.transform = 'scale(1) rotate(0deg)';
}

function resetCommands(){
    commandsToAppearOnMain = [];
    commandsToExecuteOnMain = [];
    commandsToAppearOnP1 = [];
    commandsToExecuteOnP1 = [];
    commandsToAppearOnP2 = [];
    commandsToExecuteOnP2 = [];
    displayMain.innerHTML = commandsToAppearOnMain.join('');
    displayP1.innerHTML = commandsToAppearOnP1.join('');
    displayP2.innerHTML = commandsToAppearOnP2.join('');
}

function restartLevel(){
    player.alive = true;
    gameRunning = false;
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    enableAllButtons();
    createBoard();
    resetPlayerPosition();
    renderPlayer();
    resetCommands();
    hideResultOverlay();
}

function nextLevel(){
    player.alive = true;
    gameRunning = false;
    timeouts.forEach(id => clearTimeout(id));
    level++;
    timeouts = [];
    enableAllButtons();
    createBoard();
    resetPlayerPosition();
    renderPlayer();
    resetCommands();
    hideResultOverlay();
}

function selectLevel(){
    player.alive = true;
    gameRunning = false;
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    showSelectLevelsTotalArea();
    enableAllButtons();
    createBoard();
    resetPlayerPosition();
    renderPlayer();
    resetCommands();
    hideResultOverlay();
}

function hideResultOverlay(){
    resultOverlay.classList.add('hidden');
    feedback.classList.add('hidden');
    tryAgainButton.classList.add('hidden');
    nextLevelButton.classList.add('hidden');
}

function allTilesHaveBeenLit(){
    let allLightsOn = true;
    const squares = document.querySelectorAll('.ground-light');
    squares.forEach(square => {
        if (square.style.backgroundColor != 'yellow'){
            allLightsOn = false;
        }
    });
    return allLightsOn;
}

function levelResult(){
    disableAllButtons();
    hideResultOverlay()
    if(allTilesHaveBeenLit() == true && player.alive == true){
        completedLevels[level - 1] = true;
        feedback.style.color = 'yellow';
        resultOverlay.classList.remove('hidden');
        feedback.classList.remove('hidden');
        feedback.textContent = 'LEVEL CLEAR';
        if (allLevelsAreCompleted() == true){ 
            feedback.textContent = 'GAME CLEAR';
        }
        if (level < maxLevel){
            nextLevelButton.classList.remove('hidden');
        }
    }    
    else {
        feedback.style.color = 'red';
        feedback.textContent = 'GAME OVER';
        resultOverlay.classList.remove('hidden');
        feedback.classList.remove('hidden');
        tryAgainButton.classList.remove('hidden');
    }
}

function disableAllButtons(){
    const buttons = document.querySelectorAll('.controls > button, .play-reset-selectLevel > button');
    buttons.forEach(button => {
        button.setAttribute('disabled', '');
    });
}

function enableAllButtons(){
    const buttons = document.querySelectorAll('.controls > button, .play-reset-selectLevel > button');
    buttons.forEach(button => {
        button.removeAttribute('disabled');
    });
}

function allLevelsAreCompleted(){
    let gameClear = true;
    completedLevels.forEach(level => {
        if (level == false){
            gameClear = false;
        }
    });
    return gameClear;
}

const selectLevelsTotalArea = document.createElement('div');
selectLevelsTotalArea.setAttribute('id', 'selectLevelsTotalArea');
body.appendChild(selectLevelsTotalArea);
const selectLevelsSection = document.createElement('div');
selectLevelsSection.setAttribute('id', 'selectLevelsSection');
selectLevelsTotalArea.appendChild(selectLevelsSection);
const selectLevelsHeader = document.createElement('header');
selectLevelsTotalArea.appendChild(selectLevelsHeader);
const selectLevelsTitle = document.createElement('h1');
selectLevelsHeader.appendChild(selectLevelsTitle);
selectLevelsTitle.innerHTML = 'Welcome to the GAME: <span>LightBot</span>';
const selectLevelsCommand = document.createElement('h2');
selectLevelsHeader.appendChild(selectLevelsCommand);
selectLevelsCommand.innerHTML = 'Select the <span>LEVEL</span>';

const levels = [1, 2, 3, 4, 5, 6];
const selectLevelButton = [];

function createSelectLevelsSection(){
    levels.forEach(level => {
        selectLevelButton[level - 1] = document.createElement('button');
        selectLevelButton[level - 1].setAttribute('id', `squareLevel${level}`);
        selectLevelButton[level - 1].textContent = level;
        selectLevelsSection.appendChild(selectLevelButton[level - 1]);
        selectLevelButton[level - 1].classList.add('squareLevel');
    });
}
createSelectLevelsSection();

function hideSelectLevelsTotalArea(){
    selectLevelsTotalArea.classList.add('hidden');
}

function showSelectLevelsTotalArea(){
    selectLevelsTotalArea.classList.remove('hidden');
}

selectLevelButton[0].addEventListener('click', function(){
    level = 1;
    createBoard();
    hideSelectLevelsTotalArea();
});
selectLevelButton[1].addEventListener('click', function(){
    level = 2;
    createBoard();
    hideSelectLevelsTotalArea();
});
selectLevelButton[2].addEventListener('click', function(){
    level = 3;
    createBoard();
    hideSelectLevelsTotalArea();
});
selectLevelButton[3].addEventListener('click', function(){
    level = 4;
    createBoard();
    hideSelectLevelsTotalArea();
});
selectLevelButton[4].addEventListener('click', function(){
    level = 5;
    createBoard();
    hideSelectLevelsTotalArea();
});
selectLevelButton[5].addEventListener('click', function(){
    level = 6;
    createBoard();
    hideSelectLevelsTotalArea();
});