document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const statusText = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    let currentPlayer = 'X';
    let gameActive = true;
    let boardState = Array(16).fill('');

    const winningConditions = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [0, 5, 10, 15],
        [3, 6, 9, 12]
    ];

    board.addEventListener('click', (e) => {
        if (statusText.innerText !== "Thinking...") {
            const cell = e.target;
            const index = cell.getAttribute('data-index');

            if (cell.classList.contains('cell') && gameActive && boardState[index] === '') {
                boardState[index] = currentPlayer;
                playAudio(3);
                cell.textContent = currentPlayer;
                cell.style.transform = "scale(1.1)";
                setTimeout(() => cell.style.transform = "scale(1)", 300);
                updateStatus(0);
                makeEngineMove(boardState);


            }
        }
    });

    resetButton.addEventListener('click', resetGame);

    function updateStatus(yourMove) {
        if (yourMove) statusText.innerText = "Your Move, " + currentPlayer;
        else statusText.innerText = "Thinking...";
    }

    function highlightWinningCells(cells) {
        cells.forEach((index) => {
            const cell = getCellByIndex(index);
            cell.classList.add('highlight'); // Add the animation class
    
            // Optional: Remove the class after the animation ends to reset
            setTimeout(() => {
                cell.classList.remove('highlight');
            }, 600); // Match the duration of the CSS animation
        });
    }

    function highlightDraw() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell) => {
            cell.classList.add('draw-highlight'); // Add draw animation class
    
            // Remove the class after the animation ends
            setTimeout(() => {
                cell.classList.remove('draw-highlight');
            }, 1000); // Match the duration of the CSS animation (1 second)
        });
    }
    
    function playAudio(audioInd) {
        let audios = ["winAudio", "drawAudio", "highAudio", "lowAudio"]
        const audio = document.getElementById(audios[audioInd]);
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }

    function checkWinner(thePlayer) {
        let roundWon = false;
        for (let condition of winningConditions) {
            const [a, b, c, d] = condition;
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c] && boardState[a] === boardState[d]) {
                roundWon = true;
                highlightWinningCells([a,b,c,d])
                break; // Exit loop if a winner is found
            }
        }
        if (roundWon) {
            const scores = getScore(); // Get scores object
            let playerScore = scores.playerScore;
            let computerScore = scores.computerScore;
            let tie = scores.tie;
            if (currentPlayer === thePlayer) {
                statusText.textContent = `Player wins!`;
                updateScore(playerScore+1,computerScore,tie);
                playAudio(0);
            } else { 
                statusText.textContent = `Computer wins!`;
                updateScore(playerScore,computerScore+1,tie);
                playAudio(0);
            }
            gameActive = false;
            return 0;
        } else if (!boardState.includes('')) {
            statusText.textContent = `It's a draw!`;
            highlightDraw();
            gameActive = false;
            const scores = getScore(); // Get scores object
            let playerScore = scores.playerScore;
            let computerScore = scores.computerScore;
            let tie = scores.tie;
            updateScore(playerScore,computerScore,tie+1);
            playAudio(1)
            return 0;
        }
        return 1;
    }

    function resetGame() {
        boardState = Array(16).fill('');
        gameActive = true;
        statusText.textContent = ``;
        document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
        if (currentPlayer === "X") {
            currentPlayer = "O";
            engineMoveIndex = getRandomNumber(0,15)
            let cellE = getCellByIndex(engineMoveIndex)
            cellE.textContent = "X";
            boardState[engineMoveIndex] = "X";
            cellE.style.transform = "scale(1.1)";
            setTimeout(() => cellE.style.transform = "scale(1)", 300);
            updateStatus(1)

       } else {
        currentPlayer = "X"
       }
    }

    function getNextMove(board, player = 'O') {
        return nextMove(board,player);
    }



    function getCellByIndex(index) {
        // Ensure the index is within the valid range
        if (index < 0 || index > 15) {
            console.error('Index out of bounds. Please provide an index between 0 and 15.');
            return null;
        }

        // Use querySelector to find the cell with the specified index
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        return cell;
    }


    function makeEngineMove(boardState) {
        enginesMove = (currentPlayer === 'O') ? 'X' : 'O';
        setTimeout(() => {
            if (checkWinner(enginesMove)) {
                updateStatus();
                move = getNextMove(boardState, enginesMove)
                let engineMoveIndex = move.move.row * 4 + move.move.column;
                let cellE = getCellByIndex(engineMoveIndex)
                cellE.textContent = enginesMove;
                boardState[engineMoveIndex] = enginesMove;
                playAudio(2);
                cellE.style.transform = "scale(1.1)";
                setTimeout(() => cellE.style.transform = "scale(1)", 300);
                updateStatus(1);
                checkWinner(currentPlayer);
                    
                
            }
        }, getRandomNumber(200,400));
    }
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});



















function checkWinner(board) {
    // Check rows
    for (let row of board) {
        if (new Set(row).size === 1 && row[0] !== " ") {
            return row[0]; // Return the winner (X or O)
        }
    }

    // Check columns
    for (let col = 0; col < 4; col++) {
        if (new Set([board[0][col], board[1][col], board[2][col], board[3][col]]).size === 1 && board[0][col] !== " ") {
            return board[0][col]; // Return the winner
        }
    }

    // Check diagonals
    if (new Set([board[0][0], board[1][1], board[2][2], board[3][3]]).size === 1 && board[0][0] !== " ") {
        return board[0][0]; // Return the winner
    }
    if (new Set([board[0][3], board[1][2], board[2][1], board[3][0]]).size === 1 && board[0][3] !== " ") {
        return board[0][3]; // Return the winner
    }

    return null; // No winner yet
}

function minimax(board, depth, isMaximizing) {

    // Limit the depth
    if (depth > 3) {
        return 0;  // Arbitrary depth limit; adjust as needed
    }
    const winner = checkWinner(board);
    if (winner === "X") {
        return -10 + depth;  // X wins
    }
    if (winner === "O") {
        return 10 - depth;   // O wins
    }
    if (board.flat().every(cell => cell !== " ")) {
        return 0;  // Draw
    }
    

    if (isMaximizing) {
        let bestScore = Infinity; // O tries to lose
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === " ") {
                    const newBoard = board.map(row => row.slice()); // Create a copy
                    newBoard[i][j] = "O";  // O's move
                    const score = minimax(newBoard, depth + 1, false);
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = -Infinity; // X tries to win
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === " ") {
                    const newBoard = board.map(row => row.slice()); // Create a copy
                    newBoard[i][j] = "X";  // X's move
                    const score = minimax(newBoard, depth + 1, true);
                    bestScore = Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    }
}

function findBestMove(board, player) {
    const isMaximizing = (player === "O");
    let bestScore = isMaximizing ? Infinity : -Infinity;
    let move = [-1, -1];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === " ") {
                board[i][j] = player;  // Current player's move
                const score = minimax(board, 0, !isMaximizing);
                board[i][j] = " ";  // Undo move
                if ((isMaximizing && score < bestScore) || (!isMaximizing && score > bestScore)) {
                    bestScore = score;
                    move = [i, j];
                }
            }
        }
    }
    return move;
}

function nextMove(databoard, dataplayer = "O") {
    const board = [[], [], [], []]; // Fixed initialization
    let j = 0;

    for (let cell of databoard) {
        if (board[j].length >= 4) { // Corrected condition
            j++;
        }
        board[j].push(cell === "" ? " " : cell);
    }

    const player = dataplayer; // Default to 'O' if not specified
    const bestMove = findBestMove(board, player);
    return { move: { row: bestMove[0], column: bestMove[1] } };
}






// Function to set a cookie
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// Function to get a cookie
function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (const cookie of cookieArr) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) {
            return decodeURIComponent(value); // Decode to handle special characters
        }
    }
    return null;
}

// Function to update the score
function updateScore(playerScore, computerScore, tie) {
    const score = `${playerScore}:${computerScore}:${tie}`;
    setCookie('gameScore', score, 777); // Store score for 777 days
    const scores = document.getElementById("scores");
    if (scores) {
        scores.innerText = `Scores: Player ${playerScore} | Computer ${computerScore} | Ties ${tie}`; // Improved formatting
    }
}

// Function to retrieve the score
function getScore() {
    const score = getCookie('gameScore');
    if (score) {
        const [playerScore, computerScore, tie] = score.split(':').map(Number);
        return {
            playerScore: isNaN(playerScore) ? 0 : playerScore,
            computerScore: isNaN(computerScore) ? 0 : computerScore,
            tie: isNaN(tie) ? 0 : tie
        };
    }
    return { playerScore: 0, computerScore: 0, tie: 0 }; // Default to 0 if no score is found
}

// Example usage
let { playerScore, computerScore, tie } = getScore();


updateScore(playerScore, computerScore, tie); // Update the scores