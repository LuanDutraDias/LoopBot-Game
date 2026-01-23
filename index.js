const grid = document.querySelector('#grid');
// CRIAR ROBÔ;
const robot = document.createElement('i');
robot.classList.add('bi', 'bi-android2');

const squaresArray = [];
let gameRunning = true;
let level = 0;

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
    switch(char){
        case 'a':
            square.classList.add('ground-low');
            break;
        case 'b':
            square.classList.add('ground-medium');
            break;
        case 'c':
            square.classList.add('ground-high');
            break;  
        case 'd':
            square.classList.add('ground-light');
            break;      
        case 'e':
            square.classList.add('ground-empty');
            break;      
    }
}



// POSIÇÃO DO JOGADOR E A DIREÇÃO PARA ONDE ELE ESTÁ OLHANDO
const player = {
    row: 0,
    column: 0,
    direction: 'right', //up | right | down | left
};

// RENDERIZA O JOGADOR NA TELA de acordo com O ID dos squares
function renderPlayer() { 
    const square = document.getElementById(`square-${player.row}-${player.column}`); 
    square.appendChild(robot);
}

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
robot.style.transition = 'transform 1s ease';
function turnLeft() {
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
    delay = 0; // tempo entre comandos em ms
    for (let cmd of commandsToExecute) { 
        setTimeout(() => {
        if (cmd === 'forward'){
            movePlayer();
        }     
        if (cmd === 'left'){
            turnLeft(); 
        } 
        if (cmd === 'right'){
            turnRight(); 
        } 
        if (cmd === 'light') { 
            // exemplo: acender luz
            console.log("Acendeu a luz!");
            const currentSquare = document.getElementById(`square-${player.row}-${player.column}`);
            if (currentSquare.style.backgroundColor == 'rgb(255, 255, 0)'){
                currentSquare.style.backgroundColor = '';
            }
            else {
                currentSquare.style.backgroundColor = 'rgb(255, 255, 0)';
            }
        } 
    }, delay); 
    
    if (cmd === 'forward'){
        delay += 600; // milisegundo entre cada comando 
    }
    else {
        delay += 1200;
    }
    }
}

renderPlayer(); 
// quando clicar no botão de executar: 
document.querySelector('#executeBtn').addEventListener('click', executeCommands);

let commandsToExecute = [];
let commandsToAppear = [];
let commandsToExecuteP1 = [];
let commandsToAppearP1 = [];
let commandsToExecuteP2 = [];
let commandsToAppearP2 = [];
let counter = 0;
let counterP1 = 0;
let counterP2 = 0;
let displayMain = document.querySelector('#displayMain');
let displayP1 = document.querySelector('#displayProc1');
let displayP2 = document.querySelector('#displayProc2');

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
        commandsToAppear.pop();
        commandsToExecute.pop();
        displayMain.innerHTML = commandsToAppear.join(''); 
        counter--;
    } else if (command == 'reset'){
        commandsToAppear = [];
        commandsToExecute = [];
        displayMain.innerHTML = commandsToAppear.join(''); // .join('') adiciona o que estiver no parênteses entre os elementos do vetor, então ele ATUALIZA O VETOR!!!
        counter = 0;
    } 
    else { 
        commandsToAppear.push(transformCommands(command));
        commandsToExecute.push(command);
        displayMain.innerHTML = commandsToAppear.join('');
        counter++; 
    }
    console.log(commandsToAppear); 
    console.log(commandsToExecute);
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
        commandsToAppearP1.pop();
        commandsToExecuteP1.pop();
        displayP1.innerHTML = commandsToAppearP1.join(''); 
        counterP1--;
    } else if (command == 'reset'){
        commandsToAppearP1 = [];
        commandsToExecuteP1 = [];
        displayP1.innerHTML = commandsToAppearP1.join(''); // .join('') adiciona o que estiver no parênteses entre os elementos do vetor, então ele ATUALIZA O VETOR!!!
        counterP1 = 0;
    } 
    else { 
        commandsToAppearP1.push(transformCommands(command));
        commandsToExecuteP1.push(command);
        displayP1.innerHTML = commandsToAppearP1.join('');
        counterP1++; 
    }
    console.log(commandsToAppearP1); 
    console.log(commandsToExecuteP1);
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
        commandsToAppearP2.pop();
        commandsToExecuteP2.pop();
        displayP2.innerHTML = commandsToAppearP2.join(''); 
        counterP2--;
    } else if (command == 'reset'){
        commandsToAppearP2 = [];
        commandsToExecuteP2 = [];
        displayP2.innerHTML = commandsToAppearP2.join(''); // .join('') adiciona o que estiver no parênteses entre os elementos do vetor, então ele ATUALIZA O VETOR!!!
        counterP2 = 0;
    } 
    else { 
        commandsToAppearP2.push(transformCommands(command));
        commandsToExecuteP2.push(command);
        displayP2.innerHTML = commandsToAppearP2.join('');
        counterP2++; 
    }
    console.log(commandsToAppearP2); 
    console.log(commandsToExecuteP2);
}

function restartLevel(){
    player.row = 0;
    player.column = 0;
    renderPlayer();
    commandsToAppear = [];
    commandsToExecute = [];
    commandsToAppearP1 = [];
    commandsToExecuteP1 = [];
    commandsToAppearP2 = [];
    commandsToExecuteP2 = [];
    displayMain.innerHTML = commandsToAppear.join('');
    displayP1.innerHTML = commandsToAppearP1.join('');
    displayP2.innerHTML = commandsToAppearP2.join('');
}

function forward(){
}