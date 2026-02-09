const body = document.querySelector('body');
const gameBoard = document.querySelector('#gameBoard');

const robot = document.createElement('i');
robot.classList.add('bi', 'bi-android2');
robot.classList.add('robot-style');

const resultOverlay = document.querySelector('#resultOverlay');
const feedback = document.querySelector('#feedback');
const tryAgainButton = document.querySelector('#tryAgain');
const nextLevelButton = document.querySelector('#nextLevel');
const selectLevelAfterResultButton = document.querySelector('#selectLevel');
const turnRightButton = document.querySelector('#turnRightBtn');
const turnLeftButton = document.querySelector('#turnLeftBtn');
const jumpButton = document.querySelector('#jumpBtn');

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
        'aeeee',
        'aeeee',
        'deeee',
        'aeeee',
        'deeee',
    ],
    //level 2
    [
        'daeee',
        'eaaae',
        'eeeae',
        'eeeae',
        'eeede',
    ],
    //level 3
    [
        'aaaaa',    
        'eeeeb',
        'dddeb',
        'deeeb',
        'ccccb',
    ],
    //level 4
    [
        'aaeee',    
        'ebbbe',
        'eeece',
        'debbe',
        'cbaee',
    ],
    //level 5
    [
        'eabcd',    
        'ebeee',
        'ecabd',
        'eaeee',
        'ebcad',
    ],
    //level 6
    [
        'aeaaa',    
        'aeaed',
        'aeaee',
        'aeaee',
        'aaaee',
    ],
];

function createBoard(){
    const currentMap = maps[level - 1];
    gameBoard.innerHTML = "";

    for (let i = 0; i < currentMap.length; i++){
        for (let j = 0; j < currentMap[i].length; j++){
            const square = document.createElement('div');
            square.setAttribute('id', `square-${i}-${j}`);
            square.classList.add('square');
            const char = currentMap[i][j];
            addMapElement(square, char, i, j);
            gameBoard.appendChild(square);
            squaresArray.push(square);
        }
    }
    changeLevel6Design();
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
    if (level == 5 && gameRunning == false){
        player.column = 1;
    }
    else if (gameRunning == false){
        player.column = 0;
    }
    const square = document.getElementById(`square-${player.row}-${player.column}`);
    square.appendChild(robot);
}

function movePlayer() { 
    if (isTheNextSquareOnTheMap() == false) return;
    const oldSquare = document.getElementById(`square-${player.row}-${player.column}`); 
    if (oldSquare.contains(robot)) {
        oldSquare.removeChild(robot);
    }
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
    robot.style.transform = `scale(1) rotate(${player.angle}deg)`;
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
    robot.style.transform = `scale(1) rotate(${player.angle}deg)`;
}

let delay;
function executeCommands() {
    disableAllButtons();
    if (gameRunning || player.alive == false){
        return;
    }
    playerDied = false; 
    gameRunning = true; 
    delay = 0;

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
    levelResultWithNoDeath();
}

let levelResultWithNoDeathIdTimeout;
function levelResultWithNoDeath(){
    levelResultWithNoDeathIdTimeout = setTimeout(() => {
        gameRunning = false;
        levelResult();
    }, delay + 650);
}

function handleDeath() {
    player.alive = false;
    gameRunning = false;
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    clearTimeout(levelResultWithNoDeathIdTimeout);
    setTimeout(() => {
        robot.style.transition = 'transform 1.5s ease';
        robot.style.transform = 'scale(0) rotate(540deg)';
    }, 650);
    setTimeout(() => {
        levelResult();
    }, 1950);
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
        if (player.high < nextSquareHigh()){ 
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
            currentSquare.style.backgroundColor = 'white'; 
        }   
        else { 
            currentSquare.style.background = '';
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
    if (currentSquare.classList.contains('ground-low') || currentSquare.classList.contains('ground-light')){
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
        if (document.getElementById(`square-${player.row - 1}-${player.column}`).classList.contains('ground-light') || document.getElementById(`square-${player.row - 1}-${player.column}`).classList.contains('ground-low') || document.getElementById(`square-${player.row - 1}-${player.column}`).classList.contains('ground-empty')){
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
        if (document.getElementById(`square-${player.row + 1}-${player.column}`).classList.contains('ground-light') || document.getElementById(`square-${player.row + 1}-${player.column}`).classList.contains('ground-low') || document.getElementById(`square-${player.row + 1}-${player.column}`).classList.contains('ground-empty')){
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
        if (document.getElementById(`square-${player.row}-${player.column - 1}`).classList.contains('ground-light') || document.getElementById(`square-${player.row}-${player.column - 1}`).classList.contains('ground-low') || document.getElementById(`square-${player.row}-${player.column - 1}`).classList.contains('ground-empty')){
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
        if (document.getElementById(`square-${player.row}-${player.column + 1}`).classList.contains('ground-light') || document.getElementById(`square-${player.row}-${player.column + 1}`).classList.contains('ground-low') || document.getElementById(`square-${player.row}-${player.column + 1}`).classList.contains('ground-empty')){
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
            return '<i class="bi bi-lightbulb"></i>';
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
    getCommand('main');
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
    selectLevelAfterResultButton.classList.add('hidden');
    enableAllButtons();
    createBoard();
    resetPlayerPosition();
    renderPlayer();
    resetCommands();
    hideResultOverlay();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
}

function nextLevel(){
    player.alive = true;
    gameRunning = false;
    timeouts.forEach(id => clearTimeout(id));
    level++;
    timeouts = [];
    selectLevelAfterResultButton.classList.add('hidden');
    enableAllButtons();
    createBoard();
    resetPlayerPosition();
    renderPlayer();
    resetCommands();
    hideResultOverlay();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
}

function selectLevel(){
    player.alive = true;
    gameRunning = false;
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    selectLevelAfterResultButton.classList.add('hidden');
    showSelectLevelsTotalArea();
    enableAllButtons();
    createBoard();
    resetPlayerPosition();
    renderPlayer();
    resetCommands();
    hideResultOverlay();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
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
    hideResultOverlay();
    selectLevelAfterResultButton.classList.remove('hidden');
    if(allTilesHaveBeenLit() == true && player.alive == true){
        completedLevels[level - 1] = true;
        if (level != 6){
            lockIcons[level - 1].classList.remove('bi-lock');
            selectLevelButton[level].classList.remove('notAvailable');
            selectLevelButton[level].removeAttribute('disabled');
        }
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
const instructionsButton = document.createElement('button');
selectLevelsHeader.appendChild(instructionsButton);
instructionsButton.innerHTML = 'Instructions'
instructionsButton.addEventListener('click', showGameInstructionsTotalArea);
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
        selectLevelButton[level - 1].innerHTML = level;
        selectLevelsSection.appendChild(selectLevelButton[level - 1]);
        selectLevelButton[level - 1].classList.add('squareLevel');
        if (level != 1){
            selectLevelButton[level - 1].classList.add('notAvailable');
            selectLevelButton[level - 1].innerHTML += '<i class="bi bi-lock"></i>';
        }
    });
}
createSelectLevelsSection();
const lockIcons = document.querySelectorAll('.bi-lock');
const hyphenOnFooter = document.querySelector('footer span');

function hideSelectLevelsTotalArea(){
    selectLevelsTotalArea.classList.add('hidden');
    hyphenOnFooter.classList.add('hidden');
}

function showSelectLevelsTotalArea(){
    selectLevelsTotalArea.classList.remove('hidden');
    if (level == 6){
        hyphenOnFooter.classList.remove('hidden');
    }
}

selectLevelButton[0].addEventListener('click', function(){
    level = 1;
    createBoard();
    hideSelectLevelsTotalArea();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
});
selectLevelButton[1].addEventListener('click', function(){
    level = 2;
    createBoard();
    hideSelectLevelsTotalArea();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
});
selectLevelButton[2].addEventListener('click', function(){
    level = 3;
    createBoard();
    hideSelectLevelsTotalArea();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
});
selectLevelButton[3].addEventListener('click', function(){
    level = 4;
    createBoard();
    hideSelectLevelsTotalArea();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
});
selectLevelButton[4].addEventListener('click', function(){
    level = 5;
    createBoard();
    hideSelectLevelsTotalArea();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
});
selectLevelButton[5].addEventListener('click', function(){
    level = 6;
    createBoard();
    hideSelectLevelsTotalArea();
    showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
});

function showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel(){
    turnRightButton.classList.remove('hidden');
    turnLeftButton.classList.remove('hidden');
    jumpButton.classList.remove('hidden');
    if (level == 1){
        turnRightButton.classList.add('hidden');
        turnLeftButton.classList.add('hidden');
        jumpButton.classList.add('hidden');
    }
    else if (level == 2){
        jumpButton.classList.add('hidden');
    }
}

function changeLevel6Design(){
    const letterL = document.querySelector('header h1 span:nth-of-type(2) span');
    const letterI = document.querySelector('.display span');
    if (level == 6){
        const blackHole = document.querySelectorAll('.ground-empty');
        blackHole.forEach(blackHole => {
            blackHole.style.background = 'linear-gradient(to top, green, mediumseagreen)';
        })
        letterL.style.color = 'rgb(0, 255, 0)';
        letterI.style.color = 'rgb(0, 255, 0)';
    }
    else {
        letterL.style.color = '';
        letterI.style.color = '';
    }
}

const gameInstructionsTotalArea = document.createElement('div');
gameInstructionsTotalArea.setAttribute('id', 'gameInstructionsTotalArea');
body.appendChild(gameInstructionsTotalArea);
const gameInstructionsHeader = document.createElement('header');
gameInstructionsTotalArea.appendChild(gameInstructionsHeader);
const returnFromGameInstructionsAreaButton = document.createElement('button');
gameInstructionsHeader.appendChild(returnFromGameInstructionsAreaButton);
const gameInstructionsTitle = document.createElement('h1');
gameInstructionsHeader.appendChild(gameInstructionsTitle);
const gameInstructionsSection = document.createElement('div');
gameInstructionsSection.setAttribute('id', 'gameInstructionsSection'); 
gameInstructionsTotalArea.appendChild(gameInstructionsSection);
const firstGameInstruction = document.createElement('p');
gameInstructionsSection.appendChild(firstGameInstruction);
const secondGameInstruction = document.createElement('p');
gameInstructionsSection.appendChild(secondGameInstruction);
const thirdGameInstruction = document.createElement('p');
gameInstructionsSection.appendChild(thirdGameInstruction);

returnFromGameInstructionsAreaButton.innerHTML = '<i class="bi bi-arrow-90deg-left"></i>'
returnFromGameInstructionsAreaButton.addEventListener('click', () => {
    selectLevel();
    hideGameInstructionsTotalArea();
});

function showGameInstructionsTotalArea(){
    selectLevelsTotalArea.classList.add('hidden');
    gameInstructionsTotalArea.classList.remove('hidden');
}

function hideGameInstructionsTotalArea(){
    gameInstructionsTotalArea.classList.add('hidden');
}

gameInstructionsTitle.innerHTML = 'Game Instructions';

const groundLightSquareWhite = document.createElement('div');
groundLightSquareWhite.classList.add('instructionsSquare');
groundLightSquareWhite.appendChild(robot.cloneNode(true));
firstGameInstruction.appendChild(groundLightSquareWhite);
firstGameInstruction.innerHTML += '<i class="bi bi-lightbulb"></i>' + '<i class="bi bi-arrow-right"></i>';
const groundLightSquareYellow = document.createElement('div')
groundLightSquareYellow.classList.add('instructionsSquare');
groundLightSquareYellow.style.backgroundColor = 'yellow';
groundLightSquareYellow.appendChild(robot.cloneNode(true));
firstGameInstruction.appendChild(groundLightSquareYellow);

const groundLow = document.createElement('div')
const groundMedium = document.createElement('div')
const groundHigh = document.createElement('div')
groundLow.classList.add('instructionsSquare');
groundMedium.classList.add('instructionsSquare');
groundHigh.classList.add('instructionsSquare');
secondGameInstruction.appendChild(groundLow);
groundLow.appendChild(robot.cloneNode(true));
secondGameInstruction.innerHTML += '<i class="bi bi-capslock-fill"></i>' + '<i class="bi bi-arrow-right"></i>';
secondGameInstruction.appendChild(groundMedium);
groundMedium.appendChild(robot.cloneNode(true));
secondGameInstruction.innerHTML += '<i class="bi bi-capslock-fill"></i>' + '<i class="bi bi-arrow-right"></i>';
secondGameInstruction.appendChild(groundHigh);
groundHigh.appendChild(robot.cloneNode(true));

thirdGameInstruction.appendChild(groundHigh.cloneNode(true));
thirdGameInstruction.innerHTML += '<i class="bi bi-capslock-fill"></i>' + '<i class="bi bi-x-lg"></i>';
thirdGameInstruction.appendChild(groundHigh.cloneNode(true));


