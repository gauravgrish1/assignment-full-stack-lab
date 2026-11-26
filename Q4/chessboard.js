let board = document.getElementById("chessboard");

// Chess pieces
let pieces = [
    "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜",
    "♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙",
    "♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"
];

// Create 64 squares
for (let i = 0; i < 64; i++) {
    let square = document.createElement("div");
    let row = Math.floor(i / 8);
    let column = i % 8;

    square.className = `square ${(row + column) % 2 === 0 ? "light" : "dark"}`;
    square.setAttribute("role", "gridcell");
    square.textContent = pieces[i];

    if (pieces[i] !== "") {
        square.classList.add(i < 16 ? "black-piece" : "white-piece");
    }

    board.appendChild(square);
}

