const alphabet = "ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՈՒՓՔՕՖ".split('');
let currentLevelIndex = 1;
let selectedCell = null;
let activeMapping = {};

// Helper: Creates a basic 20x20 grid layout with letters
// (0 means a black block, letters are the hidden answers)
function generateGridShape(level) {
    let grid = Array(20).fill(null).map(() => Array(20).fill('0'));
    
    let allLevels = [
        [ // Niveau 1
            { row: 2, col: 2, dir: 'H', text: "ԲԱՐԵՎ" },
            { row: 2, col: 4, dir: 'V', text: "ՐՈՊԵ" },
            { row: 5, col: 4, dir: 'H', text: "ԵՐԵՎԱՆ" },
            { row: 3, col: 8, dir: 'V', text: "ՀԱՅԱՍՏԱՆ" }
        ],
        [ // Niveau 2
            { row: 4, col: 4, dir: 'H', text: "ԱՐԵՎ" },
            { row: 4, col: 5, dir: 'V', text: "ՐԱՖՖԻ" },
            { row: 8, col: 3, dir: 'H', text: "ԳԻՐՔ" }
        ]
    ];

    // Boucle pour revenir au niveau 1 si tous les niveaux sont terminés
    let words = allLevels[(level - 1) % allLevels.length];

    words.forEach(w => {
        for(let i=0; i<w.text.length; i++) {
            let r = w.dir === 'H' ? w.row : w.row + i;
            let c = w.dir === 'H' ? w.col + i : w.col;
            grid[r][c] = w.text[i];
        }
    });
    return grid;
}

// Randomly maps numbers 1-39 to the Armenian alphabet
function createRandomMapping() {
    let numbers = Array.from({length: 39}, (_, i) => i + 1);
    numbers.sort(() => Math.random() - 0.5); // Shuffle numbers
    
    let map = {};
    let reverseMap = {};
    alphabet.forEach((letter, i) => {
        map[numbers[i]] = letter;
        reverseMap[letter] = numbers[i];
    });
    return { map, reverseMap };
}

function loadLevel() {
    document.getElementById('level-title').innerText = "Խաչբառ - Level " + currentLevelIndex;
    document.getElementById('message').innerText = "";
    document.getElementById('next-btn').style.display = "none";
    selectedCell = null;

    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = '';
    
    const gridShape = generateGridShape(currentLevelIndex);
    const mappings = createRandomMapping();
    activeMapping = mappings.map;
    const reverseMap = mappings.reverseMap;

    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
            const cellLetter = gridShape[r][c];
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            
            if (cellLetter === '0') {
                cellDiv.classList.add('black');
            } else {
                // Look up the random number for this letter
                const num = reverseMap[cellLetter];

                const numSpan = document.createElement('span');
                numSpan.classList.add('number');
                numSpan.innerText = num;
                cellDiv.appendChild(numSpan);
                
                const letterSpan = document.createElement('span');
                letterSpan.classList.add('letter');
                cellDiv.appendChild(letterSpan);

                cellDiv.dataset.expected = cellLetter;
                cellDiv.onclick = () => selectCell(cellDiv);
            }
            gridContainer.appendChild(cellDiv);
        }
    }
    buildKeyboard();
}

function buildKeyboard() {
    const kbContainer = document.getElementById('keyboard');
    kbContainer.innerHTML = '';
    alphabet.forEach(letter => {
        const btn = document.createElement('div');
        btn.classList.add('key');
        btn.innerText = letter;
        btn.onclick = () => typeLetter(letter);
        kbContainer.appendChild(btn);
    });
}

function selectCell(cellDiv) {
    if (selectedCell) selectedCell.classList.remove('selected');
    selectedCell = cellDiv;
    selectedCell.classList.add('selected');
}

function typeLetter(letter) {
    if (!selectedCell) return;
    
    const targetNumber = selectedCell.querySelector('.number').innerText;
    const allCells = document.querySelectorAll('.cell:not(.black)');
    
    // On remplit toutes les cases qui ont le même numéro
    allCells.forEach(cell => {
        if (cell.querySelector('.number').innerText === targetNumber) {
            const letterSpan = cell.querySelector('.letter');
            letterSpan.innerText = letter;
            
            if (letter === cell.dataset.expected) {
                cell.classList.remove('incorrect');
                cell.classList.add('correct');
            } else {
                cell.classList.remove('correct');
                cell.classList.add('incorrect');
            }
        }
    });
    checkWin();
}

function checkWin() {
    const cells = document.querySelectorAll('.cell:not(.black)');
    let allCorrect = true;
    let completelyFilled = true;

    cells.forEach(cell => {
        const letter = cell.querySelector('.letter').innerText;
        if (!letter) completelyFilled = false;
        if (!cell.classList.contains('correct')) allCorrect = false;
    });

    if (allCorrect && completelyFilled) {
        document.getElementById('next-btn').style.display = "inline-block";
    }
}

function nextLevel() {
    currentLevelIndex++;
    loadLevel();
}

// Start the game
loadLevel();

// Ajout du support pour le clavier physique
document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (alphabet.includes(key)) {
        typeLetter(key);
    }
});