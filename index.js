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
let jumpAnimationTimeouts = [];
let soundEffectsTimeouts = [];
let commandTimeouts = [];
let gameRunning = false;
let level = 1; 
let completedLevels = [];
const maxLevel = 6;
for (let x = 0; x < maxLevel; x++){
    completedLevels.push(false);
}

const maps = [
    [
        'aeeee',
        'aeeee',
        'deeee',
        'aeeee',
        'deeee',
    ],
    [
        'daeee',
        'eaaae',
        'eeeae',
        'eeeae',
        'eeede',
    ],
    [
        'aaaaa',    
        'eeeeb',
        'dddeb',
        'deeeb',
        'ccccb',
    ],
    [
        'aaeee',    
        'ebbbe',
        'eeece',
        'debbe',
        'cbaee',
    ],
    [
        'eabcd',    
        'ebeee',
        'ecabd',
        'eaeee',
        'ebcad',
    ],
    [
        'ceccc',    
        'ceced',
        'cecee',
        'cecee',
        'cccee',
    ],
];

function changeLevel6Design(){
    const letterL = document.querySelector('header h1 span:nth-of-type(2) span');
    const letterI = document.querySelector('.display span');
    if (level === 6){
        const blackHole = document.querySelectorAll('.ground-empty');
        blackHole.forEach(blackHole => {
            blackHole.style.background = 'linear-gradient(to top, limegreen, lime)';
        })
        letterL.style.color = 'rgb(0, 255, 0)';
        letterI.style.color = 'rgb(0, 255, 0)';
    }
    else {
        letterL.style.color = '';
        letterI.style.color = '';
    }
}

function createBoard(){
    const currentMap = maps[level - 1];
    gameBoard.innerHTML = "";
    for (let i = 0; i < currentMap.length; i++){
        for (let j = 0; j < currentMap[i].length; j++){
            const square = document.createElement('div');
            square.setAttribute('id', `square-${i}-${j}`);
            square.classList.add('square');
            const char = currentMap[i][j];
            addMapElement(square, char);
            gameBoard.appendChild(square);
            squaresArray.push(square);
        }
    }
    changeLevel6Design();
    renderPlayer();
}

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

    function renderPlayer(){ 
        if (level === 5 && gameRunning === false){
            player.column = 1;
        }
    else if (gameRunning === false){
        player.column = 0;
    }
    const square = document.getElementById(`square-${player.row}-${player.column}`);
    square.appendChild(robot);
    robot.style.transition = 'none';
    robot.style.transform = `scale(1) rotate(${player.angle}deg) translate(0, 0)`;
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

let p1Exists = false;
let p2Exists = false;
function getCommand(command){
    if (command === 'main'){
        p1Exists = false;
        p2Exists = false;
    }
    else if (command === 'p1'){
        p2Exists = false;
    }
    else if (command === 'p2'){
        p1Exists = false;
    }
    if (command === 'p1' || p1Exists === true){
        addP1Commands(command);
        p1Exists = true;
    }
    else if (command === 'p2' || p2Exists === true){
        addP2Commands(command);
        p2Exists = true;
    }
    else {
        addMainCommands(command);
    }
}

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
            return '<span>P1</span>'; 
        case 'p2':
            return '<span>P2</span>';
        case 'main':
            return '<span>MAIN</span>';
        default:
            return '';        
    }
}

function addMainCommands(command){
    if (command === 'main'){
        return;
    }
    else if (command === 'undo' && counter === 0){
        return;
    } 
    else if (command === 'undo'){ 
        commandsToAppearOnMain.pop();
        commandsToExecuteOnMain.pop();
        displayMain.innerHTML = commandsToAppearOnMain.join(''); 
        counter--;
    } else if (command === 'reset'){
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
    if (command === 'p1' || command === 'p2'){
        addMainCommands(command);
        return;
    }
    else if (command === 'undo' && counterP1 === 0){
        return;
    } 
    else if (command === 'undo'){ 
        commandsToAppearOnP1.pop();
        commandsToExecuteOnP1.pop();
        displayP1.innerHTML = commandsToAppearOnP1.join(''); 
        counterP1--;
    } else if (command === 'reset'){
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
    if (command === 'p1' || command === 'p2'){
        addMainCommands(command);
        return;
    }
    else if (command === 'undo' && counterP2 === 0){
        return;
    } 
    else if (command === 'undo'){ 
        commandsToAppearOnP2.pop();
        commandsToExecuteOnP2.pop();
        displayP2.innerHTML = commandsToAppearOnP2.join(''); 
        counterP2--;
    } else if (command === 'reset'){
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

function movePlayer() { 
    if (isTheNextSquareOnTheMap() === false){
        return;
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
}

function turnLeft() {
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
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = `scale(1) rotate(${player.angle}deg) translate(0, 0)`;
}

function turnRight() {
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
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = `scale(1) rotate(${player.angle}deg) translate(0, 0)`;
}

function prepareForJumpAnimation(){
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = `scale(1) rotate(${player.angle}deg) translate(0, 4px)`;
}

function jumpAnimation(){
    soundEffects.jump.play();
    robot.style.transition = 'transform 0.3s ease';
    robot.style.transform = `scale(1) rotate(${player.angle}deg) translate(0, -7px)`;
}

function fallingAfterJumping(){
    robot.style.transition = 'transform 0.3s ease';
    robot.style.transform = `scale(1) rotate(${player.angle}deg) translate(0, 0)`;
}

function handleDeath(){
    player.alive = false;
    gameRunning = false;
    clearAllTimeouts();
    setTimeout(() => {
        soundEffects.fallingIntoBlackHole.play();
        robot.style.transition = 'transform 1.5s ease';
        robot.style.transform = 'scale(0) rotate(540deg) translate(0, 0)';
    }, 650);
    setTimeout(() => levelResult(), 1950);
}

function runSoundEffect(cmd){
    if (cmd === 'forward'){
        soundEffects.forward.play();
    }
    else if (cmd === 'light'){
        soundEffects.lightSwitch.play();
    }
    else if (cmd === 'right'){
        soundEffects.turnRight.play();
    }
    else if (cmd === 'left'){
        soundEffects.turnLeft.play();
    }
}

function runCommand(cmd){ 
    if (cmd === 'forward' && isTheNextSquareOnTheMap() === true && isTheNextSquareLowerOrEqualPlayerHigh() === true){ 
        movePlayer(); 
        if (isTheSquareSafe() === false){
            handleDeath(); 
        } 
    } 
    else if (cmd === 'jump' && isTheNextSquareOnTheMap() && isTheNextSquareLowerOrEqualPlayerHigh() === false){ 
        movePlayer(); 
        if (isTheSquareSafe() === false){
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
        if (currentSquare.style.backgroundColor === 'yellow' && currentSquare.classList.contains('ground-low')){ 
            currentSquare.style.background = 'linear-gradient(to top, green, mediumseagreen)'; 
        }
        else if (currentSquare.style.backgroundColor === 'yellow' && currentSquare.classList.contains('ground-medium')){ 
            currentSquare.style.background = 'linear-gradient(to top, mediumseagreen, mediumspringgreen)'; 
        }
        else if (currentSquare.style.backgroundColor === 'yellow' && currentSquare.classList.contains('ground-high')){ 
            currentSquare.style.background = 'linear-gradient(to top, limegreen, lime)'; 
        }
        else if (currentSquare.style.backgroundColor === 'yellow' && currentSquare.classList.contains('ground-light')){ 
            currentSquare.style.backgroundColor = 'white'; 
        }   
        else { 
            currentSquare.style.background = '';
            currentSquare.style.backgroundColor = 'yellow'; 
        } 
    }
    else {
        fallingAfterJumping();
    }
}

let delay;
function executeCommands(){
    disableAllButtons();
    if (gameRunning === true || player.alive === false){
        return;
    }
    gameRunning = true; 
    delay = 1200;
    for (let cmd = 0; cmd < commandsToExecuteOnMain.length; cmd++){
        if (commandsToExecuteOnMain[0] !== 'jump' && cmd === 0){
            delay = 0;
        }
        if (commandsToExecuteOnMain[cmd] === 'p1'){ 
            for (let subCmd1 = 0; subCmd1 < commandsToExecuteOnP1.length; subCmd1++){ 
                if (commandsToExecuteOnP1[subCmd1] === 'jump'){
                    const jumpAnimationTimeoutId = setTimeout(() => jumpAnimation(), delay - 600);
                    const prepareForJumpAnimationTimeoutId = setTimeout(() => prepareForJumpAnimation(), delay - 1200);
                    jumpAnimationTimeouts.push(jumpAnimationTimeoutId);
                    jumpAnimationTimeouts.push(prepareForJumpAnimationTimeoutId);
                }
                const soundEffectTimeoutId = setTimeout(() => runSoundEffect(commandsToExecuteOnP1[subCmd1]), delay);
                const commandTimeoutId = setTimeout(() => runCommand(commandsToExecuteOnP1[subCmd1]), delay); 
                soundEffectsTimeouts.push(soundEffectTimeoutId);
                commandTimeouts.push(commandTimeoutId);
                if (commandsToExecuteOnP1[subCmd1 + 1] === 'jump'){
                    delay += 1800;
                }
                else if (commandsToExecuteOnP1[subCmd1] === 'right' || commandsToExecuteOnP1[subCmd1] === 'left') {
                    delay += 1200;
                }
                else {
                    delay += 600;
                }
            } 
        } 
        else if (commandsToExecuteOnMain[cmd] === 'p2'){ 
            for (let subCmd2 = 0; subCmd2 < commandsToExecuteOnP2.length; subCmd2++){ 
                if (commandsToExecuteOnP2[subCmd2] === 'jump'){
                    const jumpAnimationTimeoutId = setTimeout(() => jumpAnimation(), delay - 600);
                    const prepareForJumpAnimationTimeoutId = setTimeout(() => prepareForJumpAnimation(), delay - 1200);
                    jumpAnimationTimeouts.push(jumpAnimationTimeoutId);
                    jumpAnimationTimeouts.push(prepareForJumpAnimationTimeoutId);
                }    
                const soundEffectTimeoutId = setTimeout(() => runSoundEffect(commandsToExecuteOnP2[subCmd2]), delay);
                const commandTimeoutId = setTimeout(() => runCommand(commandsToExecuteOnP2[subCmd2]), delay);
                soundEffectsTimeouts.push(soundEffectTimeoutId);
                commandTimeouts.push(commandTimeoutId);  
                if (commandsToExecuteOnP2[subCmd2 + 1] === 'jump'){
                    delay += 1800;
                }
                else if (commandsToExecuteOnP2[subCmd2] === 'right' || commandsToExecuteOnP2[subCmd2] === 'left') {
                    delay += 1500;
                }
                else {
                    delay += 600;
                }
            } 
        } 
        else { 
            if (commandsToExecuteOnMain[cmd] === 'jump'){
                const jumpAnimationTimeoutId = setTimeout(() => jumpAnimation(), delay - 600);
                const prepareForJumpAnimationTimeoutId = setTimeout(() => prepareForJumpAnimation(), delay - 1200);
                jumpAnimationTimeouts.push(jumpAnimationTimeoutId);
                jumpAnimationTimeouts.push(prepareForJumpAnimationTimeoutId);
            }    
            const soundEffectTimeoutId = setTimeout(() => runSoundEffect(commandsToExecuteOnMain[cmd]), delay);
            const commandTimeoutId = setTimeout(() => runCommand(commandsToExecuteOnMain[cmd]), delay);
            soundEffectsTimeouts.push(soundEffectTimeoutId);
            commandTimeouts.push(commandTimeoutId); 
            if (commandsToExecuteOnMain[cmd + 1] === 'jump'){
                delay += 1800;
            }
            else if (commandsToExecuteOnMain[cmd] === 'right' || commandsToExecuteOnMain[cmd] === 'left') {
                delay += 1200;
            }
            else {
                delay += 600;
            }
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

function clearAllTimeouts(){
    soundEffectsTimeouts.forEach(soundEffectsTimeouts => clearTimeout(soundEffectsTimeouts));
    soundEffectsTimeouts = [];
    commandTimeouts.forEach(commandTimeoutId => clearTimeout(commandTimeoutId));
    commandTimeouts = [];
    jumpAnimationTimeouts.forEach(jumpAnimationTimeouts => clearTimeout(jumpAnimationTimeouts));
    jumpAnimationTimeouts = [];
    clearTimeout(levelResultWithNoDeathIdTimeout);
}

function resetAllTimeoutsArrays(){
    soundEffectsTimeouts = [];
    commandTimeouts = [];
    jumpAnimationTimeouts = [];
}

function getNextSquare(){
    if (player.direction === 'up') {
        return document.getElementById(`square-${player.row - 1}-${player.column}`);
    }
    else if (player.direction === 'down') {
        return document.getElementById(`square-${player.row + 1}-${player.column}`);
    }
    else if (player.direction === 'left') {
        return document.getElementById(`square-${player.row}-${player.column - 1}`);
    }
    else if (player.direction === 'right') {
        return document.getElementById(`square-${player.row}-${player.column + 1}`);
    }
}

function nextSquareHigh(){
    if (getNextSquare().classList.contains('ground-light') || getNextSquare().classList.contains('ground-low') || getNextSquare().classList.contains('ground-empty')){
        return 0;
    }
    else if (getNextSquare().classList.contains('ground-medium')){
        return 1;
    }
    else if (getNextSquare().classList.contains('ground-high')){
        return 2;
    } 
}

function isTheNextSquareLowerOrEqualPlayerHigh(){
    updateCurrentPlayerHigh();
    if (player.high >= nextSquareHigh()){
        return true;
    }
    else {
        return false;
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

function isTheSquareSafe(){
    const currentSquare = document.getElementById(`square-${player.row}-${player.column}`);
    if (currentSquare.classList.contains('ground-empty')){
        return false;
    }
    else {
        return true;
    }
}

function resetPlayerPosition(){
    player.row = 0;
    player.column = 0;
    player.direction = 'down';
    player.angle = 0;
    robot.style.transform = 'scale(1) rotate(0deg) translate(0, 0)';
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
    selectLevelAfterResultButton.classList.add('hidden');
    resetAllTimeoutsArrays();
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
    level++;
    selectLevelAfterResultButton.classList.add('hidden');
    resetAllTimeoutsArrays();
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
    selectLevelAfterResultButton.classList.add('hidden');
    resetAllTimeoutsArrays();
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
        if (square.style.backgroundColor !== 'yellow'){
            allLightsOn = false;
        }
    });
    return allLightsOn;
}

function allLevelsAreCompleted(){
    let gameClear = true;
    completedLevels.forEach(level => {
        if (level === false){
            gameClear = false;
        }
    });
    return gameClear;
}

function levelResult(){
    hideResultOverlay();
    selectLevelAfterResultButton.classList.remove('hidden');
    if(allTilesHaveBeenLit() === true && player.alive === true){
        soundEffects.levelClear.play();
        completedLevels[level - 1] = true;
        if (level !== 6){
            lockIcons[level - 1].classList.remove('bi-lock');
            selectLevelButton[level].classList.remove('notAvailable');
            selectLevelButton[level].removeAttribute('disabled');
        }
        feedback.style.color = 'yellow';
        resultOverlay.classList.remove('hidden');
        feedback.classList.remove('hidden');
        if (translateTheGameButton.innerHTML === 'English 🇺🇸'){
            feedback.textContent = 'FASE CONCLUÍDA';
        }
        else {
            feedback.textContent = 'LEVEL CLEAR';
        }
        if (allLevelsAreCompleted() === true){ 
            soundEffects.gameClear.play();
            if (translateTheGameButton.innerHTML === 'English 🇺🇸'){
                feedback.textContent = 'Você ZEROU o Jogo!';
            }
            else {
                feedback.textContent = 'GAME CLEAR';
            }
        }
        if (level < maxLevel){
            nextLevelButton.classList.remove('hidden');
        }
    }    
    else {
        soundEffects.gameOver.play();
        feedback.style.color = 'red';
        if (translateTheGameButton.innerHTML === 'English 🇺🇸'){
            feedback.textContent = 'Você Perdeu!';
        }
        else {
            feedback.textContent = 'GAME OVER';
        }
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
selectLevelsTitle.innerHTML = 'Welcome to the GAME: <span>LoopBot</span>';
const selectLevelsCommand = document.createElement('h2');
selectLevelsHeader.appendChild(selectLevelsCommand);
selectLevelsCommand.innerHTML = 'Select the <span>LEVEL</span>';
const translateTheGameButton = document.createElement('button');
selectLevelsHeader.appendChild(translateTheGameButton);
translateTheGameButton.innerHTML = 'Português 🇧🇷';
translateTheGameButton.addEventListener('click', translateTheGame);

const musicOnOffButton = document.querySelector('#playMusicButton');
function translateTheGame(){
    const mainTitle = document.querySelector('.mainHeader h1');
    const mainButton = document.querySelector('#mainBtn');
    const mainDisplayTitle = document.querySelector('.display p:nth-of-type(1)');
    const selectLevelsAreaButton = document.querySelector('#selectLevelBtn');
    const allRightsReserved = document.querySelector('footer span:nth-of-type(1)');
    if (translateTheGameButton.innerHTML === 'Português 🇧🇷'){
        translateTheGameButton.innerHTML = 'English 🇺🇸';
        mainTitle.innerHTML = '<span>Bem-vindo ao JOGO:</span><span><span>L</span>oopBot</span>';
        mainButton.innerHTML = '<span>Principal</span>';
        mainDisplayTitle.innerHTML = 'PR<span>I</span>NCIPAL';
        selectLevelsAreaButton.innerHTML = 'Fases';
        allRightsReserved.innerHTML = '&copy; Todos os direitos reservados ';
        tryAgainButton.innerHTML = 'Tentar Novamente';
        nextLevelButton.innerHTML = 'Próxima fase';
        selectLevelAfterResultButton.innerHTML = 'Fases';
        selectLevelsTitle.innerHTML = 'Bem-vindo ao JOGO: <span>LoopBot</span>';
        selectLevelsCommand.innerHTML = 'Selecione a <span>FASE</span>';
        instructionsButton.innerHTML = 'Instruções';
        gameInstructionsTitle.innerHTML = 'Instruções do Jogo';
        if (gameMusicIsPlaying === false){
            musicOnOffButton.innerHTML = '<span>Música:</span><span>NÃO</span>';
        } else {
            musicOnOffButton.innerHTML = '<span>Música:</span><span>SIM</span>';
        }    
    }
    else if (translateTheGameButton.innerHTML === 'English 🇺🇸'){
        translateTheGameButton.innerHTML = 'Português 🇧🇷';
        mainTitle.innerHTML = '<span>Welcome to the GAME:</span><span><span>L</span>oop</span>';
        mainButton.innerHTML = '<span>MAIN</span>';
        mainDisplayTitle.innerHTML = 'MA<span>I</span>N';
        selectLevelsAreaButton.innerHTML = 'Levels';
        allRightsReserved.innerHTML = '&copy; All rights reserved ';
        tryAgainButton.innerHTML = 'Try Again';
        nextLevelButton.innerHTML = 'Next Level';
        selectLevelAfterResultButton.innerHTML = 'Levels';
        selectLevelsTitle.innerHTML = 'Welcome to the GAME: <span>LoopBot</span>';
        selectLevelsCommand.innerHTML = 'Select the <span>LEVEL</span>';
        instructionsButton.innerHTML = 'Instructions';
        gameInstructionsTitle.innerHTML = 'Game Instructions';
        if (gameMusicIsPlaying === true){
            musicOnOffButton.innerHTML = '<span>Music:</span><span>ON</span>';
        }
        else {
            musicOnOffButton.innerHTML = '<span>Music:</span><span>OFF</span>';
        }
    }    
}

const levels = [1, 2, 3, 4, 5, 6];
const selectLevelButton = [];

function createSelectLevelsSection(){
    levels.forEach(level => {
        selectLevelButton[level - 1] = document.createElement('button');
        selectLevelButton[level - 1].setAttribute('id', `squareLevel${level}`);
        selectLevelButton[level - 1].innerHTML = level;
        selectLevelsSection.appendChild(selectLevelButton[level - 1]);
        selectLevelButton[level - 1].classList.add('squareLevel');
        if (level !== 1){
            selectLevelButton[level - 1].classList.add('notAvailable');
           
            selectLevelButton[level - 1].innerHTML += '<i class="bi bi-lock"></i>';
        }
    });
}
createSelectLevelsSection();

const lockIcons = document.querySelectorAll('.bi-lock');
const hyphenOnFooter = document.querySelector('footer span:nth-of-type(2)');

function hideSelectLevelsTotalArea(){
    selectLevelsTotalArea.classList.add('hidden');
    hyphenOnFooter.innerHTML = '|';
    hyphenOnFooter.classList.remove('green');
}

function showSelectLevelsTotalArea(){
    selectLevelsTotalArea.classList.remove('hidden');
    if (level === 6){
        hyphenOnFooter.innerHTML = '-';
        hyphenOnFooter.classList.add('green');
    }
}

function showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel(){
    turnRightButton.classList.remove('hidden');
    turnLeftButton.classList.remove('hidden');
    jumpButton.classList.remove('hidden');
    if (level === 1){
        turnRightButton.classList.add('hidden');
        turnLeftButton.classList.add('hidden');
        jumpButton.classList.add('hidden');
    }
    else if (level === 2){
        jumpButton.classList.add('hidden');
    }
}

selectLevelButton.forEach((selectLevelButton, index) => {
    selectLevelButton.addEventListener('click', () => {
        level = index + 1;
        playGameMusicForTheFirstTime();
        createBoard();
        hideSelectLevelsTotalArea();
        showAndHideTheButtonsThatAreAvailableOnTheCurrentLevel();
    });
})

const gameInstructionsTotalArea = document.createElement('div');
gameInstructionsTotalArea.setAttribute('id', 'gameInstructionsTotalArea');
body.appendChild(gameInstructionsTotalArea);
const gameInstructionsHeader = document.createElement('header');
gameInstructionsTotalArea.appendChild(gameInstructionsHeader);
const returnFromGameInstructionsAreaButton = document.createElement('button');
gameInstructionsHeader.appendChild(returnFromGameInstructionsAreaButton);
const gameInstructionsTitle = document.createElement('h1');
gameInstructionsHeader.appendChild(gameInstructionsTitle);
gameInstructionsTitle.innerHTML = 'Game Instructions';
const gameInstructionsSection = document.createElement('div');
gameInstructionsSection.setAttribute('id', 'gameInstructionsSection'); 
gameInstructionsTotalArea.appendChild(gameInstructionsSection);
const firstGameInstruction = document.createElement('p');
gameInstructionsSection.appendChild(firstGameInstruction);
const secondGameInstruction = document.createElement('p');
gameInstructionsSection.appendChild(secondGameInstruction);
const thirdGameInstruction = document.createElement('p');
gameInstructionsSection.appendChild(thirdGameInstruction);

function showGameInstructionsTotalArea(){
    selectLevelsTotalArea.classList.add('hidden');
    gameInstructionsTotalArea.classList.remove('hidden');
}

function hideGameInstructionsTotalArea(){
    gameInstructionsTotalArea.classList.add('hidden');
}
hideGameInstructionsTotalArea();

returnFromGameInstructionsAreaButton.innerHTML = '<i class="bi bi-arrow-90deg-left"></i>';
returnFromGameInstructionsAreaButton.addEventListener('click', () => {
    selectLevel();
    hideGameInstructionsTotalArea();
});

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

const soundEffects = {
    gameClear: new Howl({
        src: ['./audio/gameClear.mp3', './audio/gameClear.ogg'],
        volume: 0.2,
    }),
    levelClear: new Howl({
        src: ['./audio/levelClear.mp3', './audio/levelClear.ogg'],
        volume: 0.4
    }),
    gameOver: new Howl({
        src: ['./audio/gameOver.mp3', './audio/gameOver.ogg'],
        volume: 0.5
    }),
    fallingIntoBlackHole:  new Howl({
        src: ['./audio/fallingIntoBlackHole.mp3', './audio/fallingIntoBlackHole.ogg'],
        volume: 0.2
    }),
    forward: new Howl({
        src: ['./audio/forward.mp3', './audio/forward.ogg'],
        volume: 1.5
    }),
    turnRight: new Howl({
        src: ['./audio/turnRight.mp3', './audio/turnRight.ogg'],
        volume: 0.45
    }),
    turnLeft: new Howl({
        src: ['./audio/turnLeft.mp3', './audio/turnLeft.ogg'],
        volume: 0.15
    }),
    jump: new Howl({
        src: ['./audio/jump.mp3', './audio/jump.ogg'],
        volume: 0.45
    }),
    lightSwitch: new Howl({
        src: ['./audio/lightSwitch.mp3', './audio/jump.ogg'],
        volume: 0.4
    }),
    gameMusic: new Howl({
        src: ['./audio/gameMusic.mp3', './audio/gameMusic.ogg'],
        loop: true,
        rate: 0.95,
        volume: 0.4
    }),
};
let gameMusicIsPlaying = false;
let gameMusicPlayedForTheFirstTime = false;

function playGameMusicForTheFirstTime(){
    if (gameMusicPlayedForTheFirstTime === false){
        soundEffects.gameMusic.play();
        gameMusicIsPlaying = true;
        gameMusicPlayedForTheFirstTime = true;
    }
}

function playMusic(){
    if (gameMusicIsPlaying === false){
        soundEffects.gameMusic.play();
        gameMusicIsPlaying = true;
        if (translateTheGameButton.innerHTML === 'Português 🇧🇷'){
            musicOnOffButton.innerHTML = '<span>Music:</span><span>ON</span>';
        }
        else if (translateTheGameButton.innerHTML === 'English 🇺🇸'){
            musicOnOffButton.innerHTML = '<span>Música:</span><span>SIM</span>';
        }
        const spanOnOffMusic = document.querySelector('#playMusicButton span:nth-of-type(2)');
        spanOnOffMusic.style.backgroundColor = '';
    }
    else {
        soundEffects.gameMusic.stop();
        gameMusicIsPlaying = false;
        if (translateTheGameButton.innerHTML === 'Português 🇧🇷'){
            musicOnOffButton.innerHTML = '<span>Music:</span><span>OFF</span>';
        }
        else if (translateTheGameButton.innerHTML === 'English 🇺🇸'){
            musicOnOffButton.innerHTML = '<span>Música:</span><span>NÃO</span>';
        }
        const spanOnOffMusic = document.querySelector('#playMusicButton span:nth-of-type(2)');
        spanOnOffMusic.style.backgroundColor = 'red';
    } 
}