const gameBoard = (() => {    
    const board = [
    "", "", "",
    "", "", "",
    "", "", ""
    ];

    return {
        board
    };
})();

function Player(name, marker) {
    let score = 0;
    return {
        name, 
        marker,
        getScore: () => score,
        addScore: () => score++
    };
};

const gameController = (() => {  
    let players = [];
    let currentRound= 1;
    let totalRounds = 0;
    let isGameOver = false;
    let activePlayerIndex = 0;
    const boardState = gameBoard.board;
    let gameStarted = false;

    function startGame(playerOneName, playerTwoName, rounds) {
        const playerOne = Player(playerOneName, "X");
        const playerTwo = Player(playerTwoName, "O");

        players = [playerOne, playerTwo];

        totalRounds = rounds;
        currentRound = 1;
        activePlayerIndex = 0;

        gameStarted = true;
        resetGame();
    };

    function getCurrentPlayer() {
        return players[activePlayerIndex];
    };

    function switchTurn() {
        if (activePlayerIndex === 0) {
            activePlayerIndex = 1;
        } else {
            activePlayerIndex = 0;
        };
    };

    function playMove(index) {
        const board = boardState;
        if (!gameStarted) {
            return;
        }

        if (isGameOver) {
            return;
        };

        if (board[index] !== "") {
            return;
        }; 

        const currentPlayer = getCurrentPlayer();
        board[index] = currentPlayer.marker;

        if (checkWins()) {
            isGameOver = true;
            currentPlayer.addScore();
            return {
                type: "win",
                player: currentPlayer
            };
        }
        else if (checkDraw()) {
            isGameOver = true;
            return {
                type: "draw"
            };
        }
        else {
            switchTurn();
        };
    };

    function checkWins() {
        const board = boardState;
        
        if(board[0] !== "" && board[0] === board[1] && board[1] === board[2]) {
            return true;
        }
        else if(board[3] !== "" && board[3] === board[4] && board[4] === board[5]) {
            return true;
        }
        else if(board[6] !== "" && board[6] === board[7] && board[7] === board[8]) {
            return true;
        }
        else if(board[0] !== "" && board[0] === board[3] && board[3] === board[6]) {
            return true;
        }
        else if(board[1] !== "" && board[1] === board[4] && board[4] === board[7]) {
            return true;
        }
        else if(board[2] !== "" && board[2] === board[5] && board[5] === board[8]) {
            return true;
        }
        else if(board[0] !== "" && board[0] === board[4] && board[4] === board[8]) {
            return true;
        }
        else if(board[2] !== "" && board[2] === board[4] && board[4] === board[6]) {
            return true;
        };

        return false;       
    };

    function checkDraw() {
        const board = boardState;        
        if (!board.includes("") && !checkWins()) {
            return true;
        };
        return false;
    };

    function resetGame() {
        const board = boardState; 
        for (let i = 0; i < board.length; i++) {
            board[i] = "";
        };
        activePlayerIndex = 0;
        isGameOver = false;
    };
    
    function getPlayers() {
        return players;
    };
    function nextRound() {
        currentRound++;
        
        if (currentRound <= totalRounds) {
            resetGame();
            return true;
        }
        return false;
    };
    
    function getCurrentRound() {
        return currentRound;
    }

    function getMatchWinner() {
        if (players[0].getScore() > players[1].getScore()) {
            return players[0];
        }
        if (players[1].getScore() > players[0].getScore()) {
            return players[1];
        }

        return null;
    };

    return {
        startGame,
        playMove,
        resetGame,
        nextRound,
        getMatchWinner,
        getPlayers,
        getCurrentRound
    };
})();


const displayController = (() => {
    const cells = document.querySelectorAll(".board button")
    const restartBtn = document.querySelector("#restart");
    const message = document.querySelector("#message");
    const score = document.querySelector("#score");
    const playerOneInput = document.querySelector("#player-one-name");
    const playerTwoInput = document.querySelector("#player-two-name");
    const roundsInput = document.querySelector("#rounds");
    const startButton = document.querySelector("#start");
    const nextRoundBtn = document.querySelector("#next-round");
    const turn = document.querySelector("#turn");
    const round = document.querySelector("#round");

    nextRoundBtn.style.display = "none";

    startButton.addEventListener("click", () => {
        if (gameController.getPlayers().length > 0) {
            return;
        }

        const playerOneName = playerOneInput.value || "Player 1";
        const playerTwoName = playerTwoInput.value || "Player 2";
        const rounds = Number(roundsInput.value) || 1;

        gameController.startGame(
            playerOneName, playerTwoName, rounds
        );

        render();
        updateTurn();
        updateScore();
        updateMessage(`Round ${gameController.getCurrentRound()}`);
        updateRound();
    });
    

    restartBtn.addEventListener("click", () => {
        gameController.resetGame();
        displayController.render();
        updateMessage("");
        turn.textContent = "";
        updateScore();
    });

    function updateTurn() {
        const player = gameController.getCurrentPlayer();

        turn.textContent = `${player.name}'s turn (${player.marker})`;
    };

    function render() {
        cells.forEach((cell, index) => {
            cell.textContent = gameBoard.board[index];
        });
    };

    cells.forEach((cell, index) => {
        cell.addEventListener("click", () => {
            const result = gameController.playMove(index);
            render();
            if (result?.type === "win") {
                updateMessage(`${result.player.name} wins round ${gameController.getCurrentRound()}`);

                updateScore();
                nextRoundBtn.style.display = "block";
            }
            else if (result?.type === "draw") {
                updateMessage(`Round ${gameController.getCurrentRound()} is a draw`);
                nextRoundBtn.style.display = "block";
            };
        });
    });

    function updateMessage(text) {
        message.textContent = text;
    };

    function updateScore() {
        const players = gameController.getPlayers();

        score.textContent = `${players[0].name}: ${players[0].getScore()} | ${players[1].name}: ${players[1].getScore()}`
    };

    function updateRound() {
        round.textContent = `Round ${gameController.getCurrentRound()}`;
    };

    nextRoundBtn.addEventListener("click", () => {

        const hasNextRound = gameController.nextRound();

        if (hasNextRound) {
            render();
            nextRoundBtn.style.display = "none";

            updateMessage(`Round ${gameController.getCurrentRound()}`)
        } else {
            const winner = gameController.getMatchWinner();

            if (winner) {
                updateMessage(`${winner.name} wins the match!`);
                turn.textContent = ";"
            } else {
                updateMessage("The match is a draw!");
            };

           updateRound();
        };
    });
    return {
        render
    };
})();

