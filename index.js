const body = document.querySelector('body');
const grid = document.querySelector('#grid');

// CRIAR ROBÔ;
const robot = document.createElement('i');
robot.classList.add('bi', 'bi-android2');
robot.classList.add('robot-style');

// POSIÇÃO DO JOGADOR E A DIREÇÃO PARA ONDE ELE ESTÁ OLHANDO
const player = {
    alive: true,
    row: 0,
    column: 0,
    high: 0,
    direction: 'down', //up | right | down | left
};

const squaresArray = [];
let timeouts = [];
let gameRunning = false;
let level = 0;

//a= chao baixo| b= chao medio| c= chao alto| d= chao da luz | e= chao vazio
const maps = [
    //level 1
    [
        'aaeee',
        'ebeee',
        'eaead',
        'eaeae',
        'eaaae',
    ],
    //level 2
    [
        'aaeee',
        'ebcbe',
        'eeeae',
        'eeeae',
        'eeede',
    ],
    //level 3
    [
        'aaeee',    
        'ebbbe',
        'eeece',
        'ebcbe',
        'eaade',
    ],
];

function createBoard(){
    const currentMap = maps[level]; //seleciona o mapa
    grid.innerHTML = ""; // limpa antes de recriar

    for (let i = 0; i < currentMap.length; i++){
        for (let j = 0; j < currentMap[i].length; j++){
            const square = document.createElement('div');
            square.setAttribute('id', `square-${i}-${j}`); //square-i-j
            square.classList.add('square');

            const char = currentMap[i][j]; //seleciona o tipo de chao
            addMapElement(square, char, i, j);

            grid.appendChild(square);
            squaresArray.push(square);
        }
    }
}
createBoard();
console.log(squaresArray);

function addMapElement(square, char, i, j){
    switch(char){ // ADICIONEI PELO JAVASCRIPT AS CORES PARA FACILITAR ALTERAR E COMPARAR-


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

// RENDERIZA O JOGADOR NA TELA de acordo com O ID dos squares
function renderPlayer() { 
    const square = document.getElementById(`square-${player.row}-${player.column}`); 
    square.appendChild(robot);
}
renderPlayer(); 

// MOVE O JOGADOR NA TELA
function movePlayer() { 
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
    // desenha na nova posição 
    renderPlayer();
}

let currentAngle = 0;
function turnLeft() {
    robot.style.transition = 'transform 1s ease';
    if (player.direction === 'up'){
        player.direction = 'left';
        currentAngle -= 90;
        robot.style.transform = `rotate(${currentAngle}deg)`;
    }    
    else if (player.direction === 'left'){
        player.direction = 'down';
        currentAngle -= 90;
        robot.style.transform = `rotate(${currentAngle}deg)`;
    }
    else if (player.direction === 'down'){
        player.direction = 'right';
        currentAngle -= 90;
        robot.style.transform = `rotate(${currentAngle}deg)`;
    }
    else if (player.direction === 'right'){
        player.direction = 'up';
        currentAngle -= 90;
        robot.style.transform = `rotate(${currentAngle}deg)`;
    } 
}

function turnRight() {
    robot.style.transition = 'transform 1s ease';
    if (player.direction === 'up'){
        player.direction = 'right';
        currentAngle += 90;
        robot.style.transform = `rotate(${currentAngle}deg)`;
    } 
    else if (player.direction === 'right'){
        player.direction = 'down';
        currentAngle += 90;
        robot.style.transform = `rotate(${currentAngle}deg)`;
    } 
    else if (player.direction === 'down'){
        player.direction = 'left';
        currentAngle += 90;
        robot.style.transform = `rotate(${currentAngle}deg)`;
    } 
    else if (player.direction === 'left'){
        player.direction = 'up';
        currentAngle += 90;
        robot.style.transform = `rotate(${currentAngle}deg)`;
    } 
}

function executeCommands() {
    if (gameRunning == true) return;
    if (player.alive == false) return;
    gameRunning = true; 
    let delay = 0; // tempo entre comandos em ms 
    for (let cmd of commandsToExecuteOnMain) { //pega cada comando do array conforme o loop em que esta e coloca em cmd
        // se for P1, expande os comandos de P1 
        if (cmd === 'p1') { 
            for (let subCmd of commandsToExecuteOnP1) { 
                const id = setTimeout(() => runCommand(subCmd), delay);
                timeouts.push(id); 
                delay += (subCmd === 'forward' || subCmd === 'jump') ? 600 : 1200; //se é 'forward', espera 600ms, senão espera 1200ms
            } 
        } 
        // se for P2, expande os comandos de P2 
        else if (cmd === 'p2') { 
            for (let subCmd of commandsToExecuteOnP2) { 
                const id = setTimeout(() => runCommand(subCmd), delay);
                timeouts.push(id); 
                delay += (subCmd === 'forward' || subCmd === 'jump') ? 600 : 1200;
            } 
        } 
        // comandos normais 
        else{ 
            const id = setTimeout(() => runCommand(cmd), delay);
            timeouts.push(id); 
            delay += (cmd === 'forward' || cmd === 'jump') ? 600 : 1200;
        } 
    }
    delay += 1200;
    const endId = setTimeout(() => {
        gameRunning = false;
        if (player.alive == true){
            levelResult();
        }    
    }, delay);
    timeouts.push(endId);   
} 

// função para rodar um comando 
function runCommand(cmd) { 
    if (player.alive == false){
        return;
    }
    if (((cmd === 'forward' && isTheNextSquareLowerOrEqualPlayerHigh() == true) || (cmd === 'jump' && isTheNextSquareLowerOrEqualPlayerHigh() == false)) && isTheNextSquareOnTheMap() == true) {
        movePlayer();
        if (isTheSquareSafe() == false) {
            player.alive = false;
            gameRunning = false;
            timeouts.forEach(id => clearTimeout(id));
            timeouts = [];
            setTimeout(() => {
                robot.style.transition = 'transform 1.5s ease';
                robot.style.transform = 'scale(0) rotate(360deg)';
            }, 650)
            setTimeout(() => levelResult(), 1800);
            return;
        }
    }     
    if (cmd === 'left') turnLeft(); 
    if (cmd === 'right') turnRight(); 
    if (cmd === 'light') { 
        console.log("Acendeu a luz!"); 
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

function isTheNextSquareLowerOrEqualPlayerHigh(){
    updateCurrentPlayerHigh();
    if (player.high >= nextSquareHigh()){
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

// quando clicar no botão de executar: 
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
let displayMain = document.querySelector('#displayMain');
let displayP1 = document.querySelector('#displayP1');
let displayP2 = document.querySelector('#displayP2');

function transformCommands(command){
    switch (command){
        case 'forward':
            return '<i class="bi bi-arrow-up"></i>';
        case 'right':
            return '<i class="bi bi-arrow-90deg-right"></i>';
        case 'left':
            return '<i class="bi bi-arrow-90deg-left"></i>';       
        case 'light':
            return '<i class="bi bi-lightbulb-fill"></i>';
        case 'jump':
            return '<i class="bi bi-capslock-fill">';    
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
        displayMain.innerHTML = commandsToAppearOnMain.join(''); // .join('') adiciona o que estiver no parênteses entre os elementos do vetor, então ele ATUALIZA O VETOR!!!
        counter = 0;
    } 
    else { 
        commandsToAppearOnMain.push(transformCommands(command));
        commandsToExecuteOnMain.push(command);
        displayMain.innerHTML = commandsToAppearOnMain.join('');
        counter++; 
    }
    console.log(commandsToAppearOnMain); 
    console.log(commandsToExecuteOnMain);
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
        displayP1.innerHTML = commandsToAppearOnP1.join(''); // .join('') adiciona o que estiver no parênteses entre os elementos do vetor, então ele ATUALIZA O VETOR!!!
        counterP1 = 0;
    } 
    else { 
        commandsToAppearOnP1.push(transformCommands(command));
        commandsToExecuteOnP1.push(command);
        displayP1.innerHTML = commandsToAppearOnP1.join('');
        counterP1++; 
    }
    console.log(commandsToAppearOnP1); 
    console.log(commandsToExecuteOnP1);
}

function addP2Commands(command){
    if (command == 'p1' || command == 'p2'){
        addMainCommands(command);
        return;
    }
    if (command == 'undo' && counterP2 == 0){
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
        displayP2.innerHTML = commandsToAppearOnP2.join(''); // .join('') adiciona o que estiver no parênteses entre os elementos do vetor, então ele ATUALIZA O VETOR!!!
        counterP2 = 0;
    } 
    else { 
        commandsToAppearOnP2.push(transformCommands(command));
        commandsToExecuteOnP2.push(command);
        displayP2.innerHTML = commandsToAppearOnP2.join('');
        counterP2++; 
    }
    console.log(commandsToAppearOnP2); 
    console.log(commandsToExecuteOnP2);
}

function resetPlayerPosition(){
    player.row = 0;
    player.column = 0;
    player.direction = 'down';
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
    createBoard();
    resetPlayerPosition();
    renderPlayer();
    resetCommands();
    const resultOverlay = document.querySelector('#resultOverlay');
    resultOverlay.classList.add('hidden');
    const feedback = document.querySelector('#feedback');
    feedback.classList.add('hidden');
    const tryAgainButton = document.querySelector('#tryAgainBtn');
    tryAgainButton.classList.add('hidden');
}

function skipLevel(){
    console.log('skip');
    player.alive = true;
    gameRunning = false;
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    level++
    createBoard();
    resetPlayerPosition();
    renderPlayer();
    resetCommands();
    const resultOverlay = document.querySelector('#resultOverlay');
    resultOverlay.classList.add('hidden');
    const feedback = document.querySelector('#feedback');
    feedback.classList.add('hidden');
    const tryAgainButton = document.querySelector('#tryAgainBtn');
    tryAgainButton.classList.add('hidden');
    const skipLevelButton = document.querySelector('#skipLevelBtn');
    skipLevelButton.classList.add('hidden');
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
    const resultOverlay = document.querySelector('#resultOverlay');
    resultOverlay.classList.add('hidden');
    const feedback = document.querySelector('#feedback');
    feedback.classList.add('hidden');
    const tryAgainButton = document.querySelector('#tryAgainBtn');
    tryAgainButton.classList.add('hidden');
    const skipLevelButton = document.querySelector('#skipLevelBtn');
    skipLevelButton.classList.add('hidden');
    if(allTilesHaveBeenLit() == true && player.alive == true){
        feedback.style.color = 'yellow';
        feedback.textContent = 'LEVEL CLEAR';
        resultOverlay.classList.remove('hidden');
        feedback.classList.remove('hidden');
        skipLevelButton.classList.remove('hidden');
    }
    else {
        feedback.style.color = 'red';
        feedback.textContent = 'GAME OVER';
        resultOverlay.classList.remove('hidden');
        feedback.classList.remove('hidden');
        tryAgainButton.classList.remove('hidden');
    }
}